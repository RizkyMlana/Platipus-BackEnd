import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { getIncomingProposals, getProposalDetail, getRecommendedEvents, updateProposalStatus} from '../controllers/sponsorController.js';

const router = Router();

/**
 * @swagger
 * /sponsor/proposals:
 *   get:
 *     summary: Get incoming proposals for sponsor
 *     description: Sponsor can fetch all incoming proposals with optional filters (status, submission_type, from, to). Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: submission_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of proposals
 *       404:
 *         description: Sponsor profile not found
 *       500:
 *         description: Internal server error
 */

router.get("/proposals/", authMiddleware, roleMiddleware('SPONSOR'), getIncomingProposals);
/**
 * @swagger
 * /sponsor/proposals/{proposalSponsorId}:
 *   get:
 *     summary: Get detailed proposal info
 *     description: Sponsor can fetch details of a proposal by proposalSponsorId. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalSponsorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proposal detail
 *       404:
 *         description: Sponsor profile or proposal not found
 *       500:
 *         description: Internal server error
 */

router.get("/proposals/:proposalSponsorId", authMiddleware, roleMiddleware('SPONSOR'), getProposalDetail);
/**
 * @swagger
 * /sponsor/proposals/{proposalSponsorId}/status:
 *   patch:
 *     summary: Update status of a proposal
 *     description: Sponsor can update status (Accepted, Rejected, Pending) and provide feedback for fasttrack proposals. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: proposalSponsorId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected, Pending]
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proposal status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Sponsor profile or proposal not found
 *       500:
 *         description: Internal server error
 */
router.put("/proposals/:proposalSponsorId/status", authMiddleware, roleMiddleware('SPONSOR'), updateProposalStatus);
/**
 * @swagger
 * /sponsor/recommended-events:
 *   get:
 *     summary: Get recommended events for sponsor
 *     description: Sponsor can fetch events recommended based on their profile. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended events
 *       404:
 *         description: Sponsor profile not found
 *       500:
 *         description: Internal server error
 */
router.get("/recommended-events", authMiddleware, roleMiddleware('SPONSOR'), getRecommendedEvents);

export default router; 