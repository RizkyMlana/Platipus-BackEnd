import { Router } from 'express';
import authRoutes from './authRoutes.js';
import eventRoutes from './eventRoutes.js';
import profileRoutes from './profileRoutes.js';
import sponsorRoutes from './sponsorRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import mastertableRoutes from "./mastertableRoutes.js";

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/profile', profileRoutes);
router.use('/sponsor', sponsorRoutes);
router.use('/payments', paymentRoutes);
router.use('/master', mastertableRoutes);

export default router;
