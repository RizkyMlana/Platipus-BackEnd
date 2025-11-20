import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import profileRoutes from './profileRoutes.js';
import sponsorRoutes from './sponsorRoutes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/events', eventRoutes);
router.use('/profile', profileRoutes);
router.use('/sponsor', sponsorRoutes);

export default router;
