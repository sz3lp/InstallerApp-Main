"use client";
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZTextarea } from "../ui/SZTextarea";
import { SZButton } from "../ui/SZButton";

export interface Client {
  id?: string;
  name: string;
  contact_name: string;
  contact_email: string;
  address: string;
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
  const [form, setForm] = useState<Client>({
    name: "",
    contact_name: "",
    contact_email: "",
    address: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        contact_name: initialData.contact_name,
        contact_email: initialData.contact_email,
        address: initialData.address,
      });
    } else {
      setForm({ name: "", contact_name: "", contact_email: "", address: "" });
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
          id="contact_name"
          label="Contact Name"
          value={form.contact_name}
          onChange={(v) => handleChange("contact_name", v)}
        />
        <SZInput
          id="contact_email"
          label="Contact Email"
          value={form.contact_email}
          onChange={(v) => handleChange("contact_email", v)}
        />
        <SZTextarea
          id="clinic_address"
          label="Address"
          value={form.address}
          onChange={(v) => handleChange("address", v)}
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
