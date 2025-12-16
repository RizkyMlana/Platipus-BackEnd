import { and, eq, gte, lte, desc, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { sponsorProfiles } from "../db/schema/users.js";
import { sponsorCategories, sponsorScopes, sponsorTypes } from "../db/schema/masterTable.js";



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
