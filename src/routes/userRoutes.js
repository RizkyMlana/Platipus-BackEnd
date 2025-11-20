import { Router } from 'express';
import { getProfile } from '../controllers/userController.js';

const router = Router();

router.get('/me', getProfile);

export default router;