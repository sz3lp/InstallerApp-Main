import { createClient } from "@supabase/supabase-js";

// Ensure these are populated in `.env.local` or your hosting provider:
// VITE_SUPABASE_URL=https://your-project-id.supabase.co
// VITE_SUPABASE_API_KEY=your-anon-key-here
// (also reads NEXT_PUBLIC_ or un-prefixed variants for compatibility)

// Read credentials from environment variables (works in both Vite and Node)
const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_API_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials", { supabaseUrl, supabaseAnonKey });
  throw new Error("Supabase environment variables are missing. Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Accept: "application/json",
    },
  },
});
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export default supabase;
