import { events } from '../db/schema/events.js';
import { db } from '../db/index.js';
import { validateEventTimes } from '../utils/dateValidator.js';
import { eq, and, desc} from 'drizzle-orm';
import { eventCategories, eventModes, eventSizes, eventSponsorTypes } from '../db/schema/masterTable.js';
import { supa } from '../config/storage.js';
import { eoProfiles, users } from '../db/schema/users.js';


export const createEvent = async (req, res) => {
  try {

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const {
      name, location, target, requirements, description,
      startTime, endTime, categoryId, sponsorTypeId, sizeId, modeId
    } = req.body;

    if (!name) return res.status(400).json({ message: "Event name required" });
    if (!startTime || !endTime) return res.status(400).json({ message: "Start & End Time required" });

    const validation = validateEventTimes(startTime, endTime);
    if (!validation.valid) return res.status(400).json({ message: validation.message });

    const eo = await db.query.eoProfiles.findFirst({
      where: eq(eoProfiles.user_id, req.user.id),
    });
    if(!eo) return res.status(403).json({ message: "Only EO allowed"});

    const eoId = eo.id;

    // 1. Upload image
    let image_url = null;
    if (req.files?.image?.[0]) {
      const image = req.files.image[0];
      const ext = image.originalname.split(".").pop();
      const filePath = `events/${eoId}-${Date.now()}.${ext}`;

      const { error } = await supa.storage
        .from("Platipus")
        .upload(filePath, image.buffer, { contentType: image.mimetype });
      if (error) throw error;

      const { data } = supa.storage.from("Platipus").getPublicUrl(filePath);
      image_url = data?.publicUrl || null;
    }

    // 2. Upload proposal
    let proposal_url = null;
    if (req.files?.proposal?.[0]) {
      const proposal = req.files.proposal[0];
      const filePath = `proposal/${eoId}-${Date.now()}.pdf`;

      const { error } = await supa.storage
        .from("Platipus")
        .upload(filePath, proposal.buffer, { contentType: "application/pdf" });
      if (error) throw error;

      const { data } = supa.storage.from("Platipus").getPublicUrl(filePath);
      proposal_url = data?.publicUrl || null;
    }

    // 3. Insert to DB
    const newEvent = {
      eo_id: eoId,
      name,
      location: location || null,
      target: target || null,
      requirements: requirements || null,
      description: description || null,
      image_url,
      proposal_url,
      start_time: new Date(startTime),
      end_time: new Date(endTime),
      category_id: categoryId ? Number(categoryId) : null,
      sponsor_type_id: sponsorTypeId ? Number(sponsorTypeId) : null,
      size_id: sizeId ? Number(sizeId) : null,
      mode_id: modeId ? Number(modeId) : null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [created] = await db.insert(events).values(newEvent).returning();
    return res.status(201).json({ message: "Event created", event: created });

  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const eo = await db.query.eoProfiles.findFirst({
      where: eq(eoProfiles.user_id, req.user.id),
    });

    if(!eo) return res.status(403).json({message: "Only EO allowed"});

    const eoId = eo.id;

    // 1. Ambil event
    const [existing] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.eo_id, eoId)));

    if (!existing) return res.status(404).json({ message: "Event not found or not yours" });

    const {
      name, location, target, requirements, description,
      startTime, endTime, categoryId, sponsorTypeId, sizeId, modeId
    } = req.body;

    const editEvent = {};

    // 2. Optional fields
    if (name !== undefined) editEvent.name = name;
    if (location !== undefined) editEvent.location = location || null;
    if (target !== undefined) editEvent.target = target || null;
    if (requirements !== undefined) editEvent.requirements = requirements || null;
    if (description !== undefined) editEvent.description = description || null;

    // 3. Time validation
    if (startTime !== undefined || endTime !== undefined) {
      const newStart = startTime ? new Date(startTime) : existing.start_time;
      const newEnd = endTime ? new Date(endTime) : existing.end_time;

      const timeValidation = validateEventTimes(newStart, newEnd);
      if (!timeValidation.valid) return res.status(400).json({ message: timeValidation.message });

      editEvent.start_time = newStart;
      editEvent.end_time = newEnd;
    }

    // 4. Numeric fields
    if (categoryId) editEvent.category_id = Number(categoryId);
    if (sponsorTypeId) editEvent.sponsor_type_id = Number(sponsorTypeId);
    if (sizeId) editEvent.size_id = Number(sizeId);
    if (modeId) editEvent.mode_id = Number(modeId);

    // 5. Upload image
    if (req.files?.image?.[0]) {
      const image = req.files.image[0];
      const ext = image.originalname.split(".").pop();
      const imagePath = `events/${eoId}-${Date.now()}.${ext}`;

      const { error } = await supa.storage
        .from("Platipus")
        .upload(imagePath, image.buffer, { contentType: image.mimetype });
      if (error) throw error;

      const { data } = supa.storage.from("Platipus").getPublicUrl(imagePath);
      if (!data?.publicUrl) throw new Error("Failed to get image URL");

      editEvent.image_url = data.publicUrl;
    }

    // 6. Upload proposal
    if (req.files?.proposal?.[0]) {
      const proposal = req.files.proposal[0];
      const proposalPath = `proposal/${eventId}-${Date.now()}.pdf`;

      const { error } = await supa.storage
        .from("Platipus")
        .upload(proposalPath, proposal.buffer, { contentType: "application/pdf" });
      if (error) throw error;

      const { data } = supa.storage.from("Platipus").getPublicUrl(proposalPath);
      if (!data?.publicUrl) throw new Error("Failed to get proposal URL");

      editEvent.proposal_url = data.publicUrl;
    }

    // 7. Update timestamp
    editEvent.updated_at = new Date();

    // 8. Update DB
    const [updated] = await db
      .update(events)
      .set(editEvent)
      .where(and(eq(events.id, eventId), eq(events.eo_id, eoId)))
      .returning();

    res.json({ message: "Event Updated", event: updated });

  } catch (err) {
    console.error("updateEvent error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const eo = await db.query.eoProfiles.findFirst({
      where: eq(eoProfiles.user_id, req.user.id),
    });

    if(!eo) return res.status(403).json({message: "Only EO allowed"});

    const eoId = eo.id;

    // 1. Ambil event
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.eo_id, eoId)));

    if (!event) {
      return res.status(404).json({ message: "Event not found or not yours" });
    }

    // 2. Hapus file image di Supabase storage (jika ada)
    if (event.image_url) {
      const imagePath = event.image_url.split("/").slice(-1)[0]; // ambil nama file dari URL
      const { error: imageError } = await supa.storage
        .from("Platipus")
        .remove([`events/${imagePath}`]);
      if (imageError) console.warn("Failed to delete image:", imageError.message);
    }

    // 3. Hapus file proposal di Supabase storage (jika ada)
    if (event.proposal_url) {
      const proposalPath = event.proposal_url.split("/").slice(-1)[0]; // ambil nama file dari URL
      const { error: proposalError } = await supa.storage
        .from("Platipus")
        .remove([`proposal/${proposalPath}`]);
      if (proposalError) console.warn("Failed to delete proposal:", proposalError.message);
    }

    // 4. Hapus event dari DB
    await db
      .delete(events)
      .where(eq(events.id, eventId));

    res.json({ message: "Event deleted successfully" });

  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ message: err.message });
  }
};

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

                eo_picture_url: users.profile_picture_url
            })
            .from(events)
            .leftJoin(eventCategories, eq(events.category_id, eventCategories.id))
            .leftJoin(eventSponsorTypes, eq(events.sponsor_type_id, eventSponsorTypes.id))
            .leftJoin(eventSizes, eq(events.size_id, eventSizes.id))
            .leftJoin(eventModes, eq(events.mode_id, eventModes.id))
            .leftJoin(eoProfiles, eq(events.eo_id, eoProfiles.id))
            .leftJoin(users, eq(eoProfiles.user_id, users.id))
            .orderBy(desc(events.created_at));
        res.json({ events: allEvents});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

export const getMyEvents = async (req, res) => {
  try {

    const eo = await db.query.eoProfiles.findFirst({
      where: eq(eoProfiles.user_id, req.user.id),
    });

    if(!eo) {
      return res.status(403).json({ message: "Only EO Allowed"});
    }
    const eoId = eo.id;

    // Ambil semua event EO ini
    const myEvents = await db
      .select()
      .from(events)
      .where(eq(events.eo_id, eoId));

    res.json({
      message: "Success",
      data: myEvents,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

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
        image_url: events.image_url,
        start_time: events.start_time,
        end_time: events.end_time,
        category: eventCategories.name,
        sponsorType: eventSponsorTypes.name,
        size: eventSizes.name,
        mode: eventModes.name,

        eo_name: eoProfiles.organization_name,
        eo_picture_url: users.profile_picture_url
      })
      .from(events)
      .leftJoin(eventCategories, eq(events.category_id, eventCategories.id))
      .leftJoin(eventSponsorTypes, eq(events.sponsor_type_id, eventSponsorTypes.id))
      .leftJoin(eventSizes, eq(events.size_id, eventSizes.id))
      .leftJoin(eventModes, eq(events.mode_id, eventModes.id))
      .leftJoin(eoProfiles, eq(events.eo_id, eoProfiles.id))
      .leftJoin(users, eq(eoProfiles.user_id, users.id))
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


