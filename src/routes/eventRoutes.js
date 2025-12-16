import { Router } from 'express';
import { createEvent, updateEvent, getAllEvent, deleteEvent, getDetailEvent, getMyEvents } from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { uploadEventAssets} from '../middlewares/multer.js';
import {submitEvent, getIncomingEventsForSponsor, getSponsorsByEO } from "../controllers/eventsponsorController.js";

const router = Router();

router.post('/', authMiddleware, uploadEventAssets, roleMiddleware('EO'), createEvent);
router.put('/:eventId', authMiddleware, uploadEventAssets, roleMiddleware('EO'), updateEvent);
router.delete('/:eventId', authMiddleware, roleMiddleware('EO'), deleteEvent);
router.get('/me', authMiddleware, roleMiddleware('EO'), getMyEvents);
router.get('/', getAllEvent);
router.get('/sponsors', authMiddleware, getSponsorsByEO);

router.get('/:eventId', getDetailEvent);

router.post('/:eventId/submit', authMiddleware, submitEvent);


export default router;