import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Public Qloo catalog facts only. No user, chat, notes, or relationship records.
export const tryCatalog = sqliteTable('try_catalog', {
  entityId: text('entity_id').primaryKey(),
  item: text('item').notNull(),
  expiresAt: integer('expires_at').notNull(),
}, table => [index('try_catalog_expiry_idx').on(table.expiresAt)]);
