import React, { useState } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";
import useAuditLogger from "../../lib/hooks/useAuditLogger";

export type DocumentUploaderModalProps = {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
};

const DocumentUploaderModal: React.FC<DocumentUploaderModalProps> = ({
  jobId,
  isOpen,
  onClose,
  onUploaded,
}) => {
  const { logEvent } = useAuditLogger();
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!jobId || !files?.length) return;
    setSubmitting(true);
    setError(null);
    const uploaded = Array.from(files);
    const { error } = await supabase
      .from("jobs")
      .update({ documents: uploaded.map((f) => ({ name: f.name })) })
      .eq("id", jobId);
    if (error) {
      setError(error.message);
    } else {
      await logEvent(jobId, "document_uploaded", {
        count: uploaded.length,
        names: uploaded.map((f) => f.name),
      });
      onUploaded();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Upload Documents">
      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      <div className="mt-4 flex justify-end gap-2">
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

export default DocumentUploaderModal;
