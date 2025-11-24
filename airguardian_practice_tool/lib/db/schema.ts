import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Aircrafttable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  aircraftId: text().notNull(),
  position: text().notNull(),
  speed: text().notNull(),
  direction: int().notNull(),
  altitude: text().notNull(),
  details: text().notNull()
});