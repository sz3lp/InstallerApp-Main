"use client";
import React, { useState } from "react";
import ModalWrapper from "../../installer/components/ModalWrapper";
import { SZInput } from "../ui/SZInput";
import { SZButton } from "../ui/SZButton";

interface User {
  id: string;
  name: string;
  role: string;
}

export type TeamSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TeamSettingsModal: React.FC<TeamSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Alice", role: "Manager" },
    { id: "2", name: "Bob", role: "Tech" },
  ]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Tech");

  const addUser = () => {
    if (!email) return;
    setUsers((us) => [
      ...us,
      { id: Date.now().toString(), name: email.split("@")[0], role },
    ]);
    setEmail("");
    setRole("Tech");
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Team Settings</h2>
      <div className="space-y-4">
        <div className="space-y-1">
          {users.map((u) => (
            <div key={u.id} className="flex justify-between border-b py-1">
              <span>{u.name}</span>
              <span className="text-sm text-gray-600">{u.role}</span>
            </div>
          ))}
        </div>
        <SZInput
          id="team_email"
          label="Add User by Email"
          value={email}
          onChange={setEmail}
        />
        <div>
          <label
            htmlFor="team_role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="team_role"
            className="border rounded px-3 py-2 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Manager">Manager</option>
            <option value="Tech">Tech</option>
          </select>
        </div>
        <div className="flex justify-end">
          <SZButton size="sm" onClick={addUser}>
            Add
          </SZButton>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <SZButton variant="secondary" onClick={onClose}>
          Close
        </SZButton>
      </div>
    </ModalWrapper>
  );
};

export default TeamSettingsModal;
