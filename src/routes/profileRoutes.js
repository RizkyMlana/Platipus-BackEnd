import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { uploadImage } from "../middlewares/multer.js";


const router = Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Fetch the authenticated user's profile including EO or Sponsor profile details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     role:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     profile_picture_url:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 profile:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/',authMiddleware, getProfile);
/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update authenticated user's profile. Supports EO and Sponsor specific fields. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_picture_url:
 *                 type: string
 *                 nullable: true
 *               organization_name:
 *                 type: string
 *                 nullable: true
 *               website:
 *                 type: string
 *                 nullable: true
 *               organization_address:
 *                 type: string
 *                 nullable: true
 *               company_name:
 *                 type: string
 *                 nullable: true
 *               company_address:
 *                 type: string
 *                 nullable: true
 *               industry:
 *                 type: string
 *                 nullable: true
 *               social_media:
 *                 type: string
 *                 nullable: true
 *               sponsor_category_id:
 *                 type: integer
 *                 nullable: true
 *               sponsor_type_id:
 *                 type: integer
 *                 nullable: true
 *               sponsor_scope_id:
 *                 type: integer
 *                 nullable: true
 *               budget_min:
 *                 type: number
 *                 nullable: true
 *               budget_max:
 *                 type: number
 *                 nullable: true
 *               status:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invalid role
 *       500:
 *         description: Internal server error
 */
router.put('/', authMiddleware, uploadImage.single('profile_picture'), updateProfile);

export default router;