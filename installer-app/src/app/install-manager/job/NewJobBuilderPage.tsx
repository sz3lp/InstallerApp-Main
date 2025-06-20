import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../../components/ui/SZInput";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";
import MaterialTable, { MaterialRow } from "./MaterialTable";

const initialJob = {
  clinic_name: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  address: "",
  status: "draft",
};

const NewJobBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState(initialJob);
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleJobChange = (key: string, value: string) => {
    setJob((j) => ({ ...j, [key]: value }));
  };


  const totalPrice = rows.reduce(
    (sum, r) => sum + r.quantity * (r.unit_material_cost + r.unit_labor_cost),
    0,
  );

  const techPayout = rows.reduce(
    (sum, r) => sum + r.quantity * r.unit_labor_cost,
    0,
  );

  const handleSubmit = async () => {
    if (!job.clinic_name || !job.contact_name || !job.address) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("jobs").insert(job).select();
    if (error || !data) {
      setSubmitting(false);
      return;
    }
    const jobId = data[0].id as string;
    const rowsToInsert = rows
      .filter((r) => r.material_id)
      .map((r) => ({
        job_id: jobId,
        material_id: r.material_id,
        quantity: r.quantity,
        unit_material_cost: r.unit_material_cost,
        unit_labor_cost: r.unit_labor_cost,
        sale_price: r.sale_price,
        install_location: r.install_location,
      }));
    if (rowsToInsert.length) {
      await supabase.from("job_materials").insert(rowsToInsert);
    }
    navigate("/install-manager");
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">New Job Builder</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Job Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SZInput
            id="clinic_name"
            label="Clinic Name"
            value={job.clinic_name}
            onChange={(v) => handleJobChange("clinic_name", v)}
          />
          <SZInput
            id="contact_name"
            label="Contact Name"
            value={job.contact_name}
            onChange={(v) => handleJobChange("contact_name", v)}
          />
          <SZInput
            id="contact_phone"
            label="Contact Phone"
            value={job.contact_phone}
            onChange={(v) => handleJobChange("contact_phone", v)}
          />
          <SZInput
            id="contact_email"
            label="Contact Email"
            value={job.contact_email}
            onChange={(v) => handleJobChange("contact_email", v)}
          />
          <SZInput
            id="address"
            label="Address"
            value={job.address}
            onChange={(v) => handleJobChange("address", v)}
            className="md:col-span-2"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="status">Job Status</label>
            <select
              id="status"
              className="block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={job.status}
              onChange={(e) => handleJobChange("status", e.target.value)}
            >
              <option value="draft">draft</option>
              <option value="scheduled">scheduled</option>
              <option value="complete">complete</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Materials</h2>
        <MaterialTable onChange={setRows} />
      </section>

      <section className="space-y-1">
        <p className="font-semibold">Total Price: ${totalPrice.toFixed(2)}</p>
        <p className="font-semibold">Estimated Tech Payout: ${techPayout.toFixed(2)}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <SZButton variant="secondary" size="sm">
          Generate Installer Documents
        </SZButton>
        <SZButton variant="secondary" size="sm">
          Generate Invoice
        </SZButton>
        <SZButton variant="secondary" size="sm">
          Generate Royalty Contract
        </SZButton>
        <SZButton variant="secondary" size="sm">
          Generate Contracts
        </SZButton>
      </div>

      <div className="pt-4">
        <SZButton onClick={handleSubmit} isLoading={submitting}>
          Create Job
        </SZButton>
      </div>
    </div>
  );
};

export default NewJobBuilderPage;

