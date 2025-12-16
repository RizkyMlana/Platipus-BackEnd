import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import { getAllSponsors, updateProposalStatus} from '../controllers/sponsorController.js';

const router = Router();



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

router.get("/all", authMiddleware, roleMiddleware('EO'), getAllSponsors)

export default router; 