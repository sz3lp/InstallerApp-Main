import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../../lib/supabaseClient";
import { SZButton } from "../../../components/ui/SZButton";
import EditJobModal from "../EditJobModal";
import uploadDocument from "../../../lib/uploadDocument";
import DocumentViewerModal from "../../../installer/components/DocumentViewerModal";

interface Job {
  id: string;
  job_number: string;
  clinic_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  scheduled_date: string;
  installer: string | null;
  status: string;
  notes: string | null;
}

interface JobMaterial {
  id: string;
  material_id: string;
  quantity: number;
  unit_material_cost: number;
  unit_labor_cost: number;
  materials: { name: string } | null;
}

interface DocumentRow {
  id: string;
  name: string;
  url: string;
}

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [materials, setMaterials] = useState<JobMaterial[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const fetchJob = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);

    const { data: jobData, error: jobError } = await supabase
      .from<Job>("jobs")
      .select(
        "id, job_number, clinic_name, contact_name, contact_email, contact_phone, address, scheduled_date, installer, status, notes",
      )
      .eq("id", jobId)
      .single();

    if (jobError) {
      setError(jobError.message);
      setLoading(false);
      return;
    }
    setJob(jobData || null);

    const { data: matData } = await supabase
      .from<JobMaterial>("job_materials")
      .select(
        "id, material_id, quantity, unit_material_cost, unit_labor_cost, materials(name)",
      )
      .eq("job_id", jobId);
    setMaterials(matData ?? []);

    const { data: docData } = await supabase
      .from<DocumentRow>("documents")
      .select("id, name, url")
      .eq("job_id", jobId);
    setDocuments(docData ?? []);

    const { data: checklistData } = await supabase
      .from<any>("job_checklists")
      .select("*")
      .eq("job_id", jobId);
    setChecklists(checklistData ?? []);

    setLoading(false);
  };

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobId) return;
    try {
      const doc = await uploadDocument(file);
      await supabase.from("documents").insert({
        job_id: jobId,
        name: doc.name,
        url: doc.url,
      });
      setDocuments((d) => [...d, { id: doc.id, name: doc.name, url: doc.url }]);
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = "";
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error || !job)
    return <div className="p-4 text-red-600">{error || "Job not found"}</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job {job.job_number}</h1>
        <SZButton size="sm" onClick={() => setShowEdit(true)}>
          Edit Job
        </SZButton>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Job Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-semibold">Clinic</p>
            <p>{job.clinic_name}</p>
          </div>
          <div>
            <p className="font-semibold">Contact</p>
            <p>{job.contact_name}</p>
            <p>{job.contact_phone}</p>
            <p>{job.contact_email}</p>
          </div>
          <div>
            <p className="font-semibold">Address</p>
            <p>{job.address}</p>
          </div>
          <div>
            <p className="font-semibold">Scheduled Date</p>
            <p>{job.scheduled_date}</p>
          </div>
          <div>
            <p className="font-semibold">Installer</p>
            <p>{job.installer ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="font-semibold">Status</p>
            <p>{job.status}</p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Materials Used</h2>
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border">Material</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Material Cost</th>
              <th className="p-2 border">Labor Cost</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="p-2 border">
                  {m.materials?.name || m.material_id}
                </td>
                <td className="p-2 border text-center">{m.quantity}</td>
                <td className="p-2 border text-right">
                  {m.unit_material_cost}
                </td>
                <td className="p-2 border text-right">{m.unit_labor_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {checklists.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Checklist</h2>
          <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(checklists, null, 2)}
          </pre>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Documents</h2>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <span>{doc.name}</span>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700"
              >
                View
              </a>
            </div>
          ))}
        </div>
        <input type="file" onChange={handleUploadDoc} />
      </section>

      {job.notes && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Notes</h2>
          <p className="whitespace-pre-wrap">{job.notes}</p>
        </section>
      )}

      <EditJobModal
        job={job as any}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={fetchJob}
      />
      <DocumentViewerModal
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
        documents={documents}
      />
    </div>
  );
};

export default JobDetailPage;
