import { Router } from 'express';
import {authMiddleware, roleMiddleware} from '../middlewares/index.js';
import { createProposal} from '../controllers/proposalController.js';

const router = Router();

router.post('/', authMiddleware, roleMiddleware('EO', createProposal));