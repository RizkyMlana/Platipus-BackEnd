import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './src/db/index.js';
import { users } from './src/db/schema/users.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/db', async(req, res)=> {
    try {
    const data = await db.select().from(users);
    res.json({ message: "DB connected!", users: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));