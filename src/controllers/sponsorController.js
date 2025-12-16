import { and, eq, gte, lte, desc, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { sponsorProfiles } from "../db/schema/users.js";
import { sponsorCategories, sponsorScopes, sponsorTypes } from "../db/schema/masterTable.js";
import { eventSponsors } from "../db/schema/eventSponsor.js";



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

export const reviewSubmission = async (req, res) => {
  try {
    const sponsorUserId = req.user.id;
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    const allowedStatus = ['ACCEPTED', 'REJECTED'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const sponsor = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.user_id, sponsorUserId),
    });
    if (!sponsor) {
      return res.status(403).json({ message: 'Only sponsor allowed' });
    }

    const submission = await db.query.eventSponsors.findFirst({
      where: and(
        eq(eventSponsors.id, submissionId),
        eq(eventSponsors.sponsor_id, sponsor.id)
      ),
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.submission_type === 'REGULAR' && feedback) {
      return res.status(400).json({
        message: 'Regular submission cannot have feedback',
      });
    }

    const updateData = {
      status,
      updated_at: new Date(),
    };

    if (submission.submission_type === 'FAST_TRACK') {
      updateData.feedback = feedback || null;
    }

    const [updated] = await db
      .update(eventSponsors)
      .set(updateData)
      .where(eq(eventSponsors.id, submissionId))
      .returning();

    res.json({
      message: 'Submission reviewed',
      data: updated,
    });

  } catch (err) {
    console.error('reviewSubmission error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

