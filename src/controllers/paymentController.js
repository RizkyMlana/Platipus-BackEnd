import midtransClient from 'midtrans-client';
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { events } from '../db/schema/events.js';


/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a payment for fast track event
 *     description: EO can create a payment for fast track. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID of the event to pay for fast track
 *     responses:
 *       200:
 *         description: Payment successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *       400:
 *         description: Event already fast track or validation error
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const createPayment = async (req, res) => {
    try {
        const eoId = req.user.id;
        const { eventId } = req.body;

        const [event] = await db
            .select()
            .from(events)
            .where(eq(events.id, eventId));
        if (!event || event.eo_id !== eoId){
            return res.status(403).json({ message: "Unauthorized"});
        }
        if (event.fast_track) {
            return res.status(400).json({ message: "Event already fast track"});
        }

        const amount = 50000;

        const orderId = `PAY-${crypto.randomUUID()}`;

        const snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRAS_SERVER_KEY,
        });
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            costumer_details: {
                first_name: req.user.name,
                email: req.user.email,
            },
            item_details: [
                {
                    id: "FASTTRACK",
                    price: amount,
                    quantity: 1,
                    name: "Fast Track Event",
                },
            ],
        };
        const snapRes = await snap.createTransaction(parameter);

        const [payment] = await db
            .insert(payments)
            .values({
                event_id: eventId,
                eo_id: eoId,
                amount,
                status: "PENDING",
                snap_token: snapRes.token,
                snap_redirect_url: snapRes.redirect_url,
                midtrans_order_id: orderId,
            })
            .returning();
        res.json({
            message: "Payment created",
            payment
        })
    } catch(err) {
        console.error("createPayment error:", err)
        res.status(500).json({ message: err.message});
    }
}

/**
 * @swagger
 * /payments/callback:
 *   post:
 *     summary: Handle payment gateway callback
 *     description: Endpoint for Midtrans callback. Verifies signature and updates payment status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               status_code:
 *                 type: string
 *               gross_amount:
 *                 type: number
 *               transaction_status:
 *                 type: string
 *               signature_key:
 *                 type: string
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *       403:
 *         description: Invalid signature
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

export const handlePaymentCallback = async (req, res) => {
  try {
    const body = req.body;

    const signature = crypto
      .createHash("sha512")
      .update(
        body.order_id +
        body.status_code +
        body.gross_amount +
        process.env.MIDTRANS_SERVER_KEY
      )
      .digest("hex");

    if (signature !== body.signature_key) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    // ambil payment
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.midtrans_order_id, body.order_id));

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    let newStatus = "PENDING";

    if (body.transaction_status === "settlement") {
      newStatus = "PAID";
    } else if (body.transaction_status === "expire") {
      newStatus = "FAILED";
    } else if (body.transaction_status === "cancel") {
      newStatus = "FAILED";
    }

    // update payment
    await db
      .update(payments)
      .set({
        status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // kalau berhasil → aktifkan fast track
    if (newStatus === "PAID") {
      await db
        .update(events)
        .set({ is_fasttrack: true })
        .where(eq(events.id, payment.event_id));
    }

    return res.json({ message: "OK" });
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /payments/me:
 *   get:
 *     summary: Get EO's payment history
 *     description: Returns a list of payments made by the authenticated EO.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */

export const getMyPayments = async (req, res) => {
  try {
    const eoId = req.user.id;

    const list = await db
      .select()
      .from(payments)
      .where(eq(payments.eo_id, eoId))
      .orderBy(payments.created_at);

    res.json({
      message: "Success",
      payments: list,
    });
  } catch (err) {
    console.error("getMyPayments error:", err);
    res.status(500).json({ message: err.message });
  }
};