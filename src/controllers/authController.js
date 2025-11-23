import { db } from '../db/index.js';
import { eoProfiles, sponsorProfiles, users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
// import { googleClient } from '../config/googleAuth.js'; config file should export googleClient
import dotenv from 'dotenv';
dotenv.config();

const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export const registerUser = async (req, res) => {
  try {
    const { name, email, role, phone, password, confirm_password, organization_name, company_name} = req.body;
    if (!name) return res.status(400).json({ message: 'Name Required' });
    if (!email) return res.status(400).json({ message: 'Email Required' });
    if (!role) return res.status(400).json({ message: 'Role Required' });
    if (!phone) return res.status(400).json({ message: 'Phone Required' });
    if (!password) return res.status(400).json({ message: 'Password Required' });
    if(!confirm_password) return res.status(400).json({message: 'Confirm Password Required'});

    if(password !== confirm_password)
      return res.status(400).json({message: 'Password do not match'});

    if(phone && !/^\+?\d{10,15}$/.test(phone))
      return res.status(400).json({message: 'Invalid phone number'});

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await hashPassword(password);
    const [created] = await db.insert(users).values({
      name,
      role,
      email,
      password: hashed,
      phone,
    }).returning();

    if (role == "EO" || role == "Eo" || role == "eo"){
      await db.insert(eoProfiles).values({
        user_id : created.id,
        organization_name: organization_name || created.name,
      })
    }
    if (role == "SPONSOR" || role == "Sponsor" || role == "sponsor"){
      await db.insert(sponsorProfiles).values({
        user_id: created.id,
        company_name: company_name || created.name,
      })
    }
    const token = generateToken({ id: created.id, email: created.email, role: created.role}, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ user: created, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    const user = found[0];
      
    if (!user) { 
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.password) {
      return res.status(400).json({ message: 'User registered via Google. Use Google login.' })
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      { expiresIn: JWT_EXPIRES }
    );
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile_picture: user.profile_picture_url,
      created_at : user.createdAt
    }
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// export const loginWithGoogle = async (req, res) => {
//   try {
//     const { id_token } = req.body;
//     if (!id_token) return res.status(400).json({ message: 'id_token is required' });

//     const ticket = await googleClient.verifyIdToken({
//       idToken: id_token,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const payload = ticket.getPayload();
//     const email = payload.email;
//     const name = payload.name;
//     const googleId = payload.sub;
//     const picture = payload.picture ?? null;

//     let found = await db.select().from(users).where(eq(users.email, email)).limit(1);
//     let user = found[0];

//     if (!user) {
//       const [created] = await db.insert(users).values({
//         name,
//         email,
//         google_id: googleId,
//         password: null,
//         role: 'user'
//       }).returning();
//       user = created;
//     } else if (!user.google_id) {
//       await db.update(users).set({ google_id: googleId }).where(eq(users.id, user.id));
//       const [updated] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
//       user = updated;
//     }

//     const token = generateToken({ id: user.id, email: user.email, role: user.role }, { expiresIn: JWT_EXPIRES });
//     const safeUser = { ...user, password: undefined };
//     res.json({ user: safeUser, token });
//   } catch (err) {
//     console.error('Google login error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };


