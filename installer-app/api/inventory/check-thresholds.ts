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

async function notify(count: number) {
  const email = process.env.INSTALL_MANAGER_EMAIL;
  if (!email || count === 0) return;
  await supabase.functions.invoke("send_low_stock_email", {
    body: JSON.stringify({
      email,
      message: `There are ${count} new low stock alerts.`,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, error } = await supabase.rpc("generate_low_stock_alerts");
  if (error) return res.status(500).json({ error: error.message });
  await notify(data as number);
  return res.status(200).json({ created: data });
}
