import React from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../../components/ui/SZButton";
import SZChecklist from "../../../components/ui/SZChecklist";
import { useJobs } from "../../../lib/hooks/useJobs";
import { useChecklist } from "../../../lib/hooks/useChecklist";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";
import { SZTable } from "../../../components/ui/SZTable";

const JobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, updateStatus } = useJobs();
  const { items, toggleItem } = useChecklist(id || "");
  const { items: mats, updateUsed } = useJobMaterials(id || "");
  const job = jobs.find((j) => j.id === id);

  if (!job) return <p className="p-4">Job not found</p>;

  const checklistItems = items.map((c) => ({ ...c, onToggle: toggleItem }));

  const handleSubmit = async () => {
    if (id) await updateStatus(id, "submitted");
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
      <SZButton onClick={handleSubmit}>Submit Job</SZButton>
    </div>
  );
};

export default JobPage;
