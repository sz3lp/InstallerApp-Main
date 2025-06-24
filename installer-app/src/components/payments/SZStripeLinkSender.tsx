import React, { useState } from "react";
import supabase from "../../lib/supabaseClient";
import { SZButton } from "../ui/SZButton";

interface SZStripeLinkSenderProps {
  invoiceId: string;
  clientEmail: string;
}

type ToastState = { message: string; success: boolean } | null;

const SZStripeLinkSender: React.FC<SZStripeLinkSenderProps> = ({ invoiceId, clientEmail }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const sendLink = async () => {
    setLoading(true);
    setToast(null);
    const { error } = await supabase.functions.invoke("initiate_stripe_payment", {
      body: JSON.stringify({ invoice_id: invoiceId, client_email: clientEmail }),
    });
    if (error) {
      setToast({ message: "Failed to send payment link", success: false });
    } else {
      setToast({ message: "Payment link sent successfully", success: true });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <SZButton size="sm" onClick={sendLink} isLoading={loading}>
        Send Payment Link
      </SZButton>
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
};

export default SZStripeLinkSender;
