import { events } from '../db/schema/events.js';
import { db } from '../db/index.js';
import { validateEventTimes } from '../utils/dateValidator.js';
import { eq, and, desc} from 'drizzle-orm';
import { eventCategories, eventModes, eventSizes, eventSponsorTypes } from '../db/schema/masterTable.js';
import { proposals } from '../db/schema/proposals.js';
import { supa } from '../config/storage.js';


/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: EO can create an event. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startTime
 *               - endTime
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               target:
 *                 type: string
 *               requirements:
 *                 type: string
 *               description:
 *                 type: string
 *               proposalUrl:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: integer
 *               sponsorTypeId:
 *                 type: integer
 *               sizeId:
 *                 type: integer
 *               modeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event successfully created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const createEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      location,
      target,
      requirements,
      description,
      proposalUrl,
      startTime,
      endTime,
      categoryId,
      sponsorTypeId,
      sizeId,
      modeId,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Event name required" });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Start & End Time required" });
    }

    const validation = validateEventTimes(startTime, endTime);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const eoId = req.user.id;

    let imageUrl = null;

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const filePath = `events/${eoId}-${Date.now()}.${ext}`;

      const { error } = await supa.storage
        .from("Platipus")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      const { data } = supa.storage
        .from("Platipus")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    // =============================
    // INSERT EVENT
    // =============================
    const newEvent = {
      eo_id: eoId,
      name,
      location: location || null,
      target: target || null,
      requirements: requirements || null,
      description: description || null,
      proposal_url: proposalUrl || null,
      image_url: imageUrl,
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      category_id: Number(categoryId),
      sponsor_type_id: Number(sponsorTypeId),
      size_id: Number(sizeId),
      mode_id: Number(modeId),
    };

    const [created] = await db
      .insert(events)
      .values(newEvent)
      .returning();

    return res.status(201).json({
      message: "Event created",
      event: created,
    });

  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({ message: err.message });
  }
};


/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update an existing event
 *     description: EO can update their own event by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               target:
 *                 type: string
 *               requirements:
 *                 type: string
 *               description:
 *                 type: string
 *               proposalUrl:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: integer
 *               sponsorTypeId:
 *                 type: integer
 *               sizeId:
 *                 type: integer
 *               modeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

export const updateEvent = async (req, res) => {
  try {
    const { eventId: id } = req.params;
    const eoId = req.user.id;

    // Debug: cek params
    console.log("Update Event - params id:", id, "eoId:", eoId);

    const [existing] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.eo_id, eoId)));

    console.log("Existing event:", existing);

    if (!existing) {
      return res.status(404).json({ 
        message: "Event Not Found. Either wrong id or you are not the owner." 
      });
    }

    const {
      name, location, target, requirements, description, proposalUrl,
      startTime, endTime, categoryId, sponsorTypeId, sizeId, modeId
    } = req.body;

    const editEvent = {};

    if (name !== undefined) editEvent.name = name;
    if (location !== undefined) editEvent.location = location || null;
    if (target !== undefined) editEvent.target = target || null;
    if (requirements !== undefined) editEvent.requirements = requirements || null;
    if (description !== undefined) editEvent.description = description || null;
    if (proposalUrl !== undefined) editEvent.proposal_url = proposalUrl || null;

    if (startTime !== undefined || endTime !== undefined) {
      const newStart = startTime ? new Date(startTime) : existing.start_time;
      const newEnd = endTime ? new Date(endTime) : existing.end_time;

      const timeValidation = validateEventTimes(newStart, newEnd);
      if (!timeValidation.valid) {
        return res.status(400).json({ message: timeValidation.message });
      }

      editEvent.start_time = newStart;
      editEvent.end_time = newEnd;
    }

    if (categoryId !== undefined) editEvent.category_id = Number(categoryId);
    if (sponsorTypeId !== undefined) editEvent.sponsor_type_id = Number(sponsorTypeId);
    if (sizeId !== undefined) editEvent.size_id = Number(sizeId);
    if (modeId !== undefined) editEvent.mode_id = Number(modeId);

    editEvent.updated_at = new Date();

    const [updated] = await db
      .update(events)
      .set(editEvent)
      .where(and(eq(events.id, id), eq(events.eo_id, eoId)))
      .returning();

    res.json({ message: "Event Updated", event: updated });

  } catch (err) {
    console.error("updateEvent error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event
 *     description: EO can delete their own event by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found or unauthorized
 *       500:
 *         description: Internal server error
 */

export const deleteEvent = async (req, res) => {
  try {
    const { eventId: id } = req.params;
    const eoId = req.user.id;

    console.log("Delete Event - params id:", id, "eoId:", eoId);

    const [existing] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), eq(events.eo_id, eoId)));

    console.log("Existing event to delete:", existing);

    if (!existing) {
      return res.status(404).json({ 
        message: 'Event Not Found. Either wrong id or you are not the owner.'
      });
    }

    await db.delete(events)
      .where(and(eq(events.id, id), eq(events.eo_id, eoId)));

    res.json({ message: "Event deleted successfully" });

  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ message: err.message });
  }
};


/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     description: Public endpoint to fetch all events with joined category, sponsor type, size, and mode.
 *     responses:
 *       200:
 *         description: List of events
 *       500:
 *         description: Internal server error
 */
export const getAllEvent = async (req, res) => {
    try{
        const allEvents = await db
            .select({
                id: events.id,
                name: events.name,
                location: events.location,
                start_time: events.start_time,
                end_time: events.end_time,
                category: eventCategories.name,
                sponsorType: eventSponsorTypes.name,
                size: eventSizes.name,
                mode: eventModes.name,
                proposal_url: events.proposal_url,
                created_at: events.created_at,
            })
            .from(events)
            .leftJoin(eventCategories, eq(events.category_id, eventCategories.id))
            .leftJoin(eventSponsorTypes, eq(events.sponsor_type_id, eventSponsorTypes.id))
            .leftJoin(eventSizes, eq(events.size_id, eventSizes.id))
            .leftJoin(eventModes, eq(events.mode_id, eventModes.id))
            .orderBy(desc(events.created_at));
        res.json({ events: allEvents});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * @swagger
 * /events/me:
 *   get:
 *     summary: Get events of the logged-in EO
 *     description: Fetch all events created by the authenticated EO.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events of the EO
 *       500:
 *         description: Internal server error
 */
export const getMyEvents = async (req, res) => {
    try {
        const eoId = req.user.id;
        
        const myEvents = await db
            .select()
            .from(events)
            .where(eq(events.eo_id, eoId));
        
        res.json({ 
            message: 'Success',
            data: myEvents,
        });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }

};

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Get event details
 *     description: Fetch detailed info of an event by ID.
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
export const getDetailEvent = async (req, res) => {
  try {
    const { eventId: id } = req.params;

    const [event] = await db
      .select({
        id: events.id,
        name: events.name,
        location: events.location,
        target: events.target,
        requirements: events.requirements,
        description: events.description,
        proposal_url: events.proposal_url,
        start_time: events.start_time,
        end_time: events.end_time,
        category: eventCategories.name,
        sponsorType: eventSponsorTypes.name,
        size: eventSizes.name,
        mode: eventModes.name,
      })
      .from(events)
      .leftJoin(eventCategories, eq(events.category_id, eventCategories.id))
      .leftJoin(eventSponsorTypes, eq(events.sponsor_type_id, eventSponsorTypes.id))
      .leftJoin(eventSizes, eq(events.size_id, eventSizes.id))
      .leftJoin(eventModes, eq(events.mode_id, eventModes.id))
      .where(eq(events.id, id));

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getProposalsByEO = async (req, res) => {
  try {
    const eoId = req.user.id;

    // Ambil semua event milik EO
    const eventsList = await db.select({ event_id: events.id })
      .from(events)
      .where(eq(events.eo_id, eoId));

    const eventIds = eventsList.map(e => e.event_id);
    console.log("EO event IDs:", eventIds);

    // Jika tidak ada event, kembalikan array kosong
    if (!eventIds.length) {
      return res.json({ proposals: [] });
    }

    // Ambil proposal + join ke master tables
    const proposalsList = await db
      .select({
        proposal_id: proposals.id,
        pdf_url: proposals.pdf_url,
        submission_type: proposals.submission_type,
        created_at: proposals.created_at,
        event_id: proposals.event_id,
        event_name: events.name,
        event_location: events.location,
        event_target: events.target,
        event_requirements: events.requirements,
        event_description: events.description,
        category_name: event_categories.name,
        sponsor_type_name: event_sponsor_types.name,
        size_name: event_sizes.name,
        mode_name: event_modes.name,
      })
      .from(proposals)
      .leftJoin(events, eq(events.id, proposals.event_id))
      .leftJoin(event_categories, eq(event_categories.id, events.category_id))
      .leftJoin(event_sponsor_types, eq(event_sponsor_types.id, events.sponsor_type_id))
      .leftJoin(event_sizes, eq(event_sizes.id, events.size_id))
      .leftJoin(event_modes, eq(event_modes.id, events.mode_id))
      .where(proposals.event_id.in(eventIds))
      .orderBy(desc(proposals.created_at));

    res.json({ proposals: proposalsList });

  } catch (err) {
    console.error("getProposalsByEO error:", err);
    res.status(500).json({ message: err.message });
  }
};
