import React, { useState } from "react";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import supabase from "../../lib/supabaseClient";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`Password reset link sent to ${email}`);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
      <SZInput id="fp_email" label="Email" value={email} onChange={setEmail} />
      {message && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
          {message}
        </div>
      )}
      <SZButton onClick={submit} fullWidth>
        Send Reset Link
      </SZButton>
    </div>
  );
};

export default ForgotPasswordPage;
