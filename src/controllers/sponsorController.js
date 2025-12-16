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

export const reviewIncomingEvent = async (req, res) => {
  try{
    const sponsorUserId = req.user.id;
    const { eventSponsorId } = req.params;
    const { decision, feedback } = req.body;

    if(!["ACCEPT", "REJECT"].includes(decision)) {
      return res.status(400).json({ message: "Invalid Decision"});
    }

    const sponsor = await db.query.sponsorProfiles.findFirst({
      where: eq(sponsorProfiles.user_id, sponsorUserId),
    });

    if(!sponsor) {
      return res.status(403).json({ message: "Only Sponsor allowed"});
    }

    const submission = await db.query.eventSponsors.findFirst({
      where: eq(eventSponsors.id, eventSponsorId),
    });

    if(!submission) {
      return res.status(404).json({ message: "Submission not found"});
    }
    if( submission.sponsor_id !== sponsor.id) {
      return res.status(403).json({ message: "Not your submission"});
    }

    if(submission.status !== 'PENDING') {
      return res.status(400).json({ message: 'Submission already reviewed'});
    }

    if(submission.submission_type === "FAST_TRACK") {
      if(!feedback || feedback.trim() === "") {
        return res.status(400).json({
          message: "FAST_TRACK submission requires feedback",
        });
      }
    }

    if(submission.submission_type === "REGULAR" && feedback){
      return res.status(400).json({
        message: "REGULAR submission cannot have feedback",
      });
    }
    const [updated] = await db
      .update(eventSponsors)
      .set({
        status: decision === "ACCEPT" ? "ACCEPTED" : "REJECTED",
        feedback: submission.submission_type === "FAST_TRACK" ? feedback : null,
      })
      .where(eq(eventSponsors.id, eventSponsorId))
      .returning();
    res.json({
      message: "Submission Reviewed",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error"});
  }
};
