import { pgTable, uuid, text, numeric, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { proposals } from "./proposals.js";

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  proposal_id: uuid('proposal_id')
    .references(() => proposals.id)
    .notNull(),
  order_id: text('order_id'),
  gross_amount: numeric('gross_amount'),
  payment_type: varchar('payment_type', { length: 50 }),
  status: varchar('status', { length: 50 }),
  payment_response: jsonb('payment_response'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

