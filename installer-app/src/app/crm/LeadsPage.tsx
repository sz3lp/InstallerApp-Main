import React, { useState } from "react";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import useLeads, { Lead } from "../../lib/hooks/useLeads";
import { handleLeadEvent } from "../../lib/leadEvents";

const statuses = [
  "new",
  "attempted_contact",
  "appointment_scheduled",
  "consultation_complete",
  "proposal_sent",
  "waiting",
  "won",
  "lost",
  "closed",
];

export default function LeadsPage() {
  const { leads, createLead, updateStatus, convertToClientAndJob } = useLeads();
  const [form, setForm] = useState({
    clinic_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.clinic_name) return;
    setAdding(true);
    await createLead({ ...form, sales_rep_id: null });
    setForm({ clinic_name: "", contact_name: "", contact_email: "", contact_phone: "", address: "" });
    setAdding(false);
  };

  const changeStatus = async (lead: Lead, status: string) => {
    if (status === "won") {
      await convertToClientAndJob(lead);
    }
    await updateStatus(lead.id, status);
    await handleLeadEvent(lead.id, status);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Leads</h1>
      <div className="grid md:grid-cols-5 gap-2">
        <SZInput id="clinic" label="Clinic" value={form.clinic_name} onChange={(v) => setForm({ ...form, clinic_name: v })} />
        <SZInput id="contact" label="Contact" value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} />
        <SZInput id="email" label="Email" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} />
        <SZInput id="phone" label="Phone" value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} />
        <SZInput id="address" label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
      </div>
      <SZButton onClick={handleAdd} isLoading={adding} disabled={!form.clinic_name}>
        Add Lead
      </SZButton>
      <SZTable headers={["Clinic", "Contact", "Status", "Actions"]}>
        {leads.map((lead) => (
          <tr key={lead.id} className="border-t">
            <td className="p-2 border">{lead.clinic_name}</td>
            <td className="p-2 border">{lead.contact_name}</td>
            <td className="p-2 border">
              <select
                className="border rounded px-2 py-1"
                value={lead.status}
                onChange={(e) => changeStatus(lead, e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td className="p-2 border">
              <SZButton size="sm" variant="secondary" onClick={() => changeStatus(lead, "won")}>Mark Won</SZButton>
            </td>
          </tr>
        ))}
      </SZTable>
    </div>
  );
}
