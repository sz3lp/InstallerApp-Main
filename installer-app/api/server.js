const express = require("express");
const app = express();
app.use(express.json());

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

app.get("/api/jobs", (req, res) => {
  const { assignedTo } = req.query;
  if (!assignedTo) return res.json([]);
  const jobs = sampleJobs.filter((j) => j.assignedTo === assignedTo);
  res.json(jobs);
});

app.post("/api/jobs/:id/checklist", (req, res) => {
  console.log("Checklist submitted for job", req.params.id, req.body);
  res.status(200).json({ ok: true });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on ${port}`));
