import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import { useAuth } from "../../lib/hooks/useAuth";

const dashboardMap: Record<string, string> = {
  admin: "/admin/dashboard",
  installer: "/installer/dashboard",
  manager: "/install-manager/dashboard",
  sales: "/sales/dashboard",
};

const LoginPage: React.FC = () => {
  const { signIn, role, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && role) {
      const path = dashboardMap[role.toLowerCase()] ?? "/";
      setRedirectPath(path);
    }
  }, [loading, session, role]);

  const handleLogin = async () => {
    setError(null);
    try {
      await signIn(email, password, remember);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (redirectPath) return <Navigate to={redirectPath} replace />;

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <SZInput id="email" label="Email" value={email} onChange={setEmail} />
      <SZInput id="password" label="Password" type="password" value={password} onChange={setPassword} />
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
          <span>Remember me</span>
        </label>
      </div>
      <SZButton onClick={handleLogin}>Login</SZButton>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default LoginPage;
