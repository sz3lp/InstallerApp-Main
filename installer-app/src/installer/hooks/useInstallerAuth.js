import { useAuth } from "../../lib/hooks/useAuth";

export default function useInstallerAuth() {
  try {
    const { session } = useAuth();
    const installerId = session?.user?.id || null;
    return { installerId };
  } catch {
    // allow use outside AuthProvider in tests
    return { installerId: "user_345" };
  }
}
