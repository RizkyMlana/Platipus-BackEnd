import { Router } from 'express';
import { createEvent, updateEvent, getAllEvent, deleteEvent, getDetailEvent, getMyEvents } from '../controllers/eventController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { uploadEventAssets} from '../middlewares/multer.js';
import {submitEvent, getIncomingEventsForSponsor, getSubmittedSponsorsByEO, getSubmittedSponsorsFastTrackByEO } from "../controllers/eventsponsorController.js";

const router = Router();

router.post('/', authMiddleware, uploadEventAssets, roleMiddleware('EO'), createEvent);
router.put('/:eventId', authMiddleware, uploadEventAssets, roleMiddleware('EO'), updateEvent);
/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     description: EO can delete their own event by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found or unauthorized
 *       500:
 *         description: Internal server error
 */

router.delete('/:eventId', authMiddleware, roleMiddleware('EO'), deleteEvent);
/**
 * @swagger
 * /events/me:
 *   get:
 *     summary: Get events of the logged-in EO
 *     description: Fetch all events created by the authenticated EO.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events of the EO
 *       500:
 *         description: Internal server error
 */
router.get('/me', authMiddleware, roleMiddleware('EO'), getMyEvents);
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     description: Public endpoint to fetch all events with joined category, sponsor type, size, and mode.
 *     responses:
 *       200:
 *         description: List of events
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllEvent);
/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get event details
 *     description: Fetch detailed info of an event by ID.
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get('/:eventId', getDetailEvent);

router.get('/:id/submit', authMiddleware, submitEvent);
router.get('/incoming', authMiddleware, getIncomingEventsForSponsor);
// router.get('/')


export default router;