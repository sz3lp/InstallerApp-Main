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

export function MaterialUsage({ jobId }: { jobId: string }) {
  const { session } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("installer_inventory")
        .select("material_id, quantity, material(name)")
        .eq("installer_id", session?.user?.id);
      setMaterials(data ?? []);
    };
    if (session?.user?.id) fetch();
  }, [session]);

  const logUsage = async () => {
    if (!selected || !qty) return;
    await supabase.from("job_materials_used").insert({
      job_id: jobId,
      material_id: selected,
      quantity: qty,
      installer_id: session?.user?.id,
      used_at: new Date().toISOString(),
    });

    await supabase.rpc("decrement_inventory", {
      installer_id_input: session?.user?.id,
      material_id_input: selected,
      amount: qty,
    });

    alert("Usage logged");
  };

  return (
    <div className="space-y-2">
      <label htmlFor="material">Material</label>
      <select
        id="material"
        value={selected ?? ""}
        onChange={(e) => setSelected(e.target.value)}
        className="border p-1 rounded"
      >
        <option value="">Select Material</option>
        {materials.map((m) => (
          <option key={m.material_id} value={m.material_id}>
            {m.material.name} — {m.quantity} in stock
          </option>
        ))}
      </select>
      <input
        type="number"
        value={qty}
        min={1}
        className="border p-1 w-24"
        onChange={(e) => setQty(parseInt(e.target.value))}
      />
      <SZButton onClick={logUsage}>Log Usage</SZButton>
    </div>
  );
}

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


      <MaterialUsage jobId={id || ""} />



      <MaterialUsage jobId={id || ""} />



      <MaterialUsage jobId={id || ""} />




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
