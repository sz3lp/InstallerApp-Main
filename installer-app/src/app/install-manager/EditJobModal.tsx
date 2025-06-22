import React, { useState, useEffect } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import useInstallers from "../../lib/hooks/useInstallers";
import supabase from "../../lib/supabaseClient";
import type { Job } from "../../components/JobCard";

export type EditJobModalProps = {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

const EditJobModal: React.FC<EditJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [form, setForm] = useState({
    address: "",
    assigned_to: "",
    status: "",
    scheduled_date: "",
  });
  const { installers } = useInstallers();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setForm({
        address: job.address,
        assigned_to: job.assignedTo ?? "",
        status: job.status,
        scheduled_date: job.scheduledDate,
      });
    }
  }, [job]);

  const handleChange = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!job) return;
    if (!form.address || !form.status || !form.scheduled_date) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("jobs")
      .update({
        address: form.address,
        assigned_to: form.assigned_to || null,
        status: form.status,
        scheduled_date: form.scheduled_date,
      })
      .eq("id", job.id);
    if (error) {
      setError(error.message);
    } else {
      onUpdated();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="Edit Job">
      <div className="space-y-2">
        <SZInput
          id="edit_address"
          label="Address"
          value={form.address}
          onChange={(v) => handleChange("address", v)}
        />
        <div>
          <label htmlFor="edit_assigned_to" className="block text-sm font-medium text-gray-700">
            Assign Installer
          </label>
          <select
            id="edit_assigned_to"
            className="border rounded px-3 py-2 w-full"
            value={form.assigned_to}
            onChange={(e) => handleChange("assigned_to", e.target.value)}
          >
            <option value="">Select</option>
            {installers.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name || inst.id}
              </option>
            ))}
          </select>
        </div>
        <SZInput
          id="edit_status"
          label="Status"
          value={form.status}
          onChange={(v) => handleChange("status", v)}
        />
        <SZInput
          id="edit_scheduled_date"
          label="Scheduled Date"
          value={form.scheduled_date}
          onChange={(v) => handleChange("scheduled_date", v)}
          placeholder="YYYY-MM-DD"
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </SZButton>
        <SZButton onClick={handleSubmit} isLoading={submitting}>
          Save
        </SZButton>
      </div>
    </SZModal>
  );
};

export default EditJobModal;
