import { createClient } from '@supabase/supabase-js';

// Supabase URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key. Please check your .env file.");
}

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
