import { events } from '../db/schema/events.js';
import { db } from '../db/index.js';
import { validateEventTimes, parseDateISO } from '../utils/dateValidator.js';
import { eq, and} from 'drizzle-orm';
import { eventCategories, eventModes, eventSizes, eventSponsorTypes } from '../db/schema/masterTable.js';

export const createEvent = async (req, res) => {
    try{
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const {name, location, target, requirements, description, proposalUrl,
             startTime, endTime, categoryId, sponsorTypeId, sizeId, modeId} = req.body;

        const validation = validateEventTimes(startTime, endTime);
        if (!validation.valid) return res.status(400).json({ message: validation.message });
        const eoId  = req.user.id;
        

        const newEvent = {
            eo_id: eoId,
            name,
            location: location || null,
            target: target || null,
            requirements: requirements || null,
            description: description || null,
            proposal_url: proposalUrl,
            start_time: new Date(startTime),
            end_time: new Date(endTime),
            category_id: categoryId,
            sponsor_type_id: sponsorTypeId,
            size_id: sizeId,
            mode_id: modeId,
        };
        const [created] = await db
            .insert(events)
            .values(newEvent)
            .returning();
        res.status(201).json({ event: created});
    }catch (err){
        res.status(500).json({message: err.message});
    }
    
}

export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eoId = req.user.id;

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
            modeId
        } = req.body;

        const [existing] = await db
            .select()
            .from(events)
            .where(and(eq(events.id, id), eq(events.eo_id, eoId)));

        if (!existing) {
            return res.status(404).json({ message: "Event Not Found" });
        }

        const editEvent = {};

        if (name !== undefined) editEvent.name = name;
        if (location !== undefined) editEvent.location = location || null;
        if (target !== undefined) editEvent.target = target;
        if (requirements !== undefined) editEvent.requirements = requirements;
        if (description !== undefined) editEvent.description = description;
        if (proposalUrl !== undefined) editEvent.proposal_url = proposalUrl;

        if (startTime !== undefined || endTime !== undefined) {
            const newStart = startTime ?? existing.start_time;
            const newEnd = endTime ?? existing.end_time;

            const timeValidation = validateEventTimes(newStart, newEnd);

            if (!timeValidation.valid) {
                return res.status(400).json({ message: timeValidation.message });
            }

            editEvent.start_time = parseDateISO(newStart);
            editEvent.end_time = parseDateISO(newEnd);
        }

        if (categoryId !== undefined) editEvent.category_id = Number(categoryId);
        if (sponsorTypeId !== undefined)editEvent.sponsor_type_id = Number(sponsorTypeId);
        if (sizeId !== undefined) editEvent.size_id = Number(sizeId);
        if (modeId !== undefined) editEvent.mode_id = Number(modeId);

        editEvent.updated_at = new Date();

        const [updated] = await db
            .update(events)
            .set(editEvent)
            .where(and(eq(events.id, id), eq(events.eo_id, eoId)))
            .returning();

        res.json({ message: "Event Updated", event: updated });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};



export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eoId = req.user.id;

        const [existing] = await db
            .select()
            .from(events)
            .where(and(eq(events.id, id), eq(events.eo_id,eoId)));

        if(!existing){
            return res.status(404).json({message: 'Event not Found'});
        }

        await db
            .delete(events)
            .where(and(eq(events.id, id), eq(events.eo_id, eoId)));
        
        res.json({message: "Event deleted sucessfully"});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: err.message});
    }
};
export const getAllEvent = async (req, res) => {
    try{
        const allEvents = await db
            .select()
            .from(events)
            .orderBy(events.created_at);
        
        res.json({
            message: 'Success',
            events: allEvents});
    }
    catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

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

}
export const getDetailEvent = async (req, res) => {
  try {
    const { id } = req.params;

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