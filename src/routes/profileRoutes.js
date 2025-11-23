import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { getMyEvents } from "../controllers/eventController.js";


const router = Router();

router.get('/',authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);

router.get('/events', authMiddleware, roleMiddleware('EO'), getMyEvents);

export default router;