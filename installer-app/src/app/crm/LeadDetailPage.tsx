import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { GlobalLoading, GlobalError } from "../../components/global-states";
import useLead from "../../lib/hooks/useLead";
import useAuth from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const navigate = useNavigate();
  const { lead, loading, refresh } = useLead(id ?? null);
  const [converting, setConverting] = useState(false);

  const convert = async (createJob: boolean) => {
    if (!lead) return;
    setConverting(true);
    try {
      let jobId: string | null = null;
      if (createJob) {
        const { data, error } = await supabase.rpc(
          "convert_lead_to_client_and_job",
          { lead_id: lead.id },
        );
        if (error) throw error;
        jobId = data as string | null;
      } else {
        const { data: client, error: cErr } = await supabase
          .from("clients")
          .insert({
            name: lead.clinic_name,
            contact_name: lead.contact_name,
            contact_email: lead.contact_email,
            address: lead.address,
          })
          .select()
          .single();
        if (cErr) throw cErr;
        const { error: lErr } = await supabase
          .from("leads")
          .update({ status: "converted" })
          .eq("id", lead.id);
        if (lErr) throw lErr;
      }
      await refresh();
      if (jobId) navigate(`/jobs/${jobId}`);
    } catch (err) {
      console.error("Failed to convert lead", err);
      alert("Conversion failed");
    }
    setConverting(false);
  };

  if (loading) return <GlobalLoading />;
  if (!lead) return <GlobalError message="Lead not found" />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{lead.clinic_name}</h1>
      <div>Status: {lead.status}</div>
      <div>Contact: {lead.contact_name}</div>
      <div>Email: {lead.contact_email}</div>
      <div>Phone: {lead.contact_phone}</div>
      {role === "Manager" && lead.status !== "converted" && (
        <div className="space-x-2 mt-2">
          <SZButton size="sm" onClick={() => convert(false)} isLoading={converting}>
            Convert to Client
          </SZButton>
          <SZButton
            size="sm"
            variant="secondary"
            onClick={() => convert(true)}
            isLoading={converting}
          >
            Convert &amp; Create Job
          </SZButton>
        </div>
      )}
    </div>
  );
};

export default LeadDetailPage;
