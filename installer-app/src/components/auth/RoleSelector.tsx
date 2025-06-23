import React from "react";
import { SZButton } from "../ui/SZButton";
import { useAuth } from "../../lib/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const RoleSelector: React.FC = () => {
  const { getAvailableRoles, setRole } = useAuth();
  const navigate = useNavigate();
  const roles = getAvailableRoles();

  const handleSelect = (r: string) => {
    setRole(r);
    navigate("/", { replace: true });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Select Role</h1>
      {roles.map((r) => (
        <SZButton key={r} onClick={() => handleSelect(r)} fullWidth>
          {r}
        </SZButton>
      ))}
    </div>
  );
};

export default RoleSelector;
