import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export interface AuthSession {
  user: {
    id: string;
  } | null;
  [key: string]: any;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session as AuthSession | null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        setSession(sess as AuthSession | null);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { session } as const;
}

export default useAuth;
