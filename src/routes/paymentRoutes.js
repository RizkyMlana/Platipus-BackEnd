import { Router } from "express";
import { createPayment, handlePaymentCallback, getMyPayments} from "../controllers/paymentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();


router.post('/:eventId', authMiddleware, roleMiddleware('EO'), createPayment);
router.post('/callback/midtrans', handlePaymentCallback);
router.get('/me', authMiddleware, roleMiddleware('EO'), getMyPayments);

export default router;