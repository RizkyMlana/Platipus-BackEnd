import { pgTable, uuid, varchar, timestamp, text} from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { sponsorProfiles } from "./users.js";


export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  event_id: uuid('event_id').references(() => events.id).notNull(),
  submission_type: varchar('submission_type', { length: 50 }).notNull(),
  pdf_url: varchar('pdf_url', {length: 500}).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});


export const proposalSponsors = pgTable('proposal_sponsors', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposal_id: uuid('proposal_id').references(() => proposals.id).notNull(),
  sponsor_id: uuid('sponsor_id').references(() => sponsorProfiles.id).notNull(),
  status: varchar('status', { length: 50 }).default('Pending'),
  feedback: text('feedback'),
  created_at: timestamp('created_at').defaultNow(),
});
