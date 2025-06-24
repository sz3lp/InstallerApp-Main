import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import { Lead } from "../../lib/hooks/useLeads";

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

const MAX_RETRIES = 5;

export default function LeadPipelinePage() {
  const { role, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const retriesRef = useRef(0);

  const fetchLeads = async () => {
    let query = supabase
      .from<Lead>("leads")
      .select(
        "id, clinic_name, contact_name, contact_email, contact_phone, address, sales_rep_id, status, updated_at"
      );
    if (role === "Sales" && user) query = query.eq("sales_rep_id", user.id);
    const { data } = await query;
    setLeads((data as Lead[]) || []);
  };

  useEffect(() => {
    fetchLeads();
  }, [role, user]);

  useEffect(() => {
    const channel = supabase.channel("leads_pipeline");

    const subscribe = () => {
      channel
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "leads" },
          (payload) => {
            const row = payload.new as Lead;
            if (role === "Sales" && row.sales_rep_id !== user?.id) return;
            setLeads((ls) => [row, ...ls.filter((l) => l.id !== row.id)]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "leads" },
          (payload) => {
            const row = payload.new as Lead;
            if (role === "Sales" && row.sales_rep_id !== user?.id) return;
            setLeads((ls) => ls.map((l) => (l.id === row.id ? row : l)));
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            retriesRef.current = 0;
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            handleDisconnect();
          }
        });
    };

    const handleDisconnect = () => {
      supabase.removeChannel(channel);
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setTimeout(subscribe, 1000 * retriesRef.current);
      }
    };

    subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, user]);

  const changeStatus = async (lead: Lead, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", lead.id);
    await supabase.from("lead_status_history").insert({
      lead_id: lead.id,
      old_status: lead.status,
      new_status: status,
      changed_by: user?.id ?? null,
      changed_at: new Date().toISOString(),
    });
  };

  const onDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    status: string
  ) => {
    const id = e.dataTransfer.getData("text");
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    await changeStatus(lead, status);
  };

  if (!role || !["Sales", "Manager"].includes(role)) {
    return <div className="p-4">Access denied</div>;
  }

  return (
    <div className="flex overflow-x-auto gap-4 p-4">
      {statuses.map((stage) => (
        <div
          key={stage}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(e, stage)}
          className="min-w-[200px] flex-1 bg-gray-50 border rounded p-2"
        >
          <h3 className="font-semibold capitalize mb-2">
            {stage.replace(/_/g, " ")}
          </h3>
          {leads
            .filter((l) => l.status === stage)
            .map((l) => (
              <div
                key={l.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text", l.id)}
                className="p-2 mb-2 bg-white border rounded shadow-sm text-sm"
              >
                {l.clinic_name}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}


