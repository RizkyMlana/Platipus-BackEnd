import { proposals, proposalSponsors } from '../db/schema/proposals.js';
import { eoProfiles } from '../db/schema/users.js';
import { db } from '../db/index.js';
import { eq, and} from 'drizzle-orm';
import { events } from '../db/schema/events.js';
import { supa } from '../config/storage.js';


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

export const createProposal = async (req, res) => {
    try {
        const eoId = req.user.id;
        const { eventId, submission_type } = req.body;

        if (!eventId || !submission_type || !req.file) {
            return res.status(400).json({ message: "Missing Fields" });
        }
        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "File must be pdf" });
        }

        const [event] = await db.select()
            .from(events)
            .where(eq(events.id, eventId));

        if (!event || event.eo_id !== eoId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const fileName = `proposal-${eventId}-${Date.now()}.pdf`;
        const storagePath = `proposal/${fileName}`;

        const { data: uploadData, error: uploadError } = await supa.storage
            .from("Platipus")
            .upload(storagePath, req.file.buffer, {
                contentType: "application/pdf",
            });

        if (uploadError) {
            console.error("SUPABASE UPLOAD ERROR:", uploadError);
            throw uploadError;
        }

        const { data: publicData } = supa.storage
            .from("Platipus")
            .getPublicUrl(storagePath);

        const publicUrl = publicData.publicUrl;

        const [created] = await db.insert(proposals)
            .values({
                event_id: eventId,
                submission_type,
                pdf_url: publicUrl,
            })
            .returning();

        res.status(201).json({
            message: "Proposal Uploaded",
            proposal: created,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};


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

export const sendProposalToSponsor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { proposalId, sponsorId } = req.params;

    if (!proposalId || !sponsorId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // pastikan user adalah EO
    const eoProfile = await db.query.eoProfiles.findFirst({
      where: eq(eoProfiles.user_id, userId),
    });

    if (!eoProfile) {
      return res.status(403).json({ message: "Only EO can send proposals" });
    }

    const proposal = await db.query.proposals.findFirst({
      where: eq(proposals.id, proposalId),
    });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const event = await db.query.events.findFirst({
      where: eq(events.id, proposal.event_id),
    });
    

    if (!event || event.eo_id !== eoProfile.id) {
        
      return console.log({
            eoProfileId: eoProfile.id,
            eventEoId: event.eo_id,
            userIdFromToken: userId
        }); 
        // res.status(403).json({ message: "Unauthorized" });
    }

    // validasi sponsor
    const sponsorProfile = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.id, sponsorId),
    });

    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor not found" });
    }

    const existing = await db.query.proposalSponsors.findFirst({
      where: and(
        eq(proposalSponsors.proposal_id, proposalId),
        eq(proposalSponsors.sponsor_id, sponsorId)
      ),
    });

    if (existing) {
      return res.status(409).json({ message: "Already sent to this sponsor" });
    }

    const [created] = await db
      .insert(proposalSponsors)
      .values({
        proposal_id: proposalId,
        sponsor_id: sponsorId,
        status: "Pending",
      })
      .returning();

    res.status(201).json({
      message: "Proposal sent to sponsor",
      data: created,
    });
  } catch (err) {
    console.error("sendProposalToSponsor error:", err);
    res.status(500).json({ message: err.message });
  }
};


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

export const getFastTrackProposals = async (req, res) => {
  try {
    const sponsorId = req.user.id;

    const result = await db.select({
        ps_id: proposalSponsors.id,
        status: proposalSponsors.status,
        feedback: proposalSponsors.feedback,
        created_at: proposalSponsors.created_at,
        proposal_id: proposals.id,
        pdf_url: proposals.pdf_url,
        submission_type: proposals.submission_type,
        event_id: proposals.event_id,
    })
      .from(proposalSponsors)
      .innerJoin(proposals, eq(proposalSponsors.proposal_id, proposals.id))
      .where(
        and(
          eq(proposalSponsors.sponsor_id, sponsorId),
          eq(proposals.submission_type, "fasttrack")
        )
      );

    res.json({ proposals: result });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

export const feedbackProposal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { proposalSponsorId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    // ambil sponsor profile (BUKAN userId)
    const sponsorProfile = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.user_id, userId),
    });

    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const ps = await db.query.proposalSponsors.findFirst({
      where: and(
        eq(proposalSponsors.id, proposalSponsorId),
        eq(proposalSponsors.sponsor_id, sponsorProfile.id)
      ),
      with: { proposal: true },
    });

    if (!ps) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // business rule
    if (ps.proposal.submission_type !== "FAST_TRACK") {
      return res.status(400).json({
        message: "Feedback only allowed for FAST_TRACK proposals",
      });
    }

    const [updated] = await db
      .update(proposalSponsors)
      .set({
        feedback,
        updated_at: new Date(),
      })
      .where(eq(proposalSponsors.id, proposalSponsorId))
      .returning();

    res.json({
      message: "Feedback submitted",
      proposal: updated,
    });
  } catch (err) {
    console.error("feedbackProposal error", err);
    res.status(500).json({ message: err.message });
  }
};

