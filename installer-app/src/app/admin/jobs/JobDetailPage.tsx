import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { SZInput } from "../../../components/ui/SZInput";
import { SZButton } from "../../../components/ui/SZButton";
import { SZTable } from "../../../components/ui/SZTable";
import { useJobs } from "../../../lib/hooks/useJobs";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, assignJob } = useJobs();
  const { items, updateUsed } = useJobMaterials(id || "");
  const job = jobs.find((j) => j.id === id);
  const [installerId, setInstallerId] = useState(job?.assigned_to || "");

  const handleAssign = async () => {
    if (id && installerId) {
      await assignJob(id, installerId);
    }
  };

  if (!job) return <p className="p-4">Job not found</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{job.clinic_name}</h1>
      <SZInput
        id="installer"
        label="Assign Installer"
        value={installerId}
        onChange={setInstallerId}
      />
      <SZButton onClick={handleAssign}>Assign</SZButton>
      <h2 className="text-xl font-semibold mt-4">Materials</h2>
      <SZTable headers={["Material", "Qty", "Used"]}>
        {items.map((m) => (
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
    </div>
  );
};

export default JobDetailPage;
