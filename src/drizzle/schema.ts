import { sql } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer('id').primaryKey(),
  username: text("username").notNull().unique(),
  salt: text('salt').notNull().unique(),
  iv: text('iv').notNull(),
  vault: text('vault').notNull(),
});
