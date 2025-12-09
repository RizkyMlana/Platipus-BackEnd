import { db } from '../db/index.js';
import { eoProfiles, sponsorProfiles, users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

export const registerUser = async (req, res) => {
  try {
    let { name, email, role, phone, password, confirm_password, organization_name, company_name } = req.body;

    // Basic validation
    if (!name) return res.status(400).json({ message: 'Name Required' });
    if (!email) return res.status(400).json({ message: 'Email Required' });
    if (!role) return res.status(400).json({ message: 'Role Required' });
    if (!phone) return res.status(400).json({ message: 'Phone Required' });
    if (!password) return res.status(400).json({ message: 'Password Required' });
    if (!confirm_password) return res.status(400).json({ message: 'Confirm Password Required' });
    if (password !== confirm_password) return res.status(400).json({ message: 'Password do not match' });

    // Clean email & role
    email = email.trim().toLowerCase();
    role = role.trim().toLowerCase();

    // Validate role
    const validRoles = ['eo', 'sponsor'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid Role' });

    // Normalize phone
    phone = phone.replace(/[\s\-]/g, '');
    if (!/^\+?\d{9,15}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone number' });

    // Check email uniqueness
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    // Hash password
    const hashed = await hashPassword(password);

    // Transaction: create user + profile
    const createdUser = await db.transaction(async (tx) => {
      const [created] = await tx.insert(users)
        .values({
          name,
          role: role.toUpperCase(), // Store in uppercase for consistency
          email,
          password: hashed,
          phone
        })
        .returning();

      if (role === 'eo') {
        await tx.insert(eoProfiles).values({
          user_id: created.id,
          organization_name: organization_name || created.name
        });
      }

      if (role === 'sponsor') {
        await tx.insert(sponsorProfiles).values({
          user_id: created.id,
          company_name: company_name || created.name
        });
      }

      return created;
    });

    // Generate JWT
    const token = generateToken(
      { id: createdUser.id, email: createdUser.email, role: createdUser.role },
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({ user: createdUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }
    email = email.trim().toLowerCase();

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    const user = found[0];
      
    if (!user) { 
      return res.status(401).json({ message: 'Invalid credentials' })
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
      profile_picture_url: user.profile_picture_url,
      created_at : user.created_at
    }
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};