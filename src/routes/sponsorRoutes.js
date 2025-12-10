import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { getIncomingProposals, getProposalDetail, getRecommendedEvents, updateProposalStatus} from '../controllers/sponsorController.js';

const router = Router();

router.get("/proposals/incoming", authMiddleware, roleMiddleware('SPONSOR'), getIncomingProposals);
router.get("/proposals/:proposalSponsorId", authMiddleware, roleMiddleware('SPONSOR'), getProposalDetail);
router.put("/proposals/:proposalSponsorId/status", authMiddleware, roleMiddleware('SPONSOR'), updateProposalStatus);
router.get("/recommended-events", authMiddleware, roleMiddleware('SPONSOR'), getRecommendedEvents);

export default router; 