const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "../.env" });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_API_KEY;

if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function seed() {
  const { data: users } = await supabase.from("users").select("id").limit(5);
  for (const u of users || []) {
    await supabase.from("user_settings").upsert({ user_id: u.id });
    console.log("Seeded settings for", u.id);
  }
}

seed().then(() => {
  console.log("done");
  process.exit(0);
});
