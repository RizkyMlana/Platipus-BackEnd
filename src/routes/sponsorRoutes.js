import { Router } from 'express';
import { getEventDetail } from '../controllers/sponsorController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/events/:id', authMiddleware, roleMiddleware('SPONSOR'), getEventDetail);

export default router; 