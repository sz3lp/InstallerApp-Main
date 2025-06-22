import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import { useAuth } from "../../lib/hooks/useAuth";

const LoginPage: React.FC = () => {
  const { signIn, role, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session && role === "Installer") {
      navigate("/installer", { replace: true });
    }
  }, [session, role, navigate]);

  const handleLogin = async () => {
    setError(null);
    try {
      await signIn(email, password);
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
