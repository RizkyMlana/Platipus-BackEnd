import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import dotenv from 'dotenv';

dotenv.config();

const client = postgres(process.env.SUPABASE_URL, {
    ssl: 'require',
});

export const db = drizzle(client, { schema })

try{
    await client`SELECT 1`;
    console.log("Database Connected");
}catch (err) {
    console.error('Database Failed')
}