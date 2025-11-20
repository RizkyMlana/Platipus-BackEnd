import { pgTable, uuid, varchar, timestamp, text} from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { users } from "./users.js";

export const proposals = pgTable('proposals', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }), 
  status: varchar('status', { length: 50 }).default('Pending'),
  event_id: uuid('event_id').references(() => events.id).notNull(),
  sponsor_id: uuid('sponsor_id').references(() => users.id).notNull(),
  feedback: text('feedback'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
