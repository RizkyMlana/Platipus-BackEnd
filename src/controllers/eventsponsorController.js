import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events } from '../db/schema/events.js';
import { eoProfiles, sponsorProfiles } from '../db/schema/users.js';
import { eventSponsors } from '../db/schema/eventSponsor.js';

export const submitEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;
        const { sponsorId, submissionType } = req.body || {};

        if (!sponsorId || !submissionType) {
            return res.status(400).json({
                success: false,
                message: "Missing sponsorId or submissionType in request body"
            });
        }

        // Validasi submissionType
        const allowedTypes = ["REGULAR", "FAST_TRACK"];
        if (!allowedTypes.includes(submissionType)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid submission type",
            });
        }

        // Ambil EO profile
        const eo = await db.query.eoProfiles.findFirst({
            where: eq(eoProfiles.user_id, userId),
        });
        if (!eo) {
            return res.status(403).json({ 
                success: false,
                message: "Only EO allowed",
            });
        }

        // Ambil event
        const event = await db.query.events.findFirst({
            where: and(eq(events.id, eventId), eq(events.eo_id, eo.id)),
        });
        if (!event) {
            return res.status(404).json({ 
                success: false,
                message: "Event not found",
            });
        }

        // Cek duplikasi submission
        const existing = await db.query.eventSponsors.findFirst({
            where: and(eq(eventSponsors.event_id, eventId), eq(eventSponsors.sponsor_id, sponsorId)),
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Sponsor already submitted for this event",
            });
        }

        // Insert submission
        const created = await db.insert(eventSponsors)
            .values({
                event_id: eventId,
                sponsor_id: sponsorId,
                submission_type: submissionType,
            })
            .returning();

        res.status(201).json({
            success: true,
            message: "Event submitted to sponsor",
            data: created[0],
            requiresPayment: submissionType === "FAST_TRACK"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
        });
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

export const getSponsorsByEO = async (req, res) => {
  try {
    const userId = req.user.id;

    const eo = await db.query.eoProfiles.findFirst({
        where: eq(eoProfiles.user_id, userId),
    });
    if(!eo) return res.status(403).json({ message: "Only EO allowed"});

    const eoId = eo.id;
    const data = await db
      .select({
        sponsor_id: sponsorProfiles.id,
        company_name: sponsorProfiles.company_name,
        submission_type: eventSponsors.submission_type,
        status: eventSponsors.status,
        feedback: eventSponsors.feedback,
      })
      .from(eventSponsors)
      .innerJoin(events, eq(events.id, eventSponsors.event_id))
      .innerJoin(sponsorProfiles, eq(sponsorProfiles.id, eventSponsors.sponsor_id))
      .where(eq(events.eo_id, eoId));

    // Pisahkan FAST_TRACK dan REGULAR
    const fastTrack = data.filter(d => d.submission_type === 'FAST_TRACK');
    const regular = data.filter(d => d.submission_type === 'REGULAR');

    res.json({ fastTrack, regular });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data sponsor' });
  }
};



