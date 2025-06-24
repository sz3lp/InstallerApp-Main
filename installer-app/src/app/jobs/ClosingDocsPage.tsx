import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import supabase from "../../lib/supabaseClient";
import useAuth from "../../lib/hooks/useAuth";
import { SZButton } from "../../components/ui/SZButton";
import LoadingFallback from "../../components/ui/LoadingFallback";

interface JobDocument {
  id: string;
  url: string;
  type: string;
  name?: string;
}

const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const ClosingDocsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<FileList | null>(null);
  const [docs, setDocs] = useState<JobDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadDocs = async () => {
      const { data, error } = await supabase
        .from<JobDocument>("job_documents")
        .select("id,url,type,name")
        .eq("job_id", id);
      if (!error) setDocs(data ?? []);
      setLoading(false);
    };
    loadDocs();
  }, [id]);

  const handleUpload = async () => {
    if (!files || !id) return;
    const fileArr = Array.from(files);
    for (const file of fileArr) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only PDF or image files allowed.");
        return;
      }
    }
    setUploading(true);
    setError(null);
    try {
      for (const file of fileArr) {
        const path = `${id}/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("closing_docs")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from("closing_docs")
          .getPublicUrl(path);
        const url = urlData.publicUrl;
        await supabase.from("job_documents").insert({
          job_id: id,
          url,
          type: file.type.startsWith("image/") ? "image" : "pdf",
          uploaded_by: user?.id ?? null,
          name: file.name,
        });
        setDocs((d) => [
          ...d,
          { id: path, url, type: file.type.startsWith("image/") ? "image" : "pdf", name: file.name },
        ]);
      }
      setFiles(null);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || loading) return <LoadingFallback />;
  if (!id || !["Installer", "Manager", "Admin"].includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Closing Documents</h1>
      <input
        type="file"
        accept="application/pdf,image/*"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="border rounded px-3 py-2 w-full"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <SZButton onClick={handleUpload} disabled={!files} isLoading={uploading}>
        Upload Files
      </SZButton>
      {docs.length > 0 && (
        <ul className="space-y-1">
          {docs.map((doc) => (
            <li key={doc.id}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                {doc.name || doc.url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClosingDocsPage;
