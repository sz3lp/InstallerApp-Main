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

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { assignedTo } = req.query || {};
  if (!assignedTo) {
    return res.status(200).json([]);
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id, clinic_name, address, assigned_to, status")
    .eq("assigned_to", assignedTo)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch jobs", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }

  const jobs = (data ?? []).map((j) => ({
    jobId: j.id,
    customerName: j.clinic_name,
    address: j.address,
    assignedTo: j.assigned_to,
    status: j.status,
    zones: [],
  }));

  return res.status(200).json(jobs);
}
