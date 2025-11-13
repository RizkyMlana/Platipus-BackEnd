export default {
    schema: './src/db/schema/*',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.SUPABASE_URL
    }
}