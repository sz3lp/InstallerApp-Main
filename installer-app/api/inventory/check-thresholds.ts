import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data: levels, error } = await supabase
    .from("inventory_levels")
    .select(
      "material_type_id, current_qty, reorder_threshold, material_types(name)"
    );

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const lowStock = (levels ?? []).filter(
    (row: any) => row.current_qty < row.reorder_threshold
  );

  let created = 0;
  for (const row of lowStock) {
    const message = `${row.material_types?.name || row.material_type_id} low stock: ${row.current_qty} < ${row.reorder_threshold}`;
    const { error: insertErr } = await supabase.from("notifications").insert({
      type: "low_stock",
      message,
    });
    if (!insertErr) created += 1;
  }

  return res.status(200).json({ created });
}
