import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import useLead from "../../lib/hooks/useLead";
import useAuth from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import { GlobalLoading, GlobalError } from "../../components/global-states";

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { lead, loading, error, refresh } = useLead(id ?? null);
  const [createJob, setCreateJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleConvert = async () => {
    if (!lead) return;
    setSubmitting(true);
    try {
      let newJobId: string | null = null;
      if (createJob) {
        const { data, error: rpcError } = await supabase.rpc(
          "convert_lead_to_client_and_job",
          { lead_id: lead.id },
        );
        if (rpcError) throw rpcError;
        newJobId = data as string | null;
      } else {
        const { data: client, error: clientErr } = await supabase
          .from("clients")
          .insert({
            name: lead.clinic_name,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            address: lead.address,
          })
          .select("id")
          .single();
        if (clientErr) throw clientErr;
        await supabase
          .from("leads")
          .update({ status: "converted" })
          .eq("id", lead.id);
      }
      await refresh();
      if (newJobId) navigate(`/jobs/${newJobId}`);
    } catch (err) {
      console.error("Conversion failed", err);
    }
    setSubmitting(false);
  };

  if (loading) return <GlobalLoading />;
  if (!lead || error) {
    return <GlobalError message={error?.message || "Lead not found"} />;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{lead.clinic_name}</h1>
      <div>
        <p>Contact: {lead.contact_name}</p>
        <p>Email: {lead.contact_email}</p>
        <p>Phone: {lead.contact_phone}</p>
        <p>Address: {lead.address}</p>
        <p>Status: {lead.status}</p>
      </div>
      {role === "Manager" && (
        <div className="space-y-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={createJob}
              onChange={(e) => setCreateJob(e.target.checked)}
            />
            <span>Create Job</span>
          </label>
          <SZButton onClick={handleConvert} isLoading={submitting}>
            Convert to Client
          </SZButton>
        </div>
      )}
    </div>
  );
};

export default LeadDetailPage;
