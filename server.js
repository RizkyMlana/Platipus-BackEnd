import app from './app.js';
import './src/db/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
console.log("ENV CHECK: URL =", process.env.SUPABASE_URL)
console.log("ENV CHECK: URL =", process.env.SUPABASE_SERVICE_ROLE_KEY)

app.listen(PORT, () => console.log('Server Running '));