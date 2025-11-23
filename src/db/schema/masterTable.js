import { pgTable, varchar, integer } from "drizzle-orm/pg-core";

export const eventCategories = pgTable('event_categories', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const eventSponsorTypes = pgTable('event_sponsor_types', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const eventSizes = pgTable('event_sizes', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const eventModes = pgTable('event_modes', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

// Sponsor dropdown master
export const sponsorCategories = pgTable('sponsor_categories', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const sponsorTypes = pgTable('sponsor_types', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export const sponsorScopes = pgTable('sponsor_scopes', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});