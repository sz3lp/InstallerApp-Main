import React, { useState, useEffect } from "react";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabaseClient";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token });
    }
  }, []);

  const submit = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Reset Password</h1>
      <SZInput
        id="new_password"
        label="New Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      {message && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
          {message}
        </div>
      )}
      <SZButton onClick={submit} fullWidth>
        Set Password
      </SZButton>
    </div>
  );
};

export default ResetPasswordPage;
