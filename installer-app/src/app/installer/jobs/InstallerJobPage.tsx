import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../../components/ui/SZButton";
import { SZCard } from "../../../components/ui/SZCard";
import useAuth from "../../../lib/hooks/useAuth";
import useJobDetail from "../../../lib/hooks/useJobDetail";
import MaterialsModal from "./MaterialsModal";
import InstallerChecklistWizard from "../../../components/InstallerChecklistWizard";
import DocumentViewerModal from "../../../installer/components/DocumentViewerModal";
import supabase from "../../../lib/supabaseClient";

const InstallerJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { job, loading, error, refresh } = useJobDetail(id || null);
  const [docs, setDocs] = useState<any[]>([]);
  const [showDocs, setShowDocs] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadDocs() {
      const { data } = await supabase
        .from("documents")
        .select("id, name, type, path, url")
        .eq("job_id", id);
      setDocs(data ?? []);
    }
    loadDocs();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!job) return <p className="p-4">Job not found</p>;
  if (job.assigned_to !== session?.user?.id)
    return <p className="p-4">Not authorized</p>;

  const startJob = async () => {
    if (!job) return;
    await supabase.from("jobs").update({ status: "in_progress" }).eq("id", job.id);
    refresh();
  };

  const checklistFinished = () => {
    refresh();
    setShowChecklist(false);
  };

  return (
    <div className="p-4 space-y-4">
      <SZCard
        header={<h1 className="text-xl font-bold">{job.clinic_name}</h1>}
        className="space-y-2"
      >
        <p>
          <strong>Address:</strong> {job.address}
        </p>
        <p>
          <strong>Status:</strong> {job.status}
        </p>
        {job.notes && (
          <p className="whitespace-pre-line">
            <strong>Notes:</strong> {job.notes}
          </p>
        )}
      </SZCard>

      <div className="flex flex-wrap gap-2">
        <SZButton onClick={() => setShowDocs(true)} disabled={docs.length === 0}>
          View Documents
        </SZButton>
        <SZButton onClick={() => setShowMaterials(true)}>Log Materials Used</SZButton>
        <SZButton onClick={startJob} disabled={job.status !== "assigned"}>
          Mark Job Started
        </SZButton>
        <SZButton onClick={() => setShowChecklist(true)} disabled={job.status !== "in_progress"}>
          Mark Job Complete
        </SZButton>
      </div>

      <MaterialsModal isOpen={showMaterials} onClose={() => setShowMaterials(false)} jobId={id || null} />
      <InstallerChecklistWizard
        isOpen={showChecklist}
        onClose={() => {
          setShowChecklist(false);
          checklistFinished();
        }}
        job={job}
      />
      <DocumentViewerModal isOpen={showDocs} onClose={() => setShowDocs(false)} documents={docs} />
    </div>
  );
};

export default InstallerJobPage;
