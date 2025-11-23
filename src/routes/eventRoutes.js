import { Router } from 'express';
import { createEvent, updateEvent, getAllEvent, deleteEvent, getDetailEvent } from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {roleMiddleware} from '../middlewares/roleMiddleware.js';

const router = Router();

router.post('/create', authMiddleware, roleMiddleware('EO'), createEvent );
router.put('/:id', authMiddleware, roleMiddleware('EO'), updateEvent);
router.delete('/:id', authMiddleware, roleMiddleware('EO'),deleteEvent);
router.get('/', authMiddleware, getAllEvent);
router.get('/:id', authMiddleware, getDetailEvent);

export default router;