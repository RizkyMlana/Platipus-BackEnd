import { Router } from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.post('/google',loginWithGoogle);
router.get('/profile', authMiddleware, getProfile);

export default router;
