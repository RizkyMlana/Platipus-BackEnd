import { Router } from 'express';
import { authMiddleware} from '../middlewares/authMiddleware.js';
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { createProposal, getFastTrackProposals, feedbackProposal, sendProposalToSponsor} from '../controllers/proposalController.js';

const router = Router();


router.post('/', authMiddleware, roleMiddleware('EO'), createProposal);
router.post('/:proposalId/send/:sponsorId', authMiddleware, roleMiddleware('EO'), sendProposalToSponsor);
router.get('/fasttrack/me', authMiddleware, roleMiddleware('EO'), getFastTrackProposals);
router.post('/:proposalId/feedback', authMiddleware, roleMiddleware('EO'),feedbackProposal);



export default router;