import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl as string, serviceRoleKey as string);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { jobId } = req.body || {};
  if (!jobId) {
    return res.status(400).json({ error: "Missing jobId" });
  }

  const { data: materials, error: jmErr } = await supabase
    .from("job_materials")
    .select("material_id, quantity")
    .eq("job_id", jobId);

  if (jmErr) {
    return res.status(500).json({ error: jmErr.message });
  }

  const matIds = (materials ?? []).map((m) => m.material_id);
  const { data: levels, error: lvlErr } = await supabase
    .from("inventory_levels")
    .select("material_type_id, current_qty")
    .in("material_type_id", matIds);

  if (lvlErr) {
    return res.status(500).json({ error: lvlErr.message });
  }

  const insuff = (materials ?? []).find((m) => {
    const level = (levels ?? []).find((l) => l.material_type_id === m.material_id);
    return !level || level.current_qty < m.quantity;
  });

  if (insuff) {
    return res.status(400).json({ error: "Insufficient stock for some materials" });
  }

  for (const m of materials ?? []) {
    const level = (levels ?? []).find((l) => l.material_type_id === m.material_id);
    if (!level) continue;
    await supabase
      .from("inventory_levels")
      .update({ current_qty: level.current_qty - m.quantity })
      .eq("material_type_id", m.material_id);
    await supabase.from("inventory_audit").insert({
      material_id: m.material_id,
      job_id: jobId,
      quantity: -m.quantity,
    });
  }

  return res.status(200).json({ ok: true });
}
