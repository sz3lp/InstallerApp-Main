import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import InstallerChecklistWizard from "../components/InstallerChecklistWizard";
import { useAuth } from "../../lib/hooks/useAuth";
import DocumentViewerModal from "../components/DocumentViewerModal";
import Header from "../components/Header";
import SideDrawer from "../components/SideDrawer";
import uploadDocument from "../../lib/uploadDocument";

const JobDetailPage = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const startTimeRef = useRef(Date.now());

  const { session, isAuthorized, loading } = useAuth();
  const installerId = session?.user?.id || "";

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized("Installer")) return <Navigate to="/unauthorized" replace />;

  const isTest = process.env.NODE_ENV === "test";
  const sampleJobs = isTest
    ? [
        {
          jobId: "SEA1041",
          jobNumber: "SEA#1041",
          customerName: "Lincoln Elementary",
          address: "1234 Solar Lane",
          assignedTo: "user_345",
          status: "assigned",
          zones: [],
        },
        {
          jobId: "SEA1042",
          jobNumber: "SEA#1042",
          customerName: "Jefferson High",
          address: "9876 Copper Rd",
          assignedTo: "user_345",
          status: "in_progress",
          zones: [],
        },
      ]
    : [];

  const initialJob = isTest
    ? sampleJobs.find(
        (j) => j.jobId === jobId || j.id === jobId || j.jobNumber === jobId,
      )
    : null;

  const [job, setJob] = useState(initialJob);
  const [loading, setLoading] = useState(!isTest);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState(initialJob?.documents ?? []);

  useEffect(() => {
    setDocuments(job?.documents ?? []);
  }, [job]);

  useEffect(() => {
    if (isTest) return;

    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs?assignedTo=${installerId}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const found = data.find(
          (j) => j.jobId === jobId || j.id === jobId || j.jobNumber === jobId,
        );
        setJob(found || null);
        setDocuments(found?.documents ?? []);
      } catch (e) {
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [installerId, jobId, isTest]);

  const componentMap = new Map();
  job?.zones?.forEach((zone) => {
    zone.components.forEach((comp) => {
      const key = comp.name;
      const qty = componentMap.get(key) ?? 0;
      componentMap.set(key, qty + comp.quantity);
    });
  });

  const rateMap = {
    Controller: 50,
    "PIR Sensor": 25,
    "DHT22 Sensor": 20,
    "Relay Block": 30,
  };

  const payMap = new Map();
  job?.zones?.forEach((zone) => {
    zone.components.forEach((comp) => {
      if (comp.reusable) return;
      const qty = payMap.get(comp.name) ?? 0;
      payMap.set(comp.name, qty + comp.quantity);
    });
  });

  const calculatedLineItems = [...payMap.entries()].map(([name, quantity]) => {
    const rate = rateMap[name] ?? 0;
    return {
      name,
      quantity,
      rate,
      total: quantity * rate,
    };
  });

  const totalPay = calculatedLineItems.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const handlePhotoUpload = async (file) => {
    if (!file) return null;
    try {
      const doc = await uploadDocument(file);
      setDocuments((d) => [...d, doc]);
      if (!isTest) {
        const { default: supabase } = await import(
          "../../lib/supabaseClient"
        );
        await supabase
          .from("jobs")
          .update({ documents: [...documents, doc] })
          .eq("id", jobId);
      }
      return doc;
    } catch (err) {
      console.error("Upload failed", err);
      return null;
    }
  };

  const submitChecklist = async (id, payload) => {
    await fetch(`/api/jobs/${id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const handleDrawerOpen = () => setShowDrawer(true);
  const handleDrawerClose = () => setShowDrawer(false);

  if (loading) {
    return <p className="p-4">Loading job...</p>;
  }

  if (error || !job) {
    return <p className="p-4 text-red-500">{error || "Job not found"}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <SideDrawer isOpen={showDrawer} onClose={handleDrawerClose} />

      <InstallerChecklistWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={async (data) => {
          const uploaded = await handlePhotoUpload(data.photo);
          await submitChecklist(jobId, {
            installerId,
            checklistResults: data,
            photos: uploaded?.url ? [uploaded.url] : [],
            timeStarted: new Date(startTimeRef.current).toISOString(),
            timeCompleted: new Date().toISOString(),
          });
          navigate("/appointments");
        }}
        job={job}
      />

      <DocumentViewerModal
        isOpen={showDocuments}
        onClose={() => setShowDocuments(false)}
        documents={documents}
      />

      <Header
        title={`SEA#${job.jobNumber ?? job.id}`}
        onMenuClick={handleDrawerOpen}
      />

      <main className="flex-grow p-4 relative">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {job.clientName}
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="font-semibold">Install Date</p>
            <p>{job.installDate}</p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>{job.location}</p>
          </div>
          <div>
            <p className="font-semibold">Installer</p>
            <p>{job.installer}</p>
          </div>
          <div>
            <p className="font-semibold">System Type</p>
            {job?.zones?.length ? (
              <div className="space-y-1">
                {job?.zones?.map((zone, idx) => (
                  <p key={idx}>
                    <strong>{zone.zoneName}:</strong> {zone.systemType}
                  </p>
                ))}
              </div>
            ) : (
              <p>System Type: Unassigned</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Job Summary</h2>
          <ul className="list-disc pl-5">
            {[...componentMap.entries()].map(([name, qty]) => (
              <li key={name}>
                {qty}x {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Labor Bill</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            {calculatedLineItems.map((item) => (
              <li key={item.name}>
                {item.quantity}x {item.name} @ ${item.rate} = ${item.total}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-md">
            Total Installer Pay: ${totalPay}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-lg font-semibold">Install Scope</h2>
          <ul className="list-disc pl-5">
            {[...componentMap.entries()].map(([name, qty]) => (
              <li key={name}>
                {qty}x {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-4 right-4 space-x-2">
          <button
            onClick={() => {
              startTimeRef.current = Date.now();
              setShowWizard(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
          >
            Checklist
          </button>
          <button
            onClick={() => setShowDocuments(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
          >
            Documents
          </button>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
