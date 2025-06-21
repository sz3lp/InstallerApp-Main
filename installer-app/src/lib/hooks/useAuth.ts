import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).single();
        setRole(data?.role);
      }
      setLoading(false);
    };

    fetchSessionAndRole();
    supabase.auth.onAuthStateChange(() => fetchSessionAndRole());
  }, []);

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
