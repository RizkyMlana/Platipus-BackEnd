import { proposals } from '../db/schema/proposals.js';
import { db } from '../db/index.js';
import { eq, and} from 'drizzle-orm';

export const createProposal = async (req, res) => {
    try {
        const {eventId, sponsorId, type} = req.body;
        const eoId = req.user.id;

        const [event] = await db
            .select()
            .from(events)
            .where(eq(events.id, eventId));
        if (!event || event.eo_id !== eoId) {
            return res.status(403).json({message: "Unauthorized"});
        }

        const [proposal] = await db
            .insert(proposals)
            .values({
                event_id: eventId,
                sponsor_id: sponsorId,
                type,
                status: 'Pending'
            })
            .returning();
        
        res.status(201).json({ proposal });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: err.message});
    }
}
export const getFastTrackProposals = async(req, res) => {
    try {
        const sponsorId = req.user.id;

        const proposalList = await db
            .select()
            .from(proposals)
            .where(and(eq(proposals.sponsor_id, sponsorId), eq(proposals.type, 'fasttrack')))
            .orderBy(proposals.created_at);

        res.json({proposals: proposalList});
    }catch (err){
        console.error(err);
        res.status(500).json({message: err.message})
    }
}

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