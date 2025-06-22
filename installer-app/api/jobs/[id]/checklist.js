import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_API_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const { error } = await supabase.from("audit_log").insert({
      job_id: id,
      event: "checklist_submitted",
      details: body,
    });
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to process checklist", err);
    return res.status(500).json({ error: "Failed to process checklist" });
  }
}
