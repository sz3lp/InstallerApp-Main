import React, { useState } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";
import useAuth from "../../lib/hooks/useAuth";

interface RefundManagerProps {
  paymentId: string;
  invoiceId: string;
  paymentAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onRefunded?: () => void;
}

const RefundManager: React.FC<RefundManagerProps> = ({
  paymentId,
  invoiceId,
  paymentAmount,
  isOpen,
  onClose,
  onRefunded,
}) => {
  const { role } = useAuth();
  const [amount, setAmount] = useState(String(paymentAmount));
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== "Admin") return null;

  const submitRefund = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.functions.invoke("process_refund", {
      body: JSON.stringify({
        payment_id: paymentId,
        invoice_id: invoiceId,
        amount: Number(amount),
        reason,
      }),
    });
    if (error) {
      setError(error.message || "Failed to issue refund");
    } else {
      onRefunded?.();
      onClose();
    }
    setLoading(false);
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Issue Refund">
      <div className="space-y-4 w-72">
        <SZInput
          id="refund_amount"
          label="Amount"
          type="number"
          value={amount}
          onChange={setAmount}
        />
        <SZInput
          id="refund_reason"
          label="Reason"
          value={reason}
          onChange={setReason}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <SZButton variant="secondary" onClick={onClose}>
            Cancel
          </SZButton>
          <SZButton onClick={submitRefund} isLoading={loading}>
            Refund
          </SZButton>
        </div>
      </div>
    </SZModal>
  );
};

export default RefundManager;
