import { and, eq, gte, lte, desc, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { sponsorProfiles } from "../db/schema/users.js";
import { events } from "../db/schema/events.js";
import { proposalSponsors, proposals } from "../db/schema/proposals.js";
import { sponsorCategories, sponsorScopes, sponsorTypes } from "../db/schema/masterTable.js";


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
export const getIncomingProposals = async (req, res) => {
  try {
    const userId = req.user.id;

    const sponsorProfile = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.user_id, userId),
    });

    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const sponsorId = sponsorProfile.id;

    const { status, submission_type, from, to } = req.query;

    const conditions = [
      eq(proposalSponsors.sponsor_id, sponsorId),
    ];

    if (status) {
      conditions.push(eq(proposalSponsors.status, status));
    }

    if (submission_type) {
      conditions.push(eq(proposals.submission_type, submission_type));
    }

    if (from && !isNaN(new Date(from))) {
      conditions.push(gte(proposals.created_at, new Date(from)));
    }

    if (to && !isNaN(new Date(to))) {
      conditions.push(lte(proposals.created_at, new Date(to)));
    }

    const data = await db
      .select({
        proposalSponsorId: proposalSponsors.id,
        proposalId: proposals.id,
        status: proposalSponsors.status,
        feedback: proposalSponsors.feedback,
        createdAt: proposals.created_at,
        event: {
          id: events.id,
          name: events.name,
        },
      })
      .from(proposalSponsors)
      .innerJoin(proposals, eq(proposals.id, proposalSponsors.proposal_id))
      .innerJoin(events, eq(events.id, proposals.event_id))
      .where(and(...conditions))
      .orderBy(desc(proposals.created_at));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


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
export const getProposalDetail = async (req, res) => {
  try {
    const userId = req.user.id;

    const sponsorProfile = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.user_id, userId),
    });

    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const { proposalSponsorId } = req.params;

    const [data] = await db
      .select({
        proposalSponsor: {
          id: proposalSponsors.id,
          status: proposalSponsors.status,
          feedback: proposalSponsors.feedback,
        },
        proposal: {
          id: proposals.id,
          submission_type: proposals.submission_type,
          pdf_url: proposals.pdf_url,
          created_at: proposals.created_at,
        },
        event: {
          id: events.id,
          name: events.name,
        },
      })
      .from(proposalSponsors)
      .innerJoin(proposals, eq(proposals.id, proposalSponsors.proposal_id))
      .innerJoin(events, eq(events.id, proposals.event_id))
      .where(and(
        eq(proposalSponsors.id, proposalSponsorId),
        eq(proposalSponsors.sponsor_id, sponsorProfile.id)
      ));

    if (!data) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


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
export const updateProposalStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const sponsorProfile = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.user_id, userId),
    });

    if (!sponsorProfile) {
      return res.status(404).json({ message: "Sponsor profile not found" });
    }

    const sponsorId = sponsorProfile.id;
    const { proposalSponsorId } = req.params;
    const { status } = req.body;

    const VALID_STATUS = ["PENDING", "ACCEPTED", "REJECTED"];
    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ps = await db.query.proposalSponsors.findFirst({
      where: and(
        eq(proposalSponsors.id, proposalSponsorId),
        eq(proposalSponsors.sponsor_id, sponsorId)
      ),
    });

    if (!ps) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const [updated] = await db
      .update(proposalSponsors)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(proposalSponsors.id, proposalSponsorId))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


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
export const getRecommendedEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await db.query.sponsorProfiles.findFirst({
            where: eq(sponsorProfiles.user_id, userId),
        });

        if (!profile) {
            return res.status(404).json({ message: "Sponsor profile not found" });
        }

        const { sponsor_type_id, sponsor_category_id, sponsor_scope_id } = profile;

        let conditions = [];
        if (sponsor_type_id) conditions.push(eq(events.sponsor_type_id, sponsor_type_id));
        if (sponsor_category_id) conditions.push(eq(events.category_id, sponsor_category_id));
        if (sponsor_scope_id) conditions.push(eq(events.mode_id, sponsor_scope_id));

        const recommended = await db
            .select()
            .from(events)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(events.created_at);

        return res.json({
            message: "Success",
            recommended_events: recommended,
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// controller: getAllSponsors
export const getAllSponsors = async (req, res) => {
  try {
    // optional: jika mau filter hanya sponsor aktif/open
    const sponsorsList = await db
      .select({
        sponsor_id: sponsorProfiles.id,
        company_name: sponsorProfiles.company_name,
        company_address: sponsorProfiles.company_address,
        description: sponsorProfiles.description,
        industry: sponsorProfiles.industry,
        website: sponsorProfiles.website,
        social_media: sponsorProfiles.social_media,
        category_name: sponsorCategories.name,
        type_name: sponsorTypes.name,
        scope_name: sponsorScopes.name,
        budget_min: sponsorProfiles.budget_min,
        budget_max: sponsorProfiles.budget_max,
        status: sponsorProfiles.status,
      })
      .from(sponsorProfiles)
      .leftJoin(sponsorCategories, eq(sponsorCategories.id, sponsorProfiles.sponsor_category_id))
      .leftJoin(sponsorTypes, eq(sponsorTypes.id, sponsorProfiles.sponsor_type_id))
      .leftJoin(sponsorScopes, eq(sponsorScopes.id, sponsorProfiles.sponsor_scope_id))
      .orderBy(asc(sponsorProfiles.company_name));

    res.json({ sponsors: sponsorsList });
  } catch (err) {
    console.error("getAllSponsors error:", err);
    res.status(500).json({ message: err.message });
  }
};
