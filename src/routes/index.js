import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import profileRoutes from './profileRoutes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/events', eventRoutes);
router.use('/profile', profileRoutes);

export default router;
