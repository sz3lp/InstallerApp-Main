import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

interface RoleRow {
  id: string;
  role: string;
}

export default function useAuth() {
  const [session, setSession] = useState<null | any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId?: string | null) => {
    if (!userId) {
      setRole(null);
      return;
    }
    const { data, error } = await supabase
      .from<RoleRow>("user_roles")
      .select("role")
      .eq("id", userId)
      .single();
    if (error) {
      console.error(error);
      setRole(null);
    } else {
      setRole(data?.role ?? null);
    }
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await fetchRole(data.session?.user?.id);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        await fetchRole(newSession?.user?.id);
        setLoading(false);
      },
    );

    // final fallback in case callbacks don't fire
    timeout = setTimeout(() => setLoading(false), 10000);

    return () => {
      listener?.subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return { session, role, loading } as const;
}
