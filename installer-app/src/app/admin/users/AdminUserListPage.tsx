import { useEffect, useState } from "react";
import { SZCard } from "../../../components/ui/SZCard";
import { SZButton } from "../../../components/ui/SZButton";
import { supabase } from "../../../lib/supabaseClient";
import AdminUserForm from "./AdminUserForm";

export default function AdminUserListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*");
    setUsers(data ?? []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <SZButton onClick={() => setSelected({})}>New User</SZButton>
      {users.map((u) => (
        <SZCard key={u.id} className="flex justify-between">
          <div>
            <p>
              {u.full_name} ({u.email})
            </p>
            <p className="text-sm text-gray-500">
              {u.active ? "Active" : "Deactivated"}
            </p>
          </div>
          <SZButton onClick={() => setSelected(u)}>Edit</SZButton>
        </SZCard>
      ))}
      {selected && (
        <AdminUserForm
          user={selected}
          onClose={() => {
            setSelected(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
