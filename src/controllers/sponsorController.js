import { and, eq, gte, lte, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { 
    sponsorProfiles, 
    proposalSponsors, 
    proposals, 
    events 
} from "../db/schema.js";



async function getSponsorProfileId(userId) {
    const profile = await db.query.sponsorProfiles.findFirst({
        where: eq(sponsorProfiles.user_id, userId),
    });
    return profile ? profile.id : null;
}


export const getSponsorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await db.query.sponsorProfiles.findFirst({
            where: eq(sponsorProfiles.user_id, userId),
        });

        if (!profile) {
            return res.status(404).json({ message: "Sponsor profile not found" });
        }

        res.json(profile);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getIncomingProposals = async (req, res) => {
    try {
        const userId = req.user.id;
        const sponsorId = await getSponsorProfileId(userId);

        if (!sponsorId) {
            return res.status(404).json({ message: "Sponsor profile not found" });
        }

        const { status, submission_type, from, to } = req.query;

        let conditions = [
            eq(proposalSponsors.sponsor_id, sponsorId)
        ];

        if (status) conditions.push(eq(proposalSponsors.status, status));
        if (submission_type) conditions.push(eq(proposals.submission_type, submission_type));
        if (from) conditions.push(gte(proposals.created_at, new Date(from)));
        if (to) conditions.push(lte(proposals.created_at, new Date(to)));

        const data = await db
            .select({
                proposal_sponsor_id: proposalSponsors.id,
                proposal_id: proposals.id,
                status: proposalSponsors.status,
                feedback: proposalSponsors.feedback,
                event: events,
            })
            .from(proposalSponsors)
            .leftJoin(proposals, eq(proposals.id, proposalSponsors.proposal_id))
            .leftJoin(events, eq(events.id, proposals.event_id))
            .where(and(...conditions))
            .orderBy(desc(proposals.created_at));

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getProposalDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const sponsorId = await getSponsorProfileId(userId);

        if (!sponsorId) {
            return res.status(404).json({ message: "Sponsor profile not found" });
        }

        const { proposalSponsorId } = req.params;

        const data = await db
            .select({
                proposal_sponsor: proposalSponsors,
                proposal: proposals,
                event: events,
            })
            .from(proposalSponsors)
            .leftJoin(proposals, eq(proposals.id, proposalSponsors.proposal_id))
            .leftJoin(events, eq(events.id, proposals.event_id))
            .where(and(
                eq(proposalSponsors.id, proposalSponsorId),
                eq(proposalSponsors.sponsor_id, sponsorId)
            ));

        if (!data.length) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        res.json(data[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const updateProposalStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const sponsorId = await getSponsorProfileId(userId);

        if (!sponsorId) {
            return res.status(404).json({ message: "Sponsor profile not found" });
        }

        const { proposalSponsorId } = req.params;
        const { status, feedback } = req.body;

        if (!["Accepted", "Rejected", "Pending"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const ps = await db.query.proposalSponsors.findFirst({
            where: and(
                eq(proposalSponsors.id, proposalSponsorId),
                eq(proposalSponsors.sponsor_id, sponsorId)
            ),
            with: { proposal: true },
        });

        if (!ps) {
            return res.status(404).json({ message: "Proposal not found" });
        }

        let updateData = { status };

        // feedback hanya untuk fasttrack
        if (ps.proposal.submission_type === "fasttrack") {
            if (feedback) updateData.feedback = feedback;
        } else {
            updateData.feedback = null; // manual tidak boleh punya feedback
        }

        const updated = await db
            .update(proposalSponsors)
            .set(updateData)
            .where(eq(proposalSponsors.id, proposalSponsorId))
            .returning();

        res.json(updated[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


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
