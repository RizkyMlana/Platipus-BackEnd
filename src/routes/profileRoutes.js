import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { uploadImage } from "../middlewares/multer.js";


const router = Router();

router.get('/',authMiddleware, getProfile);

router.put('/', authMiddleware, uploadImage.single('profile_picture'), updateProfile);

export default router;