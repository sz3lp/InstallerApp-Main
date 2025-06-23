import React, { useState } from "react";
import { SZInput } from "../../../components/ui/SZInput";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";

const ROLES = ["Admin", "Installer", "Sales", "Manager"];

type Toast = { message: string; success: boolean } | null;

const AdminInviteUserPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Installer");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const submitInvite = async () => {
    setLoading(true);
    setToast(null);
    const { error } = await supabase.rpc("create_pending_user", {
      email,
      role,
    });
    if (error) {
      setToast({ message: error.message, success: false });
    } else {
      setToast({ message: `Invite sent to ${email}`, success: true });
      setEmail("");
      setRole("Installer");
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Invite User</h1>
      <SZInput id="invite_email" label="Email" value={email} onChange={setEmail} />
      <div className="space-y-1">
        <label htmlFor="invite_role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="invite_role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      {toast && (
        <div
          className={`fixed top-4 right-4 text-white px-4 py-2 rounded ${toast.success ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.message}
        </div>
      )}
      <SZButton onClick={submitInvite} isLoading={loading}>
        Invite User
      </SZButton>
    </div>
  );
};

export default AdminInviteUserPage;
