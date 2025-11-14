import { events } from '../db/schema/events.js';
import { db } from '../db/index.js';
import { validateEventTimes } from '../utils/dateValidator.js';

export const createEvent = async (req, res) => {
    
    try{
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const {name, location, target, requirements, description, proposalUrl,
             startTime, endTime, categoryId, sponsorTypeId, sizeId, modeId} = req.body;

        const validation = validateEventTimes(startTime, endTime);
        if (!validation.valid) return res.status(400).json({ message: validation.message });
        const eoId  = req.user.id;

        const [newEvent] = await db.insert(events).values({
            eo_id: eoId,
            name,
            location,
            target,
            requirements,
            description,
            proposal_url: proposalUrl,
            start_time: new Date(startTime),
            end_time: new Date(endTime),
            category_id: categoryId,
            sponsor_type_id: sponsorTypeId,
            size_id: sizeId,
            mode_id: modeId,
        }).returning();
        res.status(201).json({ event: newEvent});
    }catch (err){
        res.status(500).json({message: err.message});
    }
    
}