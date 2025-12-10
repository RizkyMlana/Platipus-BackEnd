import { Router } from 'express';
import { authMiddleware} from '../middlewares/authMiddleware.js';
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { createProposal, getFastTrackProposals, feedbackProposal, sendProposalToSponsor} from '../controllers/proposalController.js';
import { upload } from "../middlewares/multer.js";

const router = Router();


router.post('/', authMiddleware, roleMiddleware('EO'), upload.single("pdf"), createProposal);
router.post('/:proposalId/send/:sponsorId', authMiddleware, roleMiddleware('EO'), sendProposalToSponsor);
router.get('/fasttrack/me', authMiddleware, roleMiddleware('SPONSOR'), getFastTrackProposals);
router.post('/:proposalId/feedback', authMiddleware, roleMiddleware('SPONSOR'),feedbackProposal);



export default router;