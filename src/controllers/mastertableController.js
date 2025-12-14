import {
    eventCategories,
    eventSponsorTypes,
    eventSizes,
    eventModes
}   from "../db/schema/masterTable.js"

import {
  sponsorCategories,
  sponsorTypes,
  sponsorScopes
} from "../db/schema/masterTable.js";
import { db } from '../db/index.js';


export const getEventMasters = async (req, res) => {
    try {
        const [
            categories,
            sponsorTypes,
            sizes,
            modes
        ] = await Promise.all([
            db.select().from(eventCategories),
            db.select().from(eventSponsorTypes),
            db.select().from(eventSizes),
            db.select().from(eventModes),
        ]);

        res.json({
            categories,
            sponsorTypes,
            sizes,
            modes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message});
    }
};

export const getSponsorMasters = async (req, res) => {
  try {
    const [
      categories,
      types,
      scopes
    ] = await Promise.all([
      db.select().from(sponsorCategories),
      db.select().from(sponsorTypes),
      db.select().from(sponsorScopes),
    ]);

    res.json({
      categories,
      types,
      scopes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

