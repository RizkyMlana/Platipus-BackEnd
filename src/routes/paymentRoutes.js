import { Router } from "express";
import { createPayment, handlePaymentCallback, getMyPayments} from "../controllers/paymentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

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
router.post('/:eventId', authMiddleware, roleMiddleware('EO'), createPayment);
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
router.post('/callback/midtrans', handlePaymentCallback);
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
router.get('/me', authMiddleware, roleMiddleware('EO'), getMyPayments);


export default router;