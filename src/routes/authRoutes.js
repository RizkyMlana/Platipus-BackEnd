import { Router } from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.post('/google',loginWithGoogle);
router.get('/profile', authMiddleware, getProfile);
router.get('/test', (req, res) => {
    res.json({ message: "Auth Route ok"});
});

export default router;
