import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_API_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { jobId, notes } = req.body || {};
    if (!jobId) {
      return res.status(400).json({ error: "Missing jobId" });
    }
    const { error } = await supabase.from("feedback").insert({
      job_id: jobId,
      notes,
    });
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to submit feedback", err);
    return res.status(500).json({ error: "Failed to submit feedback" });
  }
}
