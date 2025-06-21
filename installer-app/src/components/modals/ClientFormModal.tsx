import React, { useState, useEffect } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZTextarea } from "../ui/SZTextarea";
import { SZButton } from "../ui/SZButton";

export interface Client {
  id?: string;
  name: string;
  phone: string;
  notes: string;
}

export type ClientFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initialData?: Client | null;
};

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState<Client>({ name: "", phone: "", notes: "" });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        phone: initialData.phone,
        notes: initialData.notes,
      });
    } else {
      setForm({ name: "", phone: "", notes: "" });
    }
  }, [initialData]);

  const handleChange = (key: keyof Client, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = () => {
    onSave({ ...initialData, ...form });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? "Edit Client" : "Add Client"}
      </h2>
      <div className="space-y-2">
        <SZInput
          id="client_name"
          label="Name"
          value={form.name}
          onChange={(v) => handleChange("name", v)}
        />
        <SZInput
          id="client_phone"
          label="Phone"
          value={form.phone}
          onChange={(v) => handleChange("phone", v)}
        />
        <SZTextarea
          id="client_notes"
          label="Notes"
          value={form.notes}
          onChange={(v) => handleChange("notes", v)}
          rows={3}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>
          Cancel
        </SZButton>
        <SZButton onClick={handleSave}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
};

export default ClientFormModal;
