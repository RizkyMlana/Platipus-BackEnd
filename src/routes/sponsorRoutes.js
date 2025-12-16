import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { getAllSponsors} from '../controllers/sponsorController.js';
import { getIncomingEventsForSponsor } from '../controllers/eventsponsorController.js';

const router = Router();

router.get("/all", authMiddleware, roleMiddleware('EO'), getAllSponsors)
router.get("/events-incoming", authMiddleware, roleMiddleware("SPONSOR"), getIncomingEventsForSponsor)

export default router; 