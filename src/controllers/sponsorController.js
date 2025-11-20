import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";

export const getEventDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const eventDetail = await db
            .select()
            .from(events)
            .where(eq(events.id, id))
            .limit(1);
        
        if (!eventDetail.length) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json({
            message: "Success",
            event: eventDetail[0],
        })
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}