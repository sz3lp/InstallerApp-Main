import React, { useEffect, useRef } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useLeads from "../../lib/hooks/useLeads";
import supabase from "../../lib/supabaseClient";

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

const LeadPipelinePage: React.FC = () => {
  const { role, user } = useAuth();
  const { leads, fetchLeads, updateLeadStatus } = useLeads();
  const retriesRef = useRef(0);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const channel = supabase.channel("leads_pipeline");
    const subscribe = () => {
      channel
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "leads" },
          () => fetchLeads(),
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
  }, [fetchLeads]);

  if (!["Sales", "Manager", "Admin"].includes(role ?? "")) {
    return <div className="p-4">Access denied</div>;
  }

  const visibleLeads = leads.filter(
    (l) =>
      role === "Manager" || role === "Admin" || l.sales_rep_id === user?.id,
  );

  const onDrop = async (e: React.DragEvent<HTMLDivElement>, status: string) => {
    const id = e.dataTransfer.getData("text");
    if (!id) return;
    await updateLeadStatus(id, status);
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text", id);
  };

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
          {visibleLeads
            .filter((l) => l.status === stage)
            .map((l) => (
              <div
                key={l.id}
                draggable
                onDragStart={(e) => onDragStart(e, l.id)}
                className="p-2 mb-2 bg-white border rounded shadow-sm text-sm"
              >
                {l.clinic_name}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default LeadPipelinePage;
