import React, { useState } from "react";
import supabase from "../lib/supabaseClient";
import { SZButton } from "./ui/SZButton";

interface Props {
  jobId: string;
  onComplete?: () => void;
}

export default function UploadClosingPackage({ jobId, onComplete }: Props) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!files) return;
    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${jobId}/closing-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("documents")
          .upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;
      }
      if (onComplete) onComplete();
    } catch (err: any) {
      console.error(err);
      setError("Upload failed.");
    }

    setUploading(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Upload Closing Documents</label>
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SZButton onClick={handleUpload} disabled={!files} isLoading={uploading}>
        Upload Files
      </SZButton>
    </div>
  );
}
