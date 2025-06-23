import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import supabase from "../supabaseClient";
import { GlobalLoading, GlobalError } from "../../components/global-states";

function normalizeRole(role: string | null): string | null {
  if (!role) return null;
  return role
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

type AuthContextType = {
  session: any;
  user: any;
  role: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: string) => void;
  getAvailableRoles: () => string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRoleState] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaChallenge, setMfaChallenge] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const initialize = async () => {
    setError(null);
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

      let available: string[] = [];
      let currentRole: string | null = null;
      if (current?.user) {
        const { data: roleRows, error: roleErr } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", current.user.id);
        if (roleErr) {
          console.error("Failed to fetch roles", roleErr);
          setError("Failed to load roles");
        } else {
          available = (roleRows ?? []).map((r: any) => normalizeRole(r.role) as string);
          setRoles(available);

          const storedRole = sessionStorage.getItem("selected_role");
          if (storedRole && available.includes(storedRole)) {
            currentRole = storedRole;
          } else if (available.length === 1) {
            currentRole = available[0];
          }
          setRoleState(currentRole);
          console.log("Loaded roles", available, "current", currentRole);
        }
      } else {
        setRoles([]);
        setRoleState(null);
      }

      setLoading(false);
      console.log("Auth initialized", { session: current, role: currentRole });
    };

  useEffect(() => {
    initialize();
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
    if (error) {
      if (error.message.includes("MFA")) {
        setMfaChallenge(data.mfa);
        throw error;
      }
      throw error;
    }

    setSession(data.session);
    setUser(data.user);

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("sb_session", JSON.stringify(data.session));

    const { data: roleRows, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    let available: string[] = [];
    if (roleErr) {
      console.error("Failed to fetch roles", roleErr);
      setError("Failed to load roles");
    } else {
      available = (roleRows ?? []).map((r: any) => normalizeRole(r.role) as string);
      setRoles(available);
    }

    let selected: string | null = null;
    const storedRole = sessionStorage.getItem("selected_role");
    if (storedRole && available.includes(storedRole)) {
      selected = storedRole;
    } else if (available.length === 1) {
      selected = available[0];
    }
    setRoleState(selected);
    console.log("Signed in roles", available, "selected", selected);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    console.log("Signed out");
    setSession(null);
    setUser(null);
    setRoleState(null);
    setRoles([]);
    localStorage.removeItem("sb_session");
    sessionStorage.removeItem("sb_session");
  };

  const verifyMfa = async (code: string) => {
    if (!mfaChallenge) return;
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: mfaChallenge.factorId,
      challengeId: mfaChallenge.id,
      code,
    });
    if (error) throw error;
    setSession(data.session);
    setUser(data.user);
    setMfaChallenge(null);

    const { data: roleRows, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    let available: string[] = [];
    if (roleErr) {
      console.error("Failed to fetch roles", roleErr);
      setError("Failed to load roles");
    } else {
      available = (roleRows ?? []).map((r: any) => normalizeRole(r.role) as string);
      setRoles(available);
    }
    let selected: string | null = null;
    if (available.length === 1) selected = available[0];
    setRoleState(selected);
  };

  const setRole = (r: string) => {
    setRoleState(r);
    sessionStorage.setItem("selected_role", r);
  };

  const getAvailableRoles = () => roles;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        loading,
        error,
        signIn,
        verifyMfa,
        signOut,
        setRole,
        getAvailableRoles,
      }}
    >
      {loading ? (
        <GlobalLoading />
      ) : error ? (
        <GlobalError message={error} onRetry={initialize} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default useAuth;
