import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { events } from "./event.js";

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }),
  status: varchar("status", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});
