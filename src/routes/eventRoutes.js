import { Router } from 'express';
import { createEvent, updateEvent, getAllEvent,deleteEvent } from '../controllers/eventController.js';
import { authMiddleware} from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/events/create', authMiddleware, createEvent);
router.put('/events/:id', authMiddleware, updateEvent);
router.get('/events', authMiddleware, getAllEvent);
router.delete('/events/:id', authMiddleware, deleteEvent);


export default router;