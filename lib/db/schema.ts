import { int, sqliteTable, text, real, blob } from "drizzle-orm/sqlite-core";
import { Waypoint } from "@/app/page";

export const Aircrafttable = sqliteTable("aircrafttable", {
  id: text().primaryKey(),
  speed: int().notNull(),
  altitude: int().notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  additionalinfo: text().notNull(),
  heading: real().notNull(),
  waypoints: text().notNull(),
  waypointindex: int().notNull(),
  sposLat: int().notNull(),
  sposLng: int().notNull(),
});

export type SelectAircraft = typeof Aircrafttable.$inferSelect;
export type InsertAircraft = typeof Aircrafttable.$inferInsert;
