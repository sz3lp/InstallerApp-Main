"use client";
import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import ClientFormModal, { Client } from "../../components/modals/ClientFormModal";
import useClinics from "../../lib/hooks/useClinics";


const ClientsPage: React.FC = () => {
  const [clients, { loading, error, createClinic, updateClinic, deleteClinic }] =
    useClinics();
  const [active, setActive] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  const handleSave = async (data: Client) => {
    try {
      if (data.id) {
        await updateClinic(data.id, {
          name: data.name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          address: data.address,
        });
      } else {
        await createClinic({
          name: data.name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          address: data.address,
        });
      }
      setOpen(false);
      setActive(null);
    } catch (err) {
      console.error("Failed to save client", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClinic(id);
    } catch (err) {
      console.error("Failed to delete client", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <SZButton
          size="sm"
          onClick={() => {
            setActive(null);
            setOpen(true);
          }}
        >
          Add Client
        </SZButton>
      </div>
      <div className="overflow-x-auto">
        {loading && <p>Loading clients...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        <SZTable headers={["Name", "Contact", "Email", "Address", "Actions"]}>
          {clients.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.contact_name}</td>
              <td className="p-2 border">{c.contact_email}</td>
              <td className="p-2 border">{c.address}</td>
              <td className="p-2 border space-x-2">
                <SZButton
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setActive(c);
                    setOpen(true);
                  }}
                >
                  Edit
                </SZButton>
                <SZButton
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(c.id!)}
                >
                  Delete
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      </div>
      <ClientFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initialData={active}
      />
    </div>
  );
};

export default ClientsPage;
