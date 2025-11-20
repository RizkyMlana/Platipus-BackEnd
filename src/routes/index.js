import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/profile', eventRoutes, userRoutes);

export default router;
