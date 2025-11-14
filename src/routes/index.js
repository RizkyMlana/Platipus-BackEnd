import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', eventRoutes);

export default router;
