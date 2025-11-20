import { Router } from 'express';
import { createEvent, updateEvent, getAllEvent,deleteEvent } from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {roleMiddleware} from '../middlewares/roleMiddleware.js';

const router = Router();

router.post('/events/create', authMiddleware, roleMiddleware('EO'), createEvent );
router.put('/events/:id', authMiddleware, roleMiddleware('EO'),updateEvent);
router.delete('/events/:id', authMiddleware, roleMiddleware('EO'),deleteEvent);
router.get('/events', authMiddleware, getAllEvent);

export default router;