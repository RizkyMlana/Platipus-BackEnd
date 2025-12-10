import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();


const supabaseUrl = process.env.SUPABASE_URL
const supabaseRoleKey = process.env.SUPABASE_ROLE_KEY

export const supa = createClient(supabaseUrl, supabaseRoleKey);
