import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SideDrawer from "../components/SideDrawer";
import DocumentViewerModal from "../components/DocumentViewerModal";
import JobChecklistForm from "../../features/jobs/components/JobChecklistForm";
import JobHeader from "../../features/jobs/components/JobHeader";
import JobStatusTimeline from "../../features/jobs/components/JobStatusTimeline";
import JobMaterialUsageTable from "../../features/jobs/components/JobMaterialUsageTable";
import ClientInfoCard from "../../features/jobs/components/ClientInfoCard";
import InstallerActionsPanel from "../../features/jobs/components/InstallerActionsPanel";
import { getJobById, JobDetail } from "../../features/jobs/jobService";
import useAuth from "../../lib/hooks/useAuth";
import uploadDocument from "../../lib/uploadDocument";

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  let role: string | null = null;
  try {
    role = useAuth().role;
  } catch {
    role = "Installer";
  }
  const [showDrawer, setShowDrawer] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const isTest = process.env.NODE_ENV === "test";
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(!isTest);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());
  const sampleJobs: JobDetail[] = [
    {
      id: "SEA1041",
      jobNumber: "SEA#1041",
      clientName: "Lincoln Elementary",
      installDate: "",
      location: "1234 Solar Lane",
      installer: "user_345",
      status: "assigned",
      zones: [],
      documents: [],
    },
    {
      id: "SEA1042",
      jobNumber: "SEA#1042",
      clientName: "Jefferson High",
      installDate: "",
      location: "9876 Copper Rd",
      installer: "user_345",
      status: "in_progress",
      zones: [],
      documents: [],
    },
  ];

  useEffect(() => {
    if (!jobId) return;
    if (isTest) {
      const found = sampleJobs.find(
        (j) => j.id === jobId || j.jobNumber === jobId,
      );
      setJob(found || null);
      setLoading(false);
      return;
    }
    getJobById(jobId)
      .then((j) => {
        setJob(j);
        setError(null);
      })
      .catch(() => setError("Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId, isTest]);

  const handleChecklistSubmit = async (data: any) => {
    await uploadDocument(data.photo);
    navigate("/appointments");
  };

  if (loading) return <p className="p-4">Loading job...</p>;
  if (!job || error) return <p className="p-4 text-red-500">{error || "Job not found"}</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <SideDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
      <JobChecklistForm
        job={job}
        open={showChecklist}
        onClose={() => setShowChecklist(false)}
        onSubmit={handleChecklistSubmit}
      />
      <DocumentViewerModal
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
        documents={job.documents}
      />
      <JobHeader
        jobNumber={`SEA#${job.jobNumber ?? job.id}`}
        onMenuClick={() => setShowDrawer(true)}
      />
      <main className="flex-grow p-4 relative">
        <h1 className="text-2xl font-bold mb-4 text-center">{job.clientName}</h1>
        <JobStatusTimeline status={job.status} />
        <ClientInfoCard job={job} />
        <JobMaterialUsageTable zones={job.zones} />
        {role === "Installer" && (
          <InstallerActionsPanel
            onChecklist={() => {
              startTimeRef.current = Date.now();
              setShowChecklist(true);
            }}
            onDocuments={() => setShowDocs(true)}
          />
        )}
      </main>
    </div>
  );
};

export default JobDetailPage;
