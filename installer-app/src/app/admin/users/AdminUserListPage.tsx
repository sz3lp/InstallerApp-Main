import React, { useEffect, useState } from "react";
import { SZCard } from "../../../components/ui/SZCard";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";
import AdminUserForm from "./AdminUserForm";

export interface AdminUser {
  id?: string;
  email: string;
  full_name?: string | null;
  active?: boolean | null;
  created_at?: string;
}

const AdminUserListPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from<AdminUser>("users")
      .select("id, email, full_name, active, created_at");
    setUsers(data ?? []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <SZButton
        size="sm"
        onClick={() => setSelected({ email: "", full_name: "", active: true })}
      >
        New User
      </SZButton>
      {users.map((u) => (
        <SZCard key={u.id}>
          <div className="flex justify-between items-center">
            <div>
              <p>
                {u.full_name || "(No Name)"} ({u.email})
              </p>
              <p className="text-sm text-gray-500">
                {u.active ? "Active" : "Deactivated"}
              </p>
            </div>
            <SZButton size="sm" onClick={() => setSelected(u)}>
              Edit
            </SZButton>
          </div>
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
};

export default AdminUserListPage;
