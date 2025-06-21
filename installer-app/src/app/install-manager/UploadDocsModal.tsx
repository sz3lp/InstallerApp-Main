import React, { useState } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZButton } from "../../components/ui/SZButton";
import uploadDocument from "../../lib/uploadDocument";
import supabase from "../../lib/supabaseClient";

export type UploadDocsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onUploaded?: () => void;
};

const UploadDocsModal: React.FC<UploadDocsModalProps> = ({
  isOpen,
  onClose,
  jobId,
  onUploaded,
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!jobId || !files?.length) return;
    setSubmitting(true);
    try {
      const uploaded: any[] = [];
      for (const file of Array.from(files)) {
        const doc = await uploadDocument(file);
        if (doc) uploaded.push(doc);
      }
      if (uploaded.length) {
        const { data } = await supabase
          .from("jobs")
          .select("documents")
          .eq("id", jobId)
          .single();
        const existing = data?.documents ?? [];
        await supabase
          .from("jobs")
          .update({ documents: [...existing, ...uploaded] })
          .eq("id", jobId);
      }
      onUploaded?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Upload Documents">
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-4"
      />
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </SZButton>
        <SZButton onClick={handleSubmit} isLoading={submitting}>
          Upload
        </SZButton>
      </div>
    </SZModal>
  );
};

export default UploadDocsModal;
