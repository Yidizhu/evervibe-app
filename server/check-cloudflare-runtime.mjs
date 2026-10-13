import './tests/offline.cjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { build } from 'esbuild';
import { createD1CatalogStore } from './catalog-store.mjs';
import { createEverVibeRuntime } from './generated/evervibe-runtime.mjs';

const origin = 'https://evervibe.zesty-mesa-1831.chatgpt.site';
const film = '11111111-1111-4111-8111-111111111111';
const artist = '22222222-2222-4222-8222-222222222222';
const place = '33333333-3333-4333-8333-333333333333';
const request = (route, input) => new Request(origin + route, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(input),
});
async function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(await readFile(new URL('../drizzle/0000_motionless_post.sql', import.meta.url), 'utf8'));
  return {
    sqlite,
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return { bind(...args) { return {
        first: async () => statement.get(...args) ?? null,
        run: async () => statement.run(...args),
      }; } };
    },
  };
}

test('D1 schema and store persist only validated public facts and respect expiration', async () => {
  const db = await database(); let now = 1000;
  try {
    const store = createD1CatalogStore(db, { now: () => now });
    await store.set(film, { expires: 2000, item: { id: film, type: 'movie', title: 'A Film', year: 2001, note: 'DO_NOT_STORE' }, messages: 'DO_NOT_STORE' });
    assert.deepEqual(await store.get(film), { expires: 2000, item: { id: film, type: 'movie', title: 'A Film', year: 2001 } });
    const row = db.sqlite.prepare('SELECT * FROM try_catalog').get();
    assert(!JSON.stringify(row).includes('DO_NOT_STORE')); assert.deepEqual(Object.keys(row).sort(), ['entity_id', 'expires_at', 'item']);
    await assert.rejects(store.set(film, { expires: 2000, item: { id: artist, type: 'person', title: 'Invalid' } }), TypeError);
    now = 2001; assert.equal(await store.get(film), null);
    const controller = new AbortController(); controller.abort();
    await assert.rejects(store.get(film, { signal: controller.signal }), /cancelled/);
  } finally { db.sqlite.close(); }
});

test('Worker runtime composes real adapters using injected offline providers across two instances', async () => {
  const db = await database(), calls = [];
  const env = { QLOO_API_KEY: 'offline-qloo-fixture', GEMINI_API_KEY: 'offline-gemini-fixture' };
  const fetch = async (input, init) => {
    const url = new URL(input); calls.push({ url, init });
    if (url.origin === 'https://hackathon.api.qloo.com') {
      if (url.pathname === '/search') {
        const music = url.searchParams.get('types') === 'urn:entity:artist';
        return Response.json({ results: [{ entity_id: music ? artist : film, name: music ? 'Provider Musician' : 'Provider Film', subtype: music ? 'urn:entity:artist' : 'urn:entity:movie', properties: { release_year: 2001 } }] });
      }
      assert.equal(url.pathname, '/v2/insights');
      assert.equal(url.searchParams.get('signal.interests.entities'), `${film},${artist}`);
      assert(!url.href.includes('PRIVATE_MOOD'));
      return Response.json({ results: { entities: [{ entity_id: place, name: 'Provider Museum', subtype: 'urn:entity:place', location: { lat: 51.5074, lon: -0.1278 }, properties: { geocode: { country_code: 'GB', city: 'London' }, description: 'A collection of paintings.' }, tags: [{ id: 'urn:tag:genre:place:museum', name: 'Museum' }] }] } });
    }
    assert.equal(url.origin, 'https://generativelanguage.googleapis.com');
    assert.equal(url.pathname, '/v1beta/interactions');
    const body = JSON.parse(init.body); assert.equal(body.store, false);
    const routing = !!body.response_format?.schema?.properties?.intent;
    const output = routing
      ? { intent: 'activity', mode: 'common', text: '', mood: 'gentle', duration: 'few-hours', interests: ['art'] }
      : { text: 'Choose one painting each and trade stories.', selections: [{ id: place, reason: 'A shared starting point for your film and music interests.', activity: 'Choose one work each and explain what draws you in.' }] };
    return Response.json({ status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'text', text: JSON.stringify(output) }] }] });
  };
  try {
    const settings = { env, fetch, catalogStore: createD1CatalogStore(db), allowedOrigins: [origin] };
    const first = createEverVibeRuntime(settings);
    for (const type of ['movie', 'artist']) assert.equal((await first(request('/api/try/search', { query: type, type, locale: 'en' }))).status, 200);
    const second = createEverVibeRuntime({ ...settings, catalogStore: createD1CatalogStore(db) });
    const input = { locale: 'en', city: 'london', consent: true, vibes: { you: { entities: [film], note: 'PRIVATE_MOOD_YOU' }, partner: { entities: [artist], note: 'PRIVATE_MOOD_PARTNER' } }, messages: [{ from: 'you', text: 'Find a small art activity together.' }] };
    const response = await second(request('/api/try/assist', input)); assert.equal(response.status, 200);
    const body = await response.json(); assert.equal(body.source, 'qloo'); assert.equal(body.items[0].title, 'Provider Museum'); assert.equal(body.seeds.length, 2);
    assert.equal(calls.filter(c => c.url.pathname === '/search').length, 2);
    assert.equal(calls.filter(c => c.url.pathname === '/v2/insights').length, 1);
    assert.equal(calls.filter(c => c.url.pathname === '/v1beta/interactions').length, 2);
    const rows = db.sqlite.prepare('SELECT * FROM try_catalog').all(); assert(!JSON.stringify(rows).includes('PRIVATE_MOOD')); assert(!JSON.stringify(rows).includes('offline-'));
    const before = calls.length;
    assert.equal((await second(request('/api/try/assist', { ...input, consent: false }))).status, 403);
    assert.equal((await second(new Request('https://other.example/api/try/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }))).status, 403);
    assert.equal(calls.length, before);
  } finally { db.sqlite.close(); }
});

test('missing runtime keys are explicit and never invoke a provider', async () => {
  let calls = 0; const handler = createEverVibeRuntime({ env: {}, fetch: async () => { calls++; throw new Error('Unexpected provider'); }, allowedOrigins: [origin] });
  const status = await handler(new Request(origin + '/api/status')); const body = await status.json();
  assert.equal(body.qloo.configured, false); assert.equal(body.gemini.configured, false);
  assert.equal((await handler(request('/api/try/search', { query: 'Film', type: 'movie', locale: 'en' }))).status, 503);
  assert.equal(calls, 0);
});

test('bundled runtime is independent of Node and deployment route is importable with cloud bindings', async () => {
  const code = await readFile(new URL('./generated/evervibe-runtime.mjs', import.meta.url), 'utf8');
  assert(!/process\.env|node:|require\(['"](?:fs|http|crypto)/.test(code));
  const bundled = await build({
    entryPoints: [fileURLToPath(new URL('../app/api/[...path]/route.ts', import.meta.url))],
    bundle: true, write: false, platform: 'browser', format: 'esm', target: 'es2022', logLevel: 'silent',
    plugins: [{ name: 'offline-cloudflare-binding', setup(build) {
      build.onResolve({ filter: /^cloudflare:workers$/ }, () => ({ path: 'binding', namespace: 'fixture' }));
      build.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const env = {};', loader: 'js' }));
    } }],
  });
  const route = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
  const response = await route.GET(new Request(origin + '/api/status')); assert.equal(response.status, 200);
  const unavailable = await route.POST(request('/api/try/search', {})); assert.equal(unavailable.status, 503); assert.equal((await unavailable.json()).error.code, 'TRY_CATALOG_UNAVAILABLE');
  const crossOrigin = await route.POST(new Request(origin + '/api/try/search', { method: 'POST', headers: { Origin: 'http://127.0.0.1:5173', 'Content-Type': 'application/json' }, body: '{}' }));
  assert.equal(crossOrigin.status, 403, 'Origin is checked before missing D1 status');
});
