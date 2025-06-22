import React, { useState } from "react";
import { SZModal } from "./ui/SZModal";
import { SZButton } from "./ui/SZButton";
import uploadDocument from "../lib/uploadDocument";
import supabase from "../lib/supabaseClient";
import { useJobs } from "../lib/hooks/useJobs";
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
  const [materialsUsed, setMaterialsUsed] = useState<string>("");
  const [systemVerified, setSystemVerified] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

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
        return materialsUsed.trim() !== "";
      case 2:
        return systemVerified;
      case 3:
        return !!photoFile;
      case 4:
        return notes.trim() !== "";
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
      const uploaded = await uploadDocument(photoFile);
      photoUrl = uploaded?.url ?? null;
    }
    await supabase.from("checklists").insert({
      job_id: job.id,
      completed: true,
      responses: {
        customerPresent,
        absenceReason,
        materialsUsed,
        systemVerified,
        photoUrl,
        notes,
      },
    });
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
        <div>
          <label htmlFor="materials" className="block text-sm font-semibold mb-1">
            Materials Used
          </label>
          <textarea
            id="materials"
            rows={4}
            className="border rounded w-full p-2"
            value={materialsUsed}
            onChange={(e) => setMaterialsUsed(e.target.value)}
          />
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

      <div className="mt-6 flex justify-between">
        {step > 0 ? (
          <SZButton variant="secondary" size="sm" onClick={back}>
            Back
          </SZButton>
        ) : (
          <span />
        )}
        {step < 4 ? (
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
