import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import SearchBar from "../../components/ui/search/SearchBar";
import StatusFilter from "../../components/filters/StatusFilter";
import SalesRepSelector from "../../components/filters/SalesRepSelector";
import useLeads, { Lead } from "../../lib/hooks/useLeads";
import LoadingFallback from "../../components/ui/LoadingFallback";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBoundary from "../../components/ui/ErrorBoundary";
import LeadHistoryModal from "./LeadHistoryModal";

type Toast = { message: string; success: boolean } | null;

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

function LeadsPageContent() {
  const navigate = useNavigate();
  const {
    leads,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLeadStatus,
    convertLeadToClientAndJob,
  } = useLeads();
  const [form, setForm] = useState({
    clinic_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  const [adding, setAdding] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [salesRepId, setSalesRepId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (error) {
      setToast({ message: error.message || 'Failed to load leads', success: false });
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  React.useEffect(() => {
    fetchLeads(statusFilter || undefined, salesRepId || undefined);
  }, [statusFilter, salesRepId, fetchLeads]);

  const handleAdd = async () => {
    if (!form.clinic_name) return;
    setAdding(true);
    await createLead({ ...form, sales_rep_id: null });
    setForm({ clinic_name: "", contact_name: "", contact_email: "", contact_phone: "", address: "" });
    setAdding(false);
  };

  const changeStatus = async (lead: Lead, status: string) => {
    await updateLeadStatus(lead.id, status);
  };

  const convertLead = async (leadId: string) => {
    setToast(null);
    setConvertingId(leadId);
    try {
      const newJobId = await convertLeadToClientAndJob(leadId);
      setToast({ message: "Lead converted into job", success: true });
      setTimeout(() => setToast(null), 3000);
      if (newJobId) navigate(`/jobs/${newJobId}`);
    } catch (err: any) {
      setToast({ message: err.message, success: false });
      setTimeout(() => setToast(null), 3000);
    }
    setConvertingId(null);
  };

  const filteredLeads = leads.filter((l) => {
    if (search.trim()) {
      const term = search.toLowerCase();
      const combined = `${l.clinic_name} ${l.contact_name} ${l.contact_email} ${l.contact_phone}`.toLowerCase();
      if (!combined.includes(term)) return false;
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Leads</h1>
      <div className="flex flex-wrap gap-2 items-end">
        <SearchBar onSearch={setSearch} />
        <StatusFilter
          options={statuses.map((s) => ({ value: s, label: s }))}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <SalesRepSelector value={salesRepId} onChange={setSalesRepId} />
      </div>
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
      {loading ? (
        <LoadingFallback />
      ) : filteredLeads.length === 0 ? (
        <EmptyState message="No leads found. Create a new lead to get started!" />
      ) : (
        <SZTable headers={["Clinic", "Contact", "Status", "Updated", "Actions"]}>
          {filteredLeads.map((lead) => (
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
              <td className="p-2 border text-xs text-gray-500">
                {new Date(lead.updated_at).toLocaleString()}
              </td>
              <td className="p-2 border space-x-2">
                {lead.status !== "won" ? (
                  <SZButton
                    size="sm"
                    variant="secondary"
                    onClick={() => changeStatus(lead, "won")}
                  >
                    Mark Won
                  </SZButton>
                ) : (
                  <SZButton
                    size="sm"
                    variant="primary"
                    onClick={() => convertLead(lead.id)}
                    isLoading={convertingId === lead.id}
                    disabled={convertingId !== null && convertingId !== lead.id}
                  >
                    Convert
                  </SZButton>
                )}
                <SZButton size="sm" variant="secondary" onClick={() => setHistoryLead(lead)}>
                  History
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      <LeadHistoryModal
        leadId={historyLead?.id || null}
        isOpen={!!historyLead}
        onClose={() => setHistoryLead(null)}
      />
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  return (
    <ErrorBoundary>
      <LeadsPageContent />
    </ErrorBoundary>
  );
}
