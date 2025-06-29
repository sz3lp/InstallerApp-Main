import { useEffect, useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../lib/hooks/useAuth";

const ALL_ROLES = [
  "Installer",
  "Admin",
  "Manager",
  "Install Manager",
  "Sales",
  "Finance",
];

export default function UserRoleEditor({ userId }: { userId: string }) {
  const [role, setRole] = useState<string | null>(null);
  const { user, refreshRoles } = useAuth();

  useEffect(() => {
    const fetch = async () => {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
      setRole(data?.role ?? null);
    };
    fetch();
  }, [userId]);

  const updateRole = async (newRole: string) => {
    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
    setRole(newRole);
    if (user && user.id === userId) {
      await refreshRoles();
    }
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
