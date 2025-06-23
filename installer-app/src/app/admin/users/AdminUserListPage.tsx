import React, { useEffect, useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";
import UserRoleEditor from "./UserRoleEditor";

export interface AdminUser {
  user_id: string;
  email: string;
  role: string | null;
  is_active: boolean | null;
}

const AdminUserListPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select(
        "user_id, is_active, user_roles(role), auth_users:auth.users(email)"
      );
    const list = (data ?? []).map((u: any) => ({
      user_id: u.user_id,
      email: u.auth_users.email,
      role: u.user_roles?.role ?? null,
      is_active: u.is_active,
    }));
    setUsers(list);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase
      .from("profiles")
      .update({ is_active: active })
      .eq("user_id", id);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 space-y-4 overflow-x-auto">
      <h1 className="text-2xl font-bold">Users</h1>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Active</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">
                <UserRoleEditor userId={u.user_id} />
              </td>
              <td className="p-2">{u.is_active ? "Yes" : "No"}</td>
              <td className="p-2">
                {u.is_active ? (
                  <SZButton size="sm" onClick={() => toggleActive(u.user_id, false)}>
                    Deactivate
                  </SZButton>
                ) : (
                  <SZButton size="sm" onClick={() => toggleActive(u.user_id, true)}>
                    Activate
                  </SZButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserListPage;
