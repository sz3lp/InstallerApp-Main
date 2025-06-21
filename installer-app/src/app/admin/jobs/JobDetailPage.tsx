import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SZButton } from "../../../components/ui/SZButton";
import { SZTable } from "../../../components/ui/SZTable";
import { useJobs } from "../../../lib/hooks/useJobs";
import { useJobMaterials } from "../../../lib/hooks/useJobMaterials";
import { useInstallers } from "../../../lib/hooks/useInstallers";
import supabase from "../../../lib/supabaseClient";

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, assignJob } = useJobs();
  const { items, updateUsed, addMaterial, fetchItems } = useJobMaterials(
    id || "",
  );
  const { installers } = useInstallers();
  const [materials, setMaterials] = useState<{ id: string; name: string }[]>(
    [],
  );
  const job = jobs.find((j) => j.id === id);
  const [installerId, setInstallerId] = useState(job?.assigned_to || "");
  const [newMaterial, setNewMaterial] = useState("");
  const [newQty, setNewQty] = useState(1);

  useEffect(() => {
    async function loadMaterials() {
      const { data } = await supabase
        .from<{ id: string; name: string }>("materials")
        .select("id, name");
      setMaterials(data ?? []);
    }
    loadMaterials();
  }, []);

  const handleAssign = async () => {
    if (id && installerId) {
      await assignJob(id, installerId);
    }
  };

  const handleAddMaterial = async () => {
    if (!id || !newMaterial) return;
    await addMaterial(newMaterial, newQty);
    setNewMaterial("");
    setNewQty(1);
    fetchItems();
  };

  if (!job) return <p className="p-4">Job not found</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{job.clinic_name}</h1>
      <div>
        <label
          htmlFor="installer"
          className="block text-sm font-medium text-gray-700"
        >
          Assign Installer
        </label>
        <select
          id="installer"
          className="border rounded px-3 py-2 w-full"
          value={installerId}
          onChange={(e) => setInstallerId(e.target.value)}
        >
          <option value="">Select</option>
          {installers.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.full_name || inst.id}
            </option>
          ))}
        </select>
      </div>
      <SZButton onClick={handleAssign}>Assign</SZButton>
      <h2 className="text-xl font-semibold mt-4">Materials</h2>
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label
            htmlFor="material"
            className="block text-sm font-medium text-gray-700"
          >
            Material
          </label>
          <select
            id="material"
            className="border rounded px-3 py-2"
            value={newMaterial}
            onChange={(e) => setNewMaterial(e.target.value)}
          >
            <option value="">Select</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="qty"
            className="block text-sm font-medium text-gray-700"
          >
            Qty
          </label>
          <input
            id="qty"
            type="number"
            className="border rounded px-3 py-2 w-24"
            value={newQty}
            min={1}
            onChange={(e) => setNewQty(Number(e.target.value))}
          />
        </div>
        <SZButton size="sm" onClick={handleAddMaterial}>
          Add
        </SZButton>
      </div>
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
