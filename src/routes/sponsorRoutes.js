import { Router } from 'express';
import { getDetailEvent } from "../controllers/eventController.js"
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/events/:id', authMiddleware, roleMiddleware('SPONSOR'), getDetailEvent);

export default router; 