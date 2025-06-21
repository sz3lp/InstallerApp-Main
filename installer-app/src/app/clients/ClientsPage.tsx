import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import ClientFormModal, {
  Client,
} from "../../components/modals/ClientFormModal";

const initialClients: Client[] = [
  { id: "1", name: "Acme Clinic", phone: "555-1234", notes: "VIP client" },
  {
    id: "2",
    name: "Beta Labs",
    phone: "555-5678",
    notes: "Prefers morning installs",
  },
];

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [active, setActive] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  const handleSave = (data: Client) => {
    if (data.id) {
      setClients((cs) =>
        cs.map((c) => (c.id === data.id ? { ...c, ...data } : c)),
      );
    } else {
      const id = Date.now().toString();
      setClients((cs) => [...cs, { ...data, id }]);
    }
    setOpen(false);
    setActive(null);
  };

  const handleDelete = (id: string) => {
    setClients((cs) => cs.filter((c) => c.id !== id));
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
        <SZTable headers={["Name", "Phone", "Notes", "Actions"]}>
          {clients.map((c) => (
            <tr key={c.id} className="border-t">
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.phone}</td>
              <td className="p-2 border">{c.notes}</td>
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
