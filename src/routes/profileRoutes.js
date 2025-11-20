import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { getProfile } from "../controllers/userController.js";
import { getMyEvents } from "../controllers/eventController.js";


const router = Router();

router.get('/me',authMiddleware, getProfile);
router.get('/events', authMiddleware, roleMiddleware('EO'), getMyEvents);

export default router;