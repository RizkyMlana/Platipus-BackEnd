import { db } from '../db/index.js';
import { users, eoProfiles, sponsorProfiles} from '../db/schema/users.js';
import { sponsorCategories, sponsorScopes, sponsorTypes } from '../db/schema/masterTable.js';
import { eq } from 'drizzle-orm';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === 'EO') {
      const [eo] = await db
        .select()
        .from(eoProfiles)
        .where(eq(eoProfiles.user_id, userId));

      return res.json({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture_url,
        organization: eo ? {
          organization_name: eo.organization_name,
          about: eo.about,
          website: eo.website
        } : null
      });
    }

    if (user.role === 'SPONSOR') {
      const [sp] = await db
      .select()
      .from(sponsorProfiles)
      .where(eq(sponsorProfiles.user_id, userId));

    const categories = await db.select().from(sponsorCategories);
    const types = await db.select().from(sponsorTypes);
    const scopes = await db.select().from(sponsorScopes);

    res.json({
      profile: sp || null,
      dropdowns: { categories, types, scopes },
    });

    }

    return res.status(400).json({ message: "Role not recognized" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    let updated;

    if (role === 'EO') {
      const { organization_name, website, profile_picture_url, organization_address} = req.body;

      [updated] = await db
        .update(eoProfiles)
        .set({
          organization_name,
          website: website || null,
          profile_picture_url: profile_picture_url || null,
          organization_address: organization_address || null
        })
        .where(eq(eoProfiles.user_id, userId))
        .returning();

    } else if (role === 'SPONSOR') {
      const {
        profile_picture_url,
        company_name,
        company_address,
        industry,
        website,
        social_media,
        sponsor_category_id,
        sponsor_type_id,
        sponsor_scope_id,
        budget_min,
        budget_max,
        status
      } = req.body;

      [updated] = await db
        .update(sponsorProfiles)
        .set({
          company_name,
          company_address: company_address || null,
          industry: industry || null,
          website: website || null,
          social_media: social_media || null,
          profile_picture_url: profile_picture_url || null,
          sponsor_category_id,
          sponsor_type_id,
          sponsor_scope_id,
          budget_min,
          budget_max,
          status
        })
        .where(eq(sponsorProfiles.user_id, userId))
        .returning();
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    res.json({ message: 'Profile updated', profile: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
