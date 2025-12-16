import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events } from '../db/schema/events.js';
import { eoProfiles, sponsorProfiles } from '../db/schema/users.js';
import { eventSponsors } from '../db/schema/eventSponsor.js';

export const submitEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;
        const { sponsorId, submissionType } = req.body;

        const eo = await db.query.eoProfiles.findFirst({
            where: eq(eoProfiles.user_id, userId),
        });

        if(!eo) return res.status(403).json({ message: "Only EO Allowed"});

        const [event] = await db
            .select()
            .from(events)
            .where(and(eq(events.id, eventId), eq(events.eo_id, eo.id)));
        
        if(!event) {
            return res.status(404).json({ message: "Event not found"});
        }
        const [created] = await db
            .insert(eventSponsors)
            .values({
                event_id: eventId,
                sponsor_id: sponsorId,
                submission_type: submissionType,
            })
            .returning();
        res.status(201).json({
            message: "Event submitted to sponsor",
            data: created,
        });
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

export const getIncomingEventsForSponsor = async (req, res) => {
    try {
        const userId = req.user.id;
        const sponsor = await db.query.sponsorProfiles.findFirst({
            where: eq(sponsorProfiles.user_id, userId),
        });

        if(!sponsor) {
            return res.status(403).json({ message: "Only sponsor allowed"});
        }

        const data = await db
            .select({
                submission_id: eventSponsors.id,
                submission_type: eventSponsors.submission_type,
                status: eventSponsors.status,
                event_id: events.id,
                event_name: events.name,
                proposal_url: events.proposal_url,
                eo_id: events.eo_id,
            })
            .from(eventSponsors)
            .innerJoin(events, eq(events.id, eventSponsors.event_id))
            .where(eq(eventSponsors.sponsor_id, sponsor.id))
            .orderBy(desc(eventSponsors.created_at));

        
        res.json({ events: data})
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
};

export const getSubmittedSponsorsByEO = async (req, res) => {
  const { eventId } = req.params;
  const eoId = req.user.id;

  const data = await db
    .select({
      event_sponsor_id: eventSponsors.id,
      sponsor_id: sponsorProfiles.id,
      company_name: sponsorProfiles.company_name,
      submission_type: eventSponsors.submission_type,
      status: eventSponsors.status,
      feedback: eventSponsors.feedback,
    })
    .from(eventSponsors)
    .innerJoin(events, eq(events.id, eventSponsors.event_id))
    .innerJoin(sponsorProfiles, eq(sponsorProfiles.id, eventSponsors.sponsor_id))
    .where(and(
      eq(events.id, eventId),
      eq(events.eo_id, eoId)
    ));

  res.json({ sponsors: data });
};

export const getSubmittedSponsorsFastTrackByEO = async (req, res) => {
  const { eventId } = req.params;
  const eoId = req.user.id;

  const data = await db
    .select({
      event_sponsor_id: eventSponsors.id,
      sponsor_id: sponsorProfiles.id,
      company_name: sponsorProfiles.company_name,
      submission_type: eventSponsors.submission_type,
      status: eventSponsors.status,
      feedback: eventSponsors.feedback,
    })
    .from(eventSponsors)
    .innerJoin(events, eq(events.id, eventSponsors.event_id))
    .innerJoin(sponsorProfiles, eq(sponsorProfiles.id, eventSponsors.sponsor_id))
    .where(and(
      eq(events.id, eventId),
      eq(events.eo_id, eoId),
      eq(eventSponsors.submission_type, "FAST_TRACK")
    ));

  res.json({ sponsors: data });
};

