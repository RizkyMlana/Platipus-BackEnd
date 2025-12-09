import { Router } from 'express';
import {authMiddleware, roleMiddleware} from '../middlewares/index.js';
import { createProposal, getFastTrackProposals, feedbackProposal} from '../controllers/proposalController.js';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('EO', createProposal));
router.get('/fastrack', authMiddleware, getFastTrackProposals);
router.put('/:id/feedback', authMiddleware, roleMiddleware('SPONSOR', feedbackProposal));