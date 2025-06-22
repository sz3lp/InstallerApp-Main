import React, { useState } from "react";
import ModalWrapper from "../../../installer/components/ModalWrapper";
import { SZButton } from "../../../components/ui/SZButton";
import { SZInput } from "../../../components/ui/SZInput";
import supabase from "../../../lib/supabaseClient";
import { AdminUser } from "./AdminUserListPage";
import UserRoleEditor from "./UserRoleEditor";

type Props = {
  user: AdminUser;
  onClose: () => void;
};

const AdminUserForm: React.FC<Props> = ({ user, onClose }) => {
  const [form, setForm] = useState<AdminUser>({
    id: user.id,
    email: user.email || "",
    full_name: user.full_name || "",
    active: user.active ?? true,
  });

  const save = async () => {
    if (form.id) {
      await supabase
        .from("users")
        .update({
          email: form.email,
          full_name: form.full_name,
          active: form.active,
        })
        .eq("id", form.id);
    } else {
      await supabase.from("users").insert({
        email: form.email,
        full_name: form.full_name,
        active: form.active,
      });
    }
    onClose();
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        {form.id ? "Edit User" : "New User"}
      </h2>
      <div className="space-y-2">
        <SZInput
          id="user_email"
          label="Email"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        />
        <SZInput
          id="user_fullname"
          label="Full Name"
          value={form.full_name ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) =>
              setForm((f) => ({ ...f, active: e.target.checked }))
            }
          />
          Active
        </label>
        {form.id && <UserRoleEditor userId={form.id} />}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <SZButton variant="secondary" onClick={onClose}>
          Cancel
        </SZButton>
        <SZButton onClick={save}>Save</SZButton>
      </div>
    </ModalWrapper>
  );
};

export default AdminUserForm;
