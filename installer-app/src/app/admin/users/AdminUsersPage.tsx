import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SZTable } from "../../../components/ui/SZTable";
import { LoadingState, ErrorState } from "../../../components/states";
import supabase from "../../../lib/supabaseClient";
import { useAuth } from "../../../lib/hooks/useAuth";

type Toast = { message: string; success: boolean } | null;

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
};

const ROLES = ["Admin", "Sales", "Installer", "Install Manager", "Manager"];

const AdminUsersPage: React.FC = () => {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role, users(email, full_name)")
      .order("users.full_name", { ascending: true });
    if (error) {
      setError(error.message);
      setUsers([]);
    } else {
      const list = (data ?? []).map((row: any) => ({
        id: row.user_id,
        email: row.users?.email ?? "",
        full_name: row.users?.full_name ?? null,
        role: row.role ?? null,
      }));
      setUsers(list);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.rpc("update_user_role", {
      user_id: userId,
      new_role: newRole,
    });
    if (error) {
      setToast({ message: "Failed to update role", success: false });
    } else {
      setUsers((list) =>
        list.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      setToast({ message: "Role updated successfully", success: true });
    }
    setTimeout(() => setToast(null), 3000);
  };

  if (role !== "Admin") return <Navigate to="/unauthorized" replace />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">User Roles</h1>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <SZTable headers={["Name", "Email", "Current Role", "Actions"]}>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2 border">{u.full_name ?? "-"}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role ?? "-"}</td>
              <td className="p-2 border">
                <select
                  value={u.role ?? ""}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

