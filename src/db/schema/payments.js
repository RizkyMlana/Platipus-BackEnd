import { pgTable, uuid, text, numeric, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { proposals } from "./proposals.js";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }),
  orderId: text("order_id").unique(),
  grossAmount: numeric("gross_amount"),
  paymentType: varchar("payment_type", { length: 100 }),
  status: varchar("status", { length: 50 }).default("PENDING"),
  midtransRespons: jsonb("midtrans_respons"),
  createdAt: timestamp("created_at").defaultNow(),
});
