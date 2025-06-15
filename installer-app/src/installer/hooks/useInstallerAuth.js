import { useMemo } from "react";

export default function useInstallerAuth() {
  // simple auth stub returning a hardcoded installerId
  const installerId = useMemo(() => "user_345", []);
  return { installerId };
}
