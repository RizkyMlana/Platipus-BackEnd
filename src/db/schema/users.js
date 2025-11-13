import {pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    role: varchar('role', {length: 50}),
    name: varchar('name', {length: 100}),
    email: varchar('email', { length: 150}).unique(),
    no: varchar('no', {length: 20}),
    password: varchar('password', {length: 255}),
    createdAt: timestamp('created_at').defaultNow(),
})
