import { proposals, proposalSponsors } from '../db/schema/proposals.js';
import { db } from '../db/index.js';
import { eq, and} from 'drizzle-orm';
import { events } from '../db/schema/events.js';

export const createProposal = async (req, res) => {
    try {
        const eoId = req.user.id;
        const { eventId, submission_type, pdf_url } = req.body;

        if (!eventId || !submission_type || !pdf_url) {
            return res.status(400).json({ message: "Missing Fields"});
        }
        const [event] = await db.select()
            .from(events)
            .where(eq(events.id, eventId));
        if(!event || event.eo_id !== eoId) {
            return res.status(403).json({ message: "Unauthorized"});
        }
        const existing = await db.select()
            .from(proposals)
            .where(eq(proposals.event_id, eventId));
        if(existing.length > 0) {
            return res.status(409).json({message: "Proposal already created for this event"});
        }

        const [created] = await db.insert(proposals)
            .values({
                event_id: eventId,
                submission_type,
                pdf_url,
            })
            .returning();
        res.status(201).json({proposal :created});
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message});
    }
}

export const sendProposalToSponsor = async (req,res) => {
    try{
        const eoId = req.user.id;
        const { proposalId, sponsorProfileId } = req.body;
        if(!proposalId || !sponsorProfileId) {
            return res.status(400).json({ message: "Missing Fields"});
        }
        const [prop] = await db.select()
            .from(proposals)
            .where(eq(proposals.id, proposalId))
            .limit(1);
        if(!prop) return res.status(404).json({ message: "Proposal not found"});

        const [event] = await db.select()
            .from(events)
            .where(eq(events.id, prop.event_id))
            .limit(1);

        if(event.eo_id !== eoId) {
            return res.status(403).json({ message: "Unauthorized"});
        }

        const existing = await db.select()
            .from(proposalSponsors)
            .where(and(eq(proposalSponsors.proposal_id, proposalId), eq(proposalSponsors.sponsor_id, sponsorProfileId)));

        if(existing.length>0) {
            return res.status(409).json({message: "Already sent to this sponsor"});
        }

        const [created] = await db.insert(proposalSponsors)
            .values({
                proposal_id: proposalId,
                sponsor_id: sponsorProfileId,
                status: "Pending",
            })
            .returning();
        res.status(201).json({ message: "Sent", data: created});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
}

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


export const feedbackProposal = async (req, res) => {
    try {
        const sponsorId = req.user.id;
        const { id } = req.params;
        const { feedback, status } = req.body;

        const [proposal] = await db
            .select()
            .from(proposals)
            .where(eq(proposals.id,id));
        
        if(!proposal || proposal.sponsor_id !== sponsorId){
            return res.status(403).json({message: "Unauthorized"});
        }
        const [updated] = await db
            .update(proposals)
            .set({feedback, status, updated_at: new Date()})
            .where(eq(proposals.id, id))
            .returning();
        res.json({message: "Feedback Submitted", proposal: updated});
    }catch(err){
        console.error(err);
        res.status(500).json({message: err.message});
    }
}