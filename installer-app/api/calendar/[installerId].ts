import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_API_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
const secret = process.env.CALENDAR_TOKEN_SECRET || "";

function verifyToken(installerId: string, token: string | string[] | undefined) {
  if (!token || typeof token !== "string") return false;
  const [expStr, sig] = token.split("-");
  const exp = parseInt(expStr, 10);
  if (!exp || Date.now() > exp) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${installerId}-${exp}`)
    .digest("hex");
  return expected === sig;
}

function formatICSDate(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, "").slice(0, 15) + "Z";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { installerId } = req.query;
  const token = req.query.token;
  if (!installerId || typeof installerId !== "string") {
    return res.status(400).json({ error: "Missing installerId" });
  }

  if (!verifyToken(installerId, token)) {
    return res.status(403).json({ error: "Invalid token" });
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("id, clinic_name, address, scheduled_date")
    .eq("assigned_to", installerId)
    .gte("scheduled_date", new Date().toISOString())
    .order("scheduled_date", { ascending: true });

  if (error) {
    console.error("Failed to fetch jobs", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SentientZone//InstallerSchedule//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const j of data ?? []) {
    const start = j.scheduled_date ? new Date(j.scheduled_date) : new Date();
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${j.id}@sentientzone`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${formatICSDate(start)}`);
    lines.push(`DTEND:${formatICSDate(end)}`);
    if (j.clinic_name) lines.push(`SUMMARY:${j.clinic_name}`);
    if (j.address) lines.push(`LOCATION:${j.address.replace(/,/g, '\\,')}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=schedule.ics");
  // 24h caching
  res.setHeader("Cache-Control", "public, max-age=86400");
  return res.status(200).send(lines.join("\r\n"));
}
