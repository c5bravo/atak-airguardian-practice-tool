import { int, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export interface Waypoint {
  latitude: number;
  longitude: number;
}

export const AircraftTable = sqliteTable("aircrafttable", {
  id: int().primaryKey(),
  aircraftId: text().unique().notNull(),
  speed: int().notNull(),
  altitude: int().notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
  additionalinfo: text().notNull(),
  heading: real().notNull(),
  waypoints: text({ mode: "json" }).$type<Waypoint[]>().notNull(),
  waypointindex: int().notNull(),
  sposLat: int().notNull(),
  sposLng: int().notNull(),

  isExited: int("isExited", { mode: "boolean" })
    .notNull()
    .default(false),
});

export type SelectAircraft = typeof AircraftTable.$inferSelect;
export type InsertAircraft = typeof AircraftTable.$inferInsert;
