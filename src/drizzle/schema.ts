// import { sql } from 'drizzle-orm';
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core';

// Use this command to push changes to external DB:
// npx drizzle-kit push:sqlite

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  salt: text('salt').notNull().unique(),
  iv: text('iv').notNull(),
  vault: text('vault').notNull(),
});

export const share = sqliteTable('share', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipient: text('recipient').notNull(),
  sharedEntry: text('sharedEntry').notNull(),
})

