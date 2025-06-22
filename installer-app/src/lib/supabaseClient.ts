import { createClient } from "@supabase/supabase-js";

// Ensure these are populated in `.env.local`:
// NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

// Read credentials from environment variables (works in both Vite and Node)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials", { supabaseUrl, supabaseAnonKey });
  throw new Error("Supabase environment variables are missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
