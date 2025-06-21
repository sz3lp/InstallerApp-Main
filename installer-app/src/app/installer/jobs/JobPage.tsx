import React from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../../components/ui/SZButton";
import SZChecklist from "../../../components/ui/SZChecklist";
import { useJobs } from "../../../lib/hooks/useJobs";
import { useChecklist } from "../../../lib/hooks/useChecklist";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";

const JobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, updateStatus } = useJobs();
  const { items, toggleItem } = useChecklist(id || "");
  const { items: mats } = useJobMaterials(id || "");
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
      <ul className="list-disc pl-5 space-y-1">
        {mats.map((m) => (
          <li key={m.id}>
            {m.material_id}: {m.used_quantity}/{m.quantity}
          </li>
        ))}
      </ul>
      <SZButton onClick={handleSubmit}>Submit Job</SZButton>
    </div>
  );
};

export default JobPage;
