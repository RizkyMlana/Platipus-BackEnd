import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { getAllSponsors, reviewIncomingEvent} from '../controllers/sponsorController.js';
import { getIncomingEventsForSponsor } from '../controllers/eventsponsorController.js';

const router = Router();

router.get("/all", authMiddleware, roleMiddleware('EO'), getAllSponsors)
router.get("/events-incoming", authMiddleware, roleMiddleware("SPONSOR"), getIncomingEventsForSponsor);
router.post("/events-incoming/:eventSponsorId/review", reviewIncomingEvent);

export default router; 