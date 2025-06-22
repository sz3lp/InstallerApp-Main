import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../../components/ui/SZInput";
import { SZButton } from "../../../components/ui/SZButton";
import { SZTable } from "../../../components/ui/SZTable";
import useClinics from "../../../lib/hooks/useClinics";
import useInstallers from "../../../lib/hooks/useInstallers";
import useMaterials from "../../../lib/hooks/useMaterials";
import supabase from "../../../lib/supabaseClient";

interface MaterialRow {
  material_id: string;
  quantity: number;
}

const AdminNewJob: React.FC = () => {
  const navigate = useNavigate();
  const [clinics] = useClinics();
  const { installers } = useInstallers();
  const { materials } = useMaterials();

  const [clinicId, setClinicId] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [installerId, setInstallerId] = useState("");
  const [rows, setRows] = useState<MaterialRow[]>([{ material_id: "", quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRowChange = (idx: number, key: keyof MaterialRow, value: any) => {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const addRow = () => setRows((rs) => [...rs, { material_id: "", quantity: 1 }]);
  const removeRow = (idx: number) => setRows((rs) => rs.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!clinicId || !address || !startDate || !installerId) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const clinic = clinics.find((c) => c.id === clinicId);
      const materialsData = rows
        .filter((r) => r.material_id)
        .map((r) => ({ material_id: r.material_id, quantity: r.quantity }));
      const { data, error } = await supabase.rpc("create_job_with_materials", {
        p_clinic_name: clinic?.name ?? "",
        p_address: address,
        p_start_time: startDate,
        p_installer: installerId,
        p_materials: materialsData,
      });
      if (error) throw error;
      if (data) navigate(`/admin/jobs/${data}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Create Job</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="clinic" className="block text-sm font-medium text-gray-700">
            Clinic
          </label>
          <select
            id="clinic"
            className="border rounded px-3 py-2 w-full"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
          >
            <option value="">Select</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <SZInput id="address" label="Address" value={address} onChange={setAddress} />
        <SZInput
          id="startDate"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <div>
          <label htmlFor="installer" className="block text-sm font-medium text-gray-700">
            Installer
          </label>
          <select
            id="installer"
            className="border rounded px-3 py-2 w-full"
            value={installerId}
            onChange={(e) => setInstallerId(e.target.value)}
          >
            <option value="">Select</option>
            {installers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name || i.id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <h2 className="text-xl font-semibold">Materials</h2>
      <SZTable headers={["Product", "Qty", ""]}>
        {rows.map((r, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-2 border">
              <select
                className="border rounded px-2 py-1 w-full"
                value={r.material_id}
                onChange={(e) => handleRowChange(idx, "material_id", e.target.value)}
              >
                <option value="">Select</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </td>
            <td className="p-2 border">
              <input
                type="number"
                min={1}
                className="border rounded px-2 py-1 w-24"
                value={r.quantity}
                onChange={(e) => handleRowChange(idx, "quantity", Number(e.target.value))}
              />
            </td>
            <td className="p-2 border text-center">
              <button type="button" className="text-red-600" onClick={() => removeRow(idx)}>
                X
              </button>
            </td>
          </tr>
        ))}
      </SZTable>
      <SZButton variant="secondary" size="sm" onClick={addRow}>
        Add Material
      </SZButton>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div>
        <SZButton onClick={handleSubmit} isLoading={submitting}>
          Create Job
        </SZButton>
      </div>
    </div>
  );
};

export default AdminNewJob;
