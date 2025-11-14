import {pgTable, integer, varchar, timestamp, text, numeric, uuid} from 'drizzle-orm/pg-core';
import { sponsorCategories, sponsorTypes, sponsorScopes} from './masterTable.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: varchar('role', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  google_id: text('google_id'),
  sponsor_category_id: integer('sponsor_category_id').references(() => sponsorCategories.id),
  sponsor_type_id: integer('sponsor_type_id').references(() => sponsorTypes.id),
  sponsor_scope_id: integer('sponsor_scope_id').references(() => sponsorScopes.id),
  budget_min: numeric('budget_min'),
  budget_max: numeric('budget_max'),
  sponsor_status: varchar('sponsor_status', { length: 50 }), // 'Open' / 'Close'
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
