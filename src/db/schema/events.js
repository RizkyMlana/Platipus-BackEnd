import {pgTable, uuid, text, varchar, timestamp, integer, boolean} from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { eventCategories, eventSizes, eventModes, eventSponsorTypes} from './masterTable.js';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eo_id: uuid('eo_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  target: varchar('target', { length: 255 }),
  requirements: text('requirements'),
  description: text('description'),
  proposal_url: text('proposal_url'),  // PDF uploaded by EO
  fast_track: boolean('fast_track').default(false),  // if EO paid
  start_time: timestamp('start_time'),
  end_time: timestamp('end_time'),
  category_id: integer('category_id').references(() => eventCategories.id),
  sponsor_type_id: integer('sponsor_type_id').references(() => eventSponsorTypes.id),
  size_id: integer('size_id').references(() => eventSizes.id),
  mode_id: integer('mode_id').references(() => eventModes.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
