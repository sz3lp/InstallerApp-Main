export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    console.log("Checklist submitted for job", id, body);
    // Here you could store the checklist payload to a database
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to process checklist", err);
    return res.status(500).json({ error: "Failed to process checklist" });
  }
}
