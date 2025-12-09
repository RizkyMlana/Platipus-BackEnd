import { Router } from 'express';
import { createEvent, updateEvent, getAllEvent, deleteEvent, getDetailEvent, getMyEvents } from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, createEvent, roleMiddleware('EO'));
router.put('/:eventId', authMiddleware, roleMiddleware('EO'),updateEvent);
router.delete('/:eventId', authMiddleware, roleMiddleware('EO'),deleteEvent);
router.get('/me', authMiddleware, roleMiddleware('EO'), getMyEvents);

router.get('/', getAllEvent);
router.get('/:eventId', getDetailEvent);

export default router;