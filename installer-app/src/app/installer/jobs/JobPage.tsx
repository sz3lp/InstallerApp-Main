import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../../components/ui/SZButton";
import SZChecklist from "../../../components/ui/SZChecklist";
import { useJobs } from "../../../lib/hooks/useJobs";
import { useChecklist } from "../../../lib/hooks/useChecklist";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";
import { SZTable } from "../../../components/ui/SZTable";
import uploadDocument from "../../../lib/uploadDocument";
import DocumentViewerModal from "../../../installer/components/DocumentViewerModal";

const JobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, updateStatus } = useJobs();
  const { items, toggleItem } = useChecklist(id || "");
  const { items: mats, updateUsed } = useJobMaterials(id || "");
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocs, setShowDocs] = useState(false);
  const [feedback, setFeedback] = useState("");
  const job = jobs.find((j) => j.id === id);

  useEffect(() => {
    async function loadDocs() {
      if (!id) return;
      const { default: supabase } = await import("../../../lib/supabaseClient");
      const { data } = await supabase
        .from("documents")
        .select("id, name, type, path, url")
        .eq("job_id", id);
      setDocuments(data ?? []);
    }
    loadDocs();
  }, [id]);

  if (!job) return <p className="p-4">Job not found</p>;

  const checklistItems = items.map((c) => ({ ...c, onToggle: toggleItem }));

  const handleSubmit = async () => {
    if (id) await updateStatus(id, "submitted");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    const uploaded = await uploadDocument(file);
    if (!uploaded) return;
    const { default: supabase } = await import("../../../lib/supabaseClient");
    await supabase.from("documents").insert({
      job_id: id,
      name: uploaded.name,
      type: uploaded.type,
      path: uploaded.path,
      url: uploaded.url,
    });
    setDocuments((d) => [...d, uploaded]);
    e.target.value = "";
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || !id) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: id, notes: feedback }),
    });
    setFeedback("");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{job.clinic_name}</h1>
      <h2 className="text-xl font-semibold">Checklist</h2>
      <SZChecklist items={checklistItems} />
      <h2 className="text-xl font-semibold">Materials</h2>
      <SZTable headers={["Material", "Qty", "Used"]}>
        {mats.map((m) => (
          <tr key={m.id} className="border-t">
            <td className="p-2 border">{m.material_id}</td>
            <td className="p-2 border text-right">{m.quantity}</td>
            <td className="p-2 border">
              <input
                type="number"
                value={m.used_quantity}
                className="border rounded px-2 py-1 w-16"
                onChange={(e) => updateUsed(m.id, Number(e.target.value))}
              />
            </td>
          </tr>
        ))}
      </SZTable>

      <div className="space-y-2">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
        />
        {documents.length > 0 && (
          <SZButton variant="secondary" onClick={() => setShowDocs(true)}>
            View Documents
          </SZButton>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave feedback"
          className="w-full border rounded p-2"
        />
        <SZButton onClick={handleFeedbackSubmit}>Submit Feedback</SZButton>
      </div>

      <SZButton onClick={handleSubmit}>Submit Job</SZButton>

      <DocumentViewerModal
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
        documents={documents}
      />
    </div>
  );
};

export default JobPage;
