import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import { useAuth } from "../../lib/hooks/useAuth";

const LoginPage: React.FC = () => {
  console.log("Rendering LoginPage");
  const { signIn, role, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session && role) {
      const r = role.toLowerCase();
      if (r === "admin") navigate("/admin/dashboard", { replace: true });
      else if (r === "installer")
        navigate("/installer/dashboard", { replace: true });
      else if (r === "manager")
        navigate("/install-manager/dashboard", { replace: true });
      else if (r === "sales")
        navigate("/sales/dashboard", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [session, role, navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await signIn(email, password, remember);
    } catch (err: any) {
      setError(err.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <span className="text-sm">Remember Me</span>
        </label>
        <a
          href="/forgot-password"
          className="text-sm text-green-700 hover:underline"
        >
          Forgot Password?
        </a>
      </div>
      {showToast && error && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
      <SZButton onClick={handleLogin} isLoading={loading} fullWidth>
        Sign In
      </SZButton>
    </div>
  );
};

export default LoginPage;
