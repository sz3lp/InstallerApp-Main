import { useEffect, useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import { supabase } from "../../../lib/supabaseClient";

const ALL_ROLES = ["Admin", "Manager", "Installer", "Sales", "Finance"];

export default function UserRoleEditor({ userId }: { userId: string }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      setRole(data?.role ?? null);
    };
    fetch();
  }, [userId]);

  const updateRole = async (newRole: string) => {
    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
    setRole(newRole);
  };

  return (
    <div className="space-y-1">
      <h3 className="font-semibold">Role</h3>
      <div className="flex flex-wrap gap-2">
        {ALL_ROLES.map((r) => (
          <SZButton
            key={r}
            size="sm"
            variant={role === r ? "primary" : "secondary"}
            onClick={() => updateRole(r)}
          >
            {r}
          </SZButton>
        ))}
      </div>
    </div>
  );
}
