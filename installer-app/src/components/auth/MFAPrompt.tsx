import React, { useState } from "react";
import { SZInput } from "../ui/SZInput";
import { SZButton } from "../ui/SZButton";

interface MFAPromptProps {
  onSubmit: (code: string) => void;
}

const MFAPrompt: React.FC<MFAPromptProps> = ({ onSubmit }) => {
  const [code, setCode] = useState("");

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Multi-Factor Authentication</h2>
      <SZInput
        id="mfa_code"
        label="Authentication Code"
        value={code}
        onChange={setCode}
      />
      <SZButton onClick={() => onSubmit(code)} fullWidth>
        Verify
      </SZButton>
    </div>
  );
};

export default MFAPrompt;
