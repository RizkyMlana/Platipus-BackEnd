import 'dotenv/config';

export default {
    schema: './src/db/schema/*',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.SUPABASE_DB_URL
    },
};