import { Router } from 'express';
import { authMiddleware} from '../middlewares/authMiddleware.js';
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { createProposal, getFastTrackProposals, feedbackProposal, sendProposalToSponsor} from '../controllers/proposalController.js';
import { upload } from "../middlewares/multer.js";

const router = Router();

/**
 * @swagger
 * /proposals:
 *   post:
 *     summary: Upload a proposal
 *     description: EO can upload a proposal PDF for an event. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - submission_type
 *               - file
 *             properties:
 *               eventId:
 *                 type: integer
 *               submission_type:
 *                 type: string
 *                 enum: [fasttrack, regular]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Proposal uploaded successfully
 *       400:
 *         description: Missing fields or invalid file type
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authMiddleware, roleMiddleware('EO'), upload.single("pdf"), createProposal);
/**
 * @swagger
 * /proposals/{proposalId}/send/{sponsorId}:
 *   post:
 *     summary: Send a proposal to a sponsor
 *     description: EO can send a proposal to a sponsor. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sponsorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Proposal sent successfully
 *       400:
 *         description: Missing fields
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Proposal not found
 *       409:
 *         description: Proposal already sent to this sponsor
 *       500:
 *         description: Internal server error
 */
router.post('/:proposalId/send/:sponsorId', authMiddleware, roleMiddleware('EO'), sendProposalToSponsor);
/**
 * @swagger
 * /proposals/fasttrack:
 *   get:
 *     summary: Get fast track proposals for sponsor
 *     description: Sponsor can fetch all fast track proposals assigned to them. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fast track proposals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 proposals:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */

router.get('/fasttrack/me', authMiddleware, roleMiddleware('SPONSOR'), getFastTrackProposals);
/**
 * @swagger
 * /proposals/{id}/feedback:
 *   post:
 *     summary: Submit feedback on a proposal
 *     description: Sponsor can submit feedback and update status of a proposal. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *               - status
 *             properties:
 *               feedback:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, Accepted, Rejected]
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Proposal not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/feedback', authMiddleware, roleMiddleware('SPONSOR'), feedbackProposal);



export default router;