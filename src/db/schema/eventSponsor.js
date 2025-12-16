import {pgTable, uuid, text, varchar, timestamp,} from 'drizzle-orm/pg-core';
import { events } from './events';
import { sponsorProfiles } from './users';


export const eventSponsors = pgTable("eventSponsors", {
  id: uuid("id").defaultRandom().primaryKey(),
  event_id: uuid("event_id").references(() => events.id).notNull(),
  sponsor_id: uuid("sponsor_id").references(() => sponsorProfiles.id).notNull(),
  submission_type: varchar("submission_type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("PENDING"), 
  feedback: text("feedback"),
  created_at: timestamp("created_at").defaultNow(),
});
