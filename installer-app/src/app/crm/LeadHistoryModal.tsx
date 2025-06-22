import React from "react";
import { SZModal } from "../../components/ui/SZModal";
import useLeadHistory from "../../lib/hooks/useLeadHistory";

interface Props {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadHistoryModal({ leadId, isOpen, onClose }: Props) {
  const { history } = useLeadHistory(leadId || "");

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Lead History">
      <div className="space-y-2">
        {history.map((h) => (
          <div key={h.id} className="text-sm border-b pb-1">
            <div>
              {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(h.changed_at).toLocaleString()} — {h.changed_by?.slice(0, 8)}
            </div>
          </div>
        ))}
        {history.length === 0 && <p className="text-sm italic">No history.</p>}
      </div>
    </SZModal>
  );
}
