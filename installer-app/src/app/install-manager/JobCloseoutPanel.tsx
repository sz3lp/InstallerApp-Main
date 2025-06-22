import React, { useState } from "react";
import uploadDocument from "../../lib/uploadDocument";
import { SZModal } from "../../components/ui/SZModal";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";

interface JobCloseoutPanelProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobCloseoutPanel({
  jobId,
  isOpen,
  onClose,
}: JobCloseoutPanelProps) {
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [inspectionFile, setInspectionFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);

    const uploads: Promise<any>[] = [];

    if (permitFile) {
      uploads.push(uploadDocument(permitFile, jobId, "permits"));
    }

    if (inspectionFile) {
      uploads.push(uploadDocument(inspectionFile, jobId, "inspections"));
    }

    await Promise.all(uploads);

    await supabase.from("jobs").update({ status: "archived" }).eq("id", jobId);

    setSaving(false);
    onClose();
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Upload Closeout Documents">
      <div className="space-y-4">
        <label className="block">
          Permit Document
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPermitFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className="block">
          Inspection Photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setInspectionFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <SZButton onClick={handleSubmit} isLoading={saving}>
          Submit Closeout
        </SZButton>
      </div>
    </SZModal>
  );
}
