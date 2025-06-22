import { useEffect, useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import supabase from "../../../lib/supabaseClient";

const ALL_ROLES = ["Admin", "Manager", "Installer", "Sales", "Finance"];

export default function UserRoleEditor({ userId }: { userId: string }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
      setRole(data?.role ?? null);
    };
    fetch();
  }, [userId]);

  const updateRole = async (newRole: string) => {
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    setRole(newRole);
  };

  return (
    <div className="space-y-1">
      <h3 className="font-semibold">Role</h3>
      <div className="flex flex-wrap gap-2">
        {ALL_ROLES.map((r) => (
          <SZButton
            key={r}
            onClick={() => updateRole(r)}
            variant={role === r ? "primary" : "secondary"}
            size="sm"
          >
            {r}
          </SZButton>
        ))}
      </div>
    </div>
  );
}
