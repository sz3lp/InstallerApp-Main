import React, { useEffect, useState } from "react";
import supabase from "../../lib/supabaseClient";
import { SZCard } from "../../components/ui/SZCard";

interface Measure {
  measure: string;
  actual_quantity: number;
  quote_quantity: number | null;
  discrepancy_notes: string | null;
}

interface MaterialRow {
  name: string | null;
  quantity: number;
  pay_rate: number | null;
}

interface Attachment {
  id: string;
  url: string;
}

const QAReviewJobDetailPanel: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [payment, setPayment] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notes, setNotes] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: job } = await supabase
        .from("jobs")
        .select("notes")
        .eq("id", jobId)
        .single();
      setNotes(job?.notes ?? null);

      const { data: mats } = await supabase
        .from("job_quantities_completed")
        .select("quantity, materials(name,pay_rate)")
        .eq("job_id", jobId);
      setMaterials(
        (mats ?? []).map((m: any) => ({
          name: m.materials?.name ?? null,
          pay_rate: m.materials?.pay_rate ?? null,
          quantity: m.quantity,
        })),
      );

      const { data: meas } = await supabase
        .from("job_install_measures")
        .select("measure, actual_quantity, quote_quantity, discrepancy_notes")
        .eq("job_id", jobId);
      setMeasures(meas ?? []);

      const { data: pay } = await supabase
        .from("payments")
        .select("method, amount")
        .eq("job_id", jobId)
        .maybeSingle();
      setPayment(pay ?? null);

      const { data: attach } = await supabase
        .from("job_attachments")
        .select("id, url")
        .eq("job_id", jobId)
        .eq("type", "photo");
      setAttachments(attach ?? []);
    };
    fetchAll();
  }, [jobId]);

  return (
    <div className="space-y-4">
      <SZCard
        header={<h2 className="font-semibold">Install Measure Review</h2>}
      >
        {measures.length ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border p-1">Measure</th>
                <th className="border p-1">Actual</th>
                <th className="border p-1">Quoted</th>
                <th className="border p-1">Notes</th>
              </tr>
            </thead>
            <tbody>
              {measures.map((m, i) => (
                <tr key={i}>
                  <td className="border p-1">{m.measure}</td>
                  <td className="border p-1">{m.actual_quantity}</td>
                  <td className="border p-1">{m.quote_quantity ?? "-"}</td>
                  <td className="border p-1">{m.discrepancy_notes ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm italic">No measures logged.</p>
        )}
      </SZCard>

      <SZCard
        header={<h2 className="font-semibold">Material Quantities Review</h2>}
      >
        {materials.length ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="border p-1">Material</th>
                <th className="border p-1">Quantity</th>
                <th className="border p-1">Pay Rate</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr key={i}>
                  <td className="border p-1">{m.name}</td>
                  <td className="border p-1">{m.quantity}</td>
                  <td className="border p-1">{m.pay_rate ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm italic">No materials logged.</p>
        )}
      </SZCard>

      <SZCard
        header={<h2 className="font-semibold">Payment & Signature Review</h2>}
      >
        {payment ? (
          <div className="space-y-1 text-sm">
            <p>Method: {payment.method}</p>
            <p>Amount: {payment.amount}</p>
          </div>
        ) : (
          <p className="text-sm italic">No payment recorded.</p>
        )}
      </SZCard>

      <SZCard header={<h2 className="font-semibold">Photos & Notes</h2>}>
        {attachments.length ? (
          <div className="grid grid-cols-2 gap-2">
            {attachments.map((a) => (
              <img
                key={a.id}
                src={a.url}
                alt="attachment"
                className="w-full h-auto border"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm italic">No photos uploaded.</p>
        )}
        {notes && <p className="mt-2 text-sm">{notes}</p>}
      </SZCard>
    </div>
  );
};

export default QAReviewJobDetailPanel;
