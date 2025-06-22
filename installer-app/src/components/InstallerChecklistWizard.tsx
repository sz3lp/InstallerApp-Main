import React, { useState, useRef, useEffect } from "react";
import { SZModal } from "./ui/SZModal";
import { SZButton } from "./ui/SZButton";
import uploadDocument from "../lib/uploadDocument";
import uploadSignature from "../lib/uploadSignature";
import supabase from "../lib/supabaseClient";
import { useJobs } from "../lib/hooks/useJobs";
import { useJobMaterials } from "../lib/hooks/useJobMaterials";
import useAuth from "../lib/hooks/useAuth";

export interface ChecklistWizardProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    assigned_to: string | null;
    status: string;
  } | null;
}

const InstallerChecklistWizard: React.FC<ChecklistWizardProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  const { session } = useAuth();
  const { updateStatus } = useJobs();

  const [step, setStep] = useState(0);
  const [customerPresent, setCustomerPresent] = useState<string>("");
  const [absenceReason, setAbsenceReason] = useState<string>("");
  const { items: jobMaterials } = useJobMaterials(job?.id || "");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [systemVerified, setSystemVerified] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedBy, setSignedBy] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const q: Record<string, number> = {};
      jobMaterials.forEach((m) => {
        q[m.id] = 0;
      });
      setQuantities(q);
    }
  }, [isOpen, jobMaterials]);

  const allowed =
    job &&
    job.status === "in_progress" &&
    job.assigned_to === session?.user?.id;

  if (!isOpen || !allowed || !job) return null;

  const stepValid = () => {
    switch (step) {
      case 0:
        return (
          customerPresent === "yes" ||
          (customerPresent === "no" && absenceReason.trim() !== "")
        );
      case 1:
        return Object.values(quantities).some((q) => q > 0);
      case 2:
        return systemVerified;
      case 3:
        return !!photoFile;
      case 4:
        return notes.trim() !== "";
      case 5:
        return hasSignature && signedBy.trim() !== "";
      default:
        return false;
    }
  };

  const next = () => {
    if (stepValid()) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!stepValid() || !job) return;
    setSaving(true);
    let photoUrl: string | null = null;
    if (photoFile) {
      const uploaded = await uploadDocument(photoFile, job.id, "photos");
      photoUrl = uploaded?.url ?? null;
    }

    // upload signature
    let signatureUrl: string | null = null;
    if (hasSignature && canvasRef.current) {
      const blob: Blob | null = await new Promise((res) =>
        canvasRef.current?.toBlob((b) => res(b), "image/png")
      );
      if (blob) {
        const file = new File(
          [blob],
          `signature_${job.id}_${Date.now()}.png`,
          { type: "image/png" }
        );
        signatureUrl = await uploadSignature(job.id, file);
      }
    }

    await supabase.from("checklists").insert({
      job_id: job.id,
      completed: true,
      responses: {
        customerPresent,
        absenceReason,
        systemVerified,
        photoUrl,
        notes,
      },
    });

    for (const jm of jobMaterials) {
      const qty = quantities[jm.id] || 0;
      if (qty > 0) {
        await supabase.from("job_quantities_completed").insert({
          job_id: job.id,
          material_id: jm.material_id,
          quantity_completed: qty,
          user_id: session?.user?.id,
        });
        await supabase.rpc("decrement_inventory", {
          installer_id_input: session?.user?.id,
          material_id_input: jm.material_id,
          amount: qty,
        });
      }
    }

    if (signatureUrl) {
      await supabase.from("job_signatures").insert({
        job_id: job.id,
        signed_by: signedBy,
        signature_url: signatureUrl,
      });
    }

    await updateStatus(job.id, "needs_qa");
    setSaving(false);
    onClose();
  };

  return (
    <SZModal
      isOpen={isOpen}
      onClose={onClose}
      title="Installer Close-Out Checklist"
    >
      {step === 0 && (
        <div className="space-y-4">
          <p>Was the customer present?</p>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                value="yes"
                checked={customerPresent === "yes"}
                onChange={() => setCustomerPresent("yes")}
              />
              Yes
            </label>
            <label className="inline-flex items-center gap-1">
              <input
                type="radio"
                value="no"
                checked={customerPresent === "no"}
                onChange={() => setCustomerPresent("no")}
              />
              No
            </label>
          </div>
          {customerPresent === "no" && (
            <div>
              <label htmlFor="absence_reason" className="block text-sm font-semibold">
                Reason for absence
              </label>
              <input
                id="absence_reason"
                type="text"
                className="border rounded w-full p-2"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Materials Used</p>
          {jobMaterials.length === 0 ? (
            <p>No materials assigned.</p>
          ) : (
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  <th className="border p-1">Material</th>
                  <th className="border p-1">Qty</th>
                </tr>
              </thead>
              <tbody>
                {jobMaterials.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-1 border">{m.material_id}</td>
                    <td className="p-1 border">
                      <input
                        type="number"
                        min={0}
                        className="border rounded px-2 py-1 w-20"
                        value={quantities[m.id] ?? 0}
                        onChange={(e) =>
                          setQuantities((q) => ({
                            ...q,
                            [m.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={systemVerified}
              onChange={(e) => setSystemVerified(e.target.checked)}
            />
            System verification complete
          </label>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="photo">
            Upload Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            className="border rounded w-full p-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      )}

      {step === 5 && (
        <div>
          <p className="text-sm font-semibold mb-1">Client Signature</p>
          <canvas
            ref={canvasRef}
            width={300}
            height={100}
            onMouseDown={(e) => {
              setDrawing(true);
              setHasSignature(true);
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) {
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
              }
            }}
            onMouseMove={(e) => {
              if (!drawing) return;
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) {
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
              }
            }}
            onMouseUp={() => setDrawing(false)}
            onMouseLeave={() => setDrawing(false)}
            className="border w-full"
          />
          <button
            type="button"
            className="text-xs text-gray-500 mt-1"
            onClick={() => {
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
              setHasSignature(false);
            }}
          >
            Clear
          </button>
          <div className="mt-2">
            <label htmlFor="signed_by" className="block text-sm font-semibold mb-1">
              Signed By
            </label>
            <input
              id="signed_by"
              type="text"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {step > 0 ? (
          <SZButton variant="secondary" size="sm" onClick={back}>
            Back
          </SZButton>
        ) : (
          <span />
        )}
        {step < 5 ? (
          <SZButton size="sm" onClick={next} disabled={!stepValid()}>
            Next
          </SZButton>
        ) : (
          <SZButton onClick={handleSubmit} disabled={!stepValid() || saving} isLoading={saving}>
            Submit Checklist
          </SZButton>
        )}
      </div>
    </SZModal>
  );
};

export default InstallerChecklistWizard;
