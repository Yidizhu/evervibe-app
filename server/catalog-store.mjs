const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TYPES = new Set(['movie', 'artist', 'book']);
const cancelled = signal => { if (signal?.aborted) throw new Error('Catalog request cancelled.'); };

function publicEntry(id, entry) {
  const source = entry?.item;
  if (!ID.test(id) || source?.id !== id || !TYPES.has(source?.type) ||
      typeof source?.title !== 'string' || !source.title.trim() || source.title.length > 160 ||
      !Number.isSafeInteger(entry?.expires) || entry.expires <= 0) {
    throw new TypeError('Invalid public catalog entry.');
  }
  const item = { id, title: source.title.replace(/[\u0000-\u001f\u007f]/g, ' ').trim(), type: source.type };
  if (!item.title) throw new TypeError('Invalid public catalog title.');
  if (Number.isInteger(source.year) && source.year >= 1000 && source.year <= 2100) item.year = source.year;
  return { expires: entry.expires, item };
}

// Shared across Worker isolates; never accepts chat, notes, relationship data or credentials.
export function createD1CatalogStore(database, { now = Date.now } = {}) {
  if (!database || typeof database.prepare !== 'function') throw new TypeError('D1 catalog binding is required.');
  let lastCleanup = 0;
  return {
    async get(id, { signal } = {}) {
      cancelled(signal);
      if (!ID.test(id)) throw new TypeError('Invalid catalog identity.');
      const row = await database.prepare('SELECT item, expires_at FROM try_catalog WHERE entity_id = ? AND expires_at > ? LIMIT 1')
        .bind(id, now()).first();
      cancelled(signal);
      if (!row) return null;
      try { return publicEntry(id, { expires: row.expires_at, item: JSON.parse(row.item) }); }
      catch { return null; }
    },
    async set(id, entry, { signal } = {}) {
      cancelled(signal);
      const safe = publicEntry(id, entry);
      await database.prepare('INSERT INTO try_catalog (entity_id, item, expires_at) VALUES (?, ?, ?) ON CONFLICT(entity_id) DO UPDATE SET item = excluded.item, expires_at = excluded.expires_at')
        .bind(id, JSON.stringify(safe.item), safe.expires).run();
      cancelled(signal);
      // An indexed, bounded cleanup keeps expired public entities from accumulating.
      if (now() - lastCleanup >= 60 * 60 * 1000) {
        lastCleanup = now();
        await database.prepare('DELETE FROM try_catalog WHERE entity_id IN (SELECT entity_id FROM try_catalog WHERE expires_at <= ? ORDER BY expires_at LIMIT 256)')
          .bind(now()).run();
        cancelled(signal);
      }
    },
  };
}
