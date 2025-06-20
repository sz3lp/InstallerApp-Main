import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration: check VITE_SUPABASE_URL and VITE_SUPABASE_API_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
