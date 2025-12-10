import { db } from '../db/index.js';
import { users, eoProfiles, sponsorProfiles} from '../db/schema/users.js';
import { eq } from 'drizzle-orm';


/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     description: Fetch the authenticated user's profile including EO or Sponsor profile details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     role:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     profile_picture_url:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                 profile:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({message: 'Unauthorized'});

    const found = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const user = found[0]
    if(!user) return res.status(404).json({ message: 'User not found'});

    const base = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile_picture_url: user.profile_picture_url || null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    if(user.role == "EO"){
      const [eo] = await db
        .select()
        .from(eoProfiles)
        .where(eq(eoProfiles.user_id, userId))
        .limit(1);
      
      return res.json({
        user: base,
        profile: eo || null
      });
    }
    if(user.role == "SPONSOR"){
      const [sp] = await db
        .select()
        .from(sponsorProfiles)
        .where(eq(sponsorProfiles.user_id, userId))
        .limit(1);
      
      return res.json({
        user: base,
        profile: sp || null
      });
    }
    return res.status(400).json({ message: 'Role not recognized'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update authenticated user's profile. Supports EO and Sponsor specific fields. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_picture_url:
 *                 type: string
 *                 nullable: true
 *               organization_name:
 *                 type: string
 *                 nullable: true
 *               website:
 *                 type: string
 *                 nullable: true
 *               organization_address:
 *                 type: string
 *                 nullable: true
 *               company_name:
 *                 type: string
 *                 nullable: true
 *               company_address:
 *                 type: string
 *                 nullable: true
 *               industry:
 *                 type: string
 *                 nullable: true
 *               social_media:
 *                 type: string
 *                 nullable: true
 *               sponsor_category_id:
 *                 type: integer
 *                 nullable: true
 *               sponsor_type_id:
 *                 type: integer
 *                 nullable: true
 *               sponsor_scope_id:
 *                 type: integer
 *                 nullable: true
 *               budget_min:
 *                 type: number
 *                 nullable: true
 *               budget_max:
 *                 type: number
 *                 nullable: true
 *               status:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invalid role
 *       500:
 *         description: Internal server error
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!role) return res.status(400).json({ message: 'User role missing' });

    const { profile_picture_url, ...body } = req.body;

    await db.update(users)
      .set({
        updated_at: new Date(),
        ...(profile_picture_url !== undefined ? { profile_picture_url } : {})
      })
      .where(eq(users.id, userId));

    let updated = null;

    if (role === 'EO') {
      const allowed = ['organization_name', 'website', 'organization_address'];

      const payload = {};
      allowed.forEach(k => {
        if (body.hasOwnProperty(k)) {
          payload[k] = body[k] === undefined ? null : body[k];
        }
      });

      const found = await db.select()
        .from(eoProfiles)
        .where(eq(eoProfiles.user_id, userId))
        .limit(1);

      if (!found.length) {
        const insertObj = {
          user_id: userId,
          organization_name: payload.organization_name ?? null,
          website: payload.website ?? null,
          organization_address: payload.organization_address ?? null,
          created_at: new Date(),
          updated_at: new Date()
        };

        const [ins] = await db.insert(eoProfiles).values(insertObj).returning();
        updated = ins;

      } else {
        const [upd] = await db.update(eoProfiles)
          .set({
            ...payload,
            updated_at: new Date()
          })
          .where(eq(eoProfiles.user_id, userId))
          .returning();

        updated = upd;
      }
    }


    else if (role === 'SPONSOR') {
      const allowed = [
        'company_name',
        'company_address',
        'industry',
        'website',
        'social_media',
        'sponsor_category_id',
        'sponsor_type_id',
        'sponsor_scope_id',
        'budget_min',
        'budget_max',
        'status'
      ];

      const payload = {};
      allowed.forEach(k => {
        if (body.hasOwnProperty(k)) {
          payload[k] = body[k] === undefined ? null : body[k];
        }
      });

      const found = await db.select()
        .from(sponsorProfiles)
        .where(eq(sponsorProfiles.user_id, userId))
        .limit(1);

      if (!found.length) {
        const insertObj = {
          user_id: userId,
          company_name: payload.company_name ?? null,
          company_address: payload.company_address ?? null,
          industry: payload.industry ?? null,
          website: payload.website ?? null,
          social_media: payload.social_media ?? null,
          sponsor_category_id: payload.sponsor_category_id ?? null,
          sponsor_type_id: payload.sponsor_type_id ?? null,
          sponsor_scope_id: payload.sponsor_scope_id ?? null,
          budget_min: payload.budget_min ?? null,
          budget_max: payload.budget_max ?? null,
          status: payload.status ?? null,
          created_at: new Date(),
          updated_at: new Date()
        };

        const [ins] = await db.insert(sponsorProfiles).values(insertObj).returning();
        updated = ins;

      } else {
        const [upd] = await db.update(sponsorProfiles)
          .set({
            ...payload,
            updated_at: new Date()
          })
          .where(eq(sponsorProfiles.user_id, userId))
          .returning();

        updated = upd;
      }

    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    return res.json({
      message: 'Profile updated',
      profile: updated
    });

  } catch (err) {
    console.error('updateProfile error', err);
    return res.status(500).json({ message: err.message });
  }
};