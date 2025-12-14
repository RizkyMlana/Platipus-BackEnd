import { getEventMasters, getSponsorMasters } from "../controllers/mastertableController.js";
import { Router } from "express";

const router = Router();

router.get('/events', getEventMasters);
router.get('/sponsors', getSponsorMasters);

export default router;
