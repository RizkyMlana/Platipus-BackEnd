import { db } from '../db/index.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';

export const getProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const found = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const user = found[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    const safeUser = { ...user, password: undefined };
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};