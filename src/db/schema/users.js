import {pgTable, varchar, timestamp, text, jsonb, uuid, integer, numeric} from 'drizzle-orm/pg-core';
import { sponsorCategories, sponsorTypes, sponsorScopes} from './masterTable.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: varchar('role', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  profile_picture_url: text('profile_picture_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
export const eoProfiles = pgTable('eo_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull().unique(),
  organization_name: varchar('organization_name', { length: 255 }).notNull(),
  organization_address: varchar('organization_address', { length: 255 }),
  website: varchar('website', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
export const sponsorProfiles = pgTable('sponsor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull().unique(),
  company_name: varchar('company_name', { length: 255 }).notNull(),
  company_address: varchar('company_address', { length: 255 }),
  industry: varchar('industry', { length: 255 }),
  website: varchar('website', { length: 255 }),
  social_media: jsonb('social_media'),
  sponsor_category_id: integer('sponsor_category_id').references(() => sponsorCategories.id),
  sponsor_type_id: integer('sponsor_type_id').references(() => sponsorTypes.id),
  sponsor_scope_id: integer('sponsor_scope_id').references(() => sponsorScopes.id),
  budget_min: numeric('budget_min'),
  budget_max: numeric('budget_max'),
  status: varchar('status', {length: 50}).default('Closed'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

