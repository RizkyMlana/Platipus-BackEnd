import { db } from "./index.js";
import {
  eventCategories,
  eventSponsorTypes,
  eventSizes,
  eventModes,
  sponsorCategories,
  sponsorTypes,
  sponsorScopes
} from "./schema/masterTable.js";

async function seedMaster() {
    console.log("Seeding master tables...");

  const eventCategoryData = [
    { name: "Technology" },
    { name: "Education" },
    { name: "Music" },
    { name: "Sports" }
  ];

 const eventSponsorTypeData = [
  { name: "Title Sponsor" },
  { name: "Main Sponsor" },
  { name: "Co-Sponsor" },
  { name: "Media Partner" },
  { name: "Community Partner" },
  { name: "Merchandise Partner" }
];

  const eventSizeData = [
    { name: "Small" },
    { name: "Medium" },
    { name: "Large" },
    { name: "Massive" }
  ];

  const eventModeData = [
    { name: "Online" },
    { name: "Offline" },
    { name: "Hybrid" }
  ];

  const sponsorCategoryData = [
    { name: "Food & Beverage" },
    { name: "Technology" },
    { name: "Education" },
    { name: "Entertainment" }
  ];

 const sponsorTypeData = [
  { name: "Cash / Dana" },
  { name: "Produk" },
  { name: "Layanan" },
  { name: "Media Partner" },
  { name: "Voucher / Gift" },
  { name: "Merchandise" },
  { name: "Equipment Support" }
];


  const sponsorScopeData = [
    { name: "Local" },
    { name: "National" },
    { name: "International" }
  ];

  // Insert master
  await db.insert(eventCategories).values(eventCategoryData);
  await db.insert(eventSponsorTypes).values(eventSponsorTypeData);
  await db.insert(eventSizes).values(eventSizeData);
  await db.insert(eventModes).values(eventModeData);

  await db.insert(sponsorCategories).values(sponsorCategoryData);
  await db.insert(sponsorTypes).values(sponsorTypeData);
  await db.insert(sponsorScopes).values(sponsorScopeData);

  console.log("Master tables seeded successfully!");
  process.exit(0);
}

seedMaster().catch((err) => {
  console.error(err);
  process.exit(1);
});
