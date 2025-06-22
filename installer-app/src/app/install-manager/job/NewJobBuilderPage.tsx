import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../../components/ui/SZInput";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";
import useClients from "../../../lib/hooks/useClients";

interface Material {
  id: string;
  name: string;
  base_cost: number;
  default_pay_rate: number;
  default_sale_price: number;
}

interface MaterialRow {
  material_id: string;
  quantity: number;
  sale_price: string;
  install_location: string;
}

const initialJob = {
  client_id: "",
  contact_name: "",
  contact_phone: "",
  contact_email: "",
  address: "",
  status: "draft",
};

const NewJobBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients] = useClients();
  const [job, setJob] = useState(initialJob);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [rows, setRows] = useState<MaterialRow[]>([
    { material_id: "", quantity: 1, sale_price: "", install_location: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data } = await supabase
        .from<Material>("materials")
        .select("id, name, base_cost, default_pay_rate, default_sale_price");
      setMaterials(data ?? []);
    };
    fetchMaterials();
  }, []);

  const materialMap = Object.fromEntries(
    materials.map((m) => [m.id, m]),
  ) as Record<string, Material>;

  const handleJobChange = (key: string, value: string) => {
    setJob((j) => ({ ...j, [key]: value }));
  };

  const handleRowChange = (
    index: number,
    key: keyof MaterialRow,
    value: string | number,
  ) => {
    setRows((rs) => {
      const copy = [...rs];
      // @ts-ignore
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const addRow = () =>
    setRows((r) => [
      ...r,
      { material_id: "", quantity: 1, sale_price: "", install_location: "" },
    ]);

  const removeRow = (idx: number) =>
    setRows((r) => r.filter((_, i) => i !== idx));

  const totalPrice = rows.reduce((sum, r) => {
    const m = materialMap[r.material_id];
    if (!m) return sum;
    return sum + r.quantity * (m.base_cost + m.default_pay_rate);
  }, 0);

  const techPayout = rows.reduce((sum, r) => {
    const m = materialMap[r.material_id];
    if (!m) return sum;
    return sum + r.quantity * m.default_pay_rate;
  }, 0);

  const handleSubmit = async () => {
    if (!job.client_id) {
      setError("Client must be selected before creating a job.");
      return;
    }
    if (!job.contact_name || !job.address) {
      setError("Contact name and address are required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error } = await supabase.from("jobs").insert(job).select();
    if (error || !data) {
      setSubmitting(false);
      return;
    }
    const jobId = data[0].id as string;
    const rowsToInsert = rows
      .filter((r) => r.material_id)
      .map((r) => {
        const m = materialMap[r.material_id];
        return {
          job_id: jobId,
          material_id: r.material_id,
          quantity: r.quantity,
          unit_material_cost: m.base_cost,
          unit_labor_cost: m.default_pay_rate,
          sale_price: r.sale_price
            ? parseFloat(r.sale_price)
            : m.default_sale_price,
          install_location: r.install_location,
        };
      });
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
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="client"
            >
              Client
            </label>
            <select
              id="client"
              className="block w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={job.client_id}
              onChange={(e) => handleJobChange("client_id", e.target.value)}
            >
              <option value="">Select</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
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
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="status"
            >
              Job Status
            </label>
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
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Material Cost</th>
              <th className="p-2 border">Labor Cost</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Sale Price</th>
              <th className="p-2 border">Install Location</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const m = materialMap[r.material_id];
              const mat = m?.base_cost ?? 0;
              const labor = m?.default_pay_rate ?? 0;
              const total = r.quantity * (mat + labor);
              return (
                <tr key={idx} className="border-t">
                  <td className="p-2 border">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={r.material_id}
                      onChange={(e) =>
                        handleRowChange(idx, "material_id", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {materials.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-16"
                      value={r.quantity}
                      min={1}
                      onChange={(e) =>
                        handleRowChange(idx, "quantity", Number(e.target.value))
                      }
                    />
                  </td>
                  <td className="p-2 border text-right">{mat}</td>
                  <td className="p-2 border text-right">{labor}</td>
                  <td className="p-2 border text-right">{total}</td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={r.sale_price}
                      onChange={(e) =>
                        handleRowChange(idx, "sale_price", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="text"
                      className="border rounded px-2 py-1"
                      value={r.install_location}
                      onChange={(e) =>
                        handleRowChange(idx, "install_location", e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => removeRow(idx)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <SZButton size="sm" variant="secondary" onClick={addRow}>
          Add Material
        </SZButton>
      </section>

      <section className="space-y-1">
        <p className="font-semibold">Total Price: ${totalPrice.toFixed(2)}</p>
        <p className="font-semibold">
          Estimated Tech Payout: ${techPayout.toFixed(2)}
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <SZButton variant="secondary" size="sm" disabled title="Coming soon">
          Generate Installer Documents
        </SZButton>
        <SZButton variant="secondary" size="sm" disabled title="Coming soon">
          Generate Invoice
        </SZButton>
        <SZButton variant="secondary" size="sm" disabled title="Coming soon">
          Generate Royalty Contract
        </SZButton>
        <SZButton variant="secondary" size="sm" disabled title="Coming soon">
          Generate Contracts
        </SZButton>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="pt-4">
        <SZButton onClick={handleSubmit} isLoading={submitting}>
          Create Job
        </SZButton>
      </div>
    </div>
  );
};

export default NewJobBuilderPage;
