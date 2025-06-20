import React, { useState } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";

export type NewJobModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const initialForm = {
  address: "",
  assigned_to: "",
  status: "",
  scheduled_date: "",
};

const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.address || !form.status || !form.scheduled_date) {
      setError("All fields are required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("jobs").insert({
      address: form.address,
      assigned_to: form.assigned_to || null,
      status: form.status,
      scheduled_date: form.scheduled_date,
    });
    if (error) {
      setError(error.message);
    } else {
      setForm(initialForm);
      onCreated();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <SZModal isOpen={isOpen} onClose={onClose} title="New Job">
      <div className="space-y-2">
        <SZInput
          id="address"
          label="Address"
          value={form.address}
          onChange={(v) => handleChange("address", v)}
        />
        <SZInput
          id="assigned_to"
          label="Assigned To"
          value={form.assigned_to}
          onChange={(v) => handleChange("assigned_to", v)}
        />
        <SZInput
          id="status"
          label="Status"
          value={form.status}
          onChange={(v) => handleChange("status", v)}
        />
        <SZInput
          id="scheduled_date"
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
          Create
        </SZButton>
      </div>
    </SZModal>
  );
};

export default NewJobModal;
