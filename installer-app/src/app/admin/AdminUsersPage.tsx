import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZModal } from "../../components/ui/SZModal";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import { LoadingState, ErrorState } from "../../components/states";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../lib/hooks/useAuth";

interface UserRow {
  id: string;
  email: string;
  role: string | null;
  active: boolean | null;
}

const ROLES = [
  "Admin",
  "Manager",
  "Installer",
  "Install Manager",
  "Sales",
  "Finance",
];

const AdminUsersPage: React.FC = () => {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Installer");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role, active, auth_users:auth.users(email)")
      .order("auth_users.email", { ascending: true });
    if (error) {
      setError(error.message);
      setUsers([]);
    } else {
      const list = (data ?? []).map((row: any) => ({
        id: row.user_id,
        email: row.auth_users?.email ?? "",
        role: row.role ?? null,
        active: row.active ?? true,
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
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);
    if (!error) {
      setUsers((list) =>
        list.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    }
  };

  const toggleActive = async (userId: string, value: boolean) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ active: value })
      .eq("user_id", userId);
    if (!error) {
      setUsers((list) =>
        list.map((u) => (u.id === userId ? { ...u, active: value } : u)),
      );
    }
  };

  const submitInvite = async () => {
    setInviteLoading(true);
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
    if (error) {
      setToast(error.message);
    } else if (data?.user) {
      await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: inviteRole,
        active: true,
      });
      setToast(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("Installer");
      fetchUsers();
    }
    setInviteLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  if (role !== "Admin") return <Navigate to="/unauthorized" replace />;

  return (
    <div className="p-4 space-y-4 overflow-x-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <SZButton size="sm" onClick={() => setInviteOpen(true)}>
          Invite User
        </SZButton>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <SZTable headers={["Email", "Role", "Active", "Actions"]}>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2 border">{u.email}</td>
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
              <td className="p-2 border text-center">
                <input
                  type="checkbox"
                  checked={u.active ?? true}
                  onChange={(e) => toggleActive(u.id, e.target.checked)}
                />
              </td>
              <td className="p-2 border text-center"></td>
            </tr>
          ))}
        </SZTable>
      )}
      <SZModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite User"
        footer={
          <div className="flex justify-end gap-2">
            <SZButton
              variant="secondary"
              onClick={() => setInviteOpen(false)}
              disabled={inviteLoading}
            >
              Cancel
            </SZButton>
            <SZButton onClick={submitInvite} isLoading={inviteLoading}>
              Send Invite
            </SZButton>
          </div>
        }
      >
        <div className="space-y-4">
          <SZInput
            id="invite_email"
            label="Email"
            value={inviteEmail}
            onChange={setInviteEmail}
          />
          <div className="space-y-1">
            <label htmlFor="invite_role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="invite_role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {toast && <p className="text-sm text-green-600">{toast}</p>}
        </div>
      </SZModal>
    </div>
  );
};

export default AdminUsersPage;
