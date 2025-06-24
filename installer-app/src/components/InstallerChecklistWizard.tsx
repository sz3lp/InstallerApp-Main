import React, { useState, useRef, useEffect, ReactNode } from "react";
import { SZModal } from "./ui/SZModal";
import { SZButton } from "./ui/SZButton";
import uploadDocument from "../lib/uploadDocument";
import uploadSignature from "../lib/uploadSignature";
import supabase from "../lib/supabaseClient";
import { useJobs } from "../lib/hooks/useJobs";
import { useJobMaterials } from "../lib/hooks/useJobMaterials";
import useAuth from "../lib/hooks/useAuth";
import LoadingFallback from "./ui/LoadingFallback";
import EmptyState from "./ui/EmptyState";
import ErrorBoundary from "./ui/ErrorBoundary";

export interface ChecklistWizardProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    assigned_to: string | null;
    status: string;
  } | null;
}

type WizardState = "in_progress" | "error" | "submitted";

const StatusBanner = ({
  state,
  error,
  saving,
}: {
  state: WizardState;
  error?: string | null;
  saving?: boolean;
}) => {
  let message = "";
  if (saving) message = "Saving checklist...";
  else if (state === "error") message = error || "Failed to submit checklist.";
  else if (state === "submitted") message = "Checklist submitted successfully.";
  else message = "Complete each step to finish the job.";
  const colorClasses =
    state === "error"
      ? "bg-red-50 text-red-800 border-red-200"
      : state === "submitted"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-blue-50 text-blue-800 border-blue-200";
  return (
    <div className={`border rounded p-2 mb-4 ${colorClasses}`}>{message}</div>
  );
};

const Step = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold">{title}</h3>
    {children}
  </div>
);

const StepWizard = ({
  currentStep,
  children,
}: {
  currentStep: number;
  children: ReactNode;
}) => {
  const steps = React.Children.toArray(children);
  return <>{steps[currentStep] as React.ReactElement}</>;
};

const WizardControls = ({
  step,
  onBack,
  onNext,
  onSubmit,
  disabledNext,
  loading,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  disabledNext: boolean;
  loading: boolean;
}) => (
  <div className="mt-6 flex justify-between">
    {step > 0 ? (
      <SZButton variant="secondary" size="sm" onClick={onBack}>
        Back
      </SZButton>
    ) : (
      <span />
    )}
    {step < 3 ? (
      <SZButton size="sm" onClick={onNext} disabled={disabledNext}>
        Next
      </SZButton>
    ) : (
      <SZButton onClick={onSubmit} disabled={disabledNext || loading} isLoading={loading}>
        Submit Checklist
      </SZButton>
    )}
  </div>
);

const ConfirmationScreen = ({ onClose }: { onClose: () => void }) => (
  <div className="space-y-4 text-center">
    <p>Checklist submitted successfully.</p>
    <div className="text-right">
      <SZButton onClick={onClose}>Close</SZButton>
    </div>
  </div>
);

const ChecklistWizardContent: React.FC<ChecklistWizardProps> = ({
  isOpen,
  onClose,
  job,
}) => {
  const { session } = useAuth();
  const { updateStatus } = useJobs();

  const [step, setStep] = useState(0);
  const [customerPresent, setCustomerPresent] = useState<string>("");
  const [absenceReason, setAbsenceReason] = useState<string>("");
  const { items: jobMaterials, loading: materialsLoading } = useJobMaterials(
    job?.id || ""
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [systemVerified, setSystemVerified] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedBy, setSignedBy] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<WizardState>("in_progress");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const q: Record<string, number> = {};
      jobMaterials.forEach((m) => {
        q[m.id] = 0;
      });
      setQuantities(q);
      setStep(0);
      setStatus("in_progress");
      setSaving(false);
      setError(null);
      setSignedBy(
        session?.user?.user_metadata?.full_name ||
          session?.user?.email ||
          ""
      );
    }
  }, [isOpen, jobMaterials, session]);

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
        return (
          systemVerified &&
          notes.trim() !== "" &&
          !!photoFile
        );
      case 3:
        return hasSignature && signedBy.trim() !== "";
      default:
        return false;
    }
  };

  const next = () => {
    if (stepValid()) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleQtyChange = (id: string, qty: number) =>
    setQuantities((q) => ({ ...q, [id]: qty }));

  const handleSubmit = async () => {
    if (!stepValid() || !job) return;
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        const uploaded = await uploadDocument(photoFile, job.id, "photos");
        photoUrl = uploaded?.url ?? null;
      }

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
      setStatus("submitted");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error submitting checklist");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Installer Close-Out Checklist">
      <StatusBanner state={status} error={error} saving={saving} />
      {status === "submitted" ? (
        <ConfirmationScreen onClose={onClose} />
      ) : (
        <>
          <StepWizard currentStep={step}>
            <Step title="Customer Present?">
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
                <input
                  id="absence_reason"
                  type="text"
                  className="border rounded w-full p-2 mt-2"
                  placeholder="Reason"
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                />
              )}
            </Step>
            <Step title="Materials Used">
              {materialsLoading ? (
                <LoadingFallback />
              ) : jobMaterials.length === 0 ? (
                <EmptyState message="No materials assigned to this job" />
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
                            onChange={(e) => handleQtyChange(m.id, Number(e.target.value))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Step>
            <Step title="System Check + Notes + Photo">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={systemVerified}
                  onChange={(e) => setSystemVerified(e.target.checked)}
                />
                System verification complete
              </label>
              <textarea
                id="notes"
                className="border rounded w-full p-2 mt-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <input
                id="photo"
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </Step>
            <Step title="Signature">
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
              <input
                id="signed_by"
                type="text"
                className="w-full border rounded p-2 mt-2"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
              />
            </Step>
          </StepWizard>
          <WizardControls
            step={step}
            onBack={back}
            onNext={next}
            onSubmit={handleSubmit}
            disabledNext={!stepValid()}
            loading={saving}
          />
        </>
      )}
    </SZModal>
  );
};

const InstallerChecklistWizard: React.FC<ChecklistWizardProps> = (props) => (
  <ErrorBoundary>
    <ChecklistWizardContent {...props} />
  </ErrorBoundary>
);

export default InstallerChecklistWizard;
