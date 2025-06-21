import { createContext, useState, useEffect, useContext, ReactNode } from "react";

type AuthContextType = {
  session: any;
  role: string | null;
  loading: boolean;
  isAuthorized: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).single();
        setRole(data?.role || null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const isAuthorized = (r: string) => role === r;

  return (
    <AuthContext.Provider value={{ session, role, loading, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
