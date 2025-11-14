import { Router } from 'express';
import { createEvent } from '../controllers/eventController.js';
import { authMiddleware} from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/events/create', authMiddleware, createEvent);

export default router;