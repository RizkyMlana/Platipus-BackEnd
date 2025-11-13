import {pgTable, uuid, text, varchar, timestamp} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    name: varchar('name', {length: 150}),
    category: varchar('category', {length: 100}),
    location: varchar('location', {length: 255}),
    sponsorType: varchar("sponsor_type", { length: 100 }),
    target: varchar("target", { length: 100 }),
    eventSize: varchar("event_size", { length: 50 }),
    eventMode: varchar("event_mode", { length: 50 }),
    requirements: text('requirements'),
    desc: text("desc"),
    proposalUrl: text("proposal_url"),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),
    createdAt: timestamp("created_at").defaultNow(),
})