import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import { useAuth } from "../../lib/hooks/useAuth";

const roleRoute: Record<string, string> = {
  Installer: "/appointments",
  Admin: "/admin/jobs/new",
  Manager: "/manager/review",
};

const LoginPage: React.FC = () => {
  const { signIn, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (role && roleRoute[role]) {
      navigate(roleRoute[role], { replace: true });
    }
  }, [role, navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <SZInput id="email" label="Email" value={email} onChange={setEmail} />
      <SZInput
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <SZButton onClick={handleLogin} isLoading={loading} fullWidth>
        Sign In
      </SZButton>
    </div>
  );
};

export default LoginPage;
