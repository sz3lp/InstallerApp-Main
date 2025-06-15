export default function handler(req, res) {
  const sampleJobs = [
    {
      jobId: "SEA1041",
      customerName: "Lincoln Elementary",
      address: "1234 Solar Lane",
      assignedTo: "user_345",
      status: "assigned",
      zones: [],
    },
    {
      jobId: "SEA1042",
      customerName: "Jefferson High",
      address: "9876 Copper Rd",
      assignedTo: "user_345",
      status: "in_progress",
      zones: [],
    },
  ];

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { assignedTo } = req.query || {};
  if (!assignedTo) {
    return res.status(200).json([]);
  }
  const jobs = sampleJobs.filter((j) => j.assignedTo === assignedTo);
  return res.status(200).json(jobs);
}
