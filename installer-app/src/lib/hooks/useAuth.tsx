import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import supabase from "../supabaseClient";
import { getUserRole } from "../authHelpers";

function normalizeRole(role: string | null): string | null {
  if (!role) return null;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

type AuthContextType = {
  session: any;
  user: any;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
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
      console.log("Initializing auth...");

      const {
        data: { session: active },
      } = await supabase.auth.getSession();

      let current = active;

      if (!current) {
        const stored =
          localStorage.getItem("sb_session") ||
          sessionStorage.getItem("sb_session");
        if (stored) current = JSON.parse(stored);
      }

      setSession(current);
      setUser(current?.user ?? null);

      let currentRole: string | null = null;
      if (current?.user) {
        currentRole = await getUserRole(current.user.id);
        const normalized = normalizeRole(currentRole);
        setRole(normalized);
        console.log("Loaded role", normalized);
      } else {
        setRole(null);
      }

      setLoading(false);
      console.log("Auth initialized", { session: current, role: currentRole });
    };

    init();
  }, []);

  const signIn = async (
    email: string,
    password: string,
    remember: boolean = true
  ) => {
    console.log("Attempting sign in", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    setSession(data.session);
    setUser(data.user);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("sb_session", JSON.stringify(data.session));

    const role = await getUserRole(data.user.id);
    const normalized = normalizeRole(role);
    setRole(normalized);
    console.log("Signed in with role", normalized);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    console.log("Signed out");
    setSession(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem("sb_session");
    sessionStorage.removeItem("sb_session");
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signIn, signOut }}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default useAuth;
