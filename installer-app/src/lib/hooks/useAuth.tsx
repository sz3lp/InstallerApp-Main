import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import supabase from "../supabaseClient";
import { getUserRole } from "../authHelpers";

type AuthContextType = {
  session: any;
  user: any;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session: active } } = await supabase.auth.getSession();
      let current = active;
      if (!current) {
        const stored = localStorage.getItem("sb_session");
        if (stored) current = JSON.parse(stored);
      }
      setSession(current);
      setUser(current?.user ?? null);
      if (current?.user) {
        const role = await getUserRole(current.user.id);
        setRole(role);
      } else {
        setRole(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    localStorage.setItem("sb_session", JSON.stringify(data.session));
    const role = await getUserRole(data.user.id);
    setRole(role);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem("sb_session");
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default useAuth;
