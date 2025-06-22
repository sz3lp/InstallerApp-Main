import { useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminUserForm({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...user });

  const save = async () => {
    if (form.id) {
      await supabase.from("users").update(form).eq("id", form.id);
    } else {
      await supabase.from("users").insert(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded space-y-2 w-[400px]">
        <input
          className="w-full border p-2"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <input
          className="w-full border p-2"
          value={form.full_name || ""}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Full Name"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>
        <div className="flex justify-end gap-2">
          <SZButton onClick={save}>Save</SZButton>
          <SZButton onClick={onClose}>Cancel</SZButton>
        </div>
      </div>
    </div>
  );
}
