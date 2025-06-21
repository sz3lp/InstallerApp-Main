import React, { useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZInput } from "../../components/ui/SZInput";
import { useAuth } from "../../lib/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface Message {
  id: string;
  job: string;
  sender: string;
  text: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    job: "JOB-1",
    sender: "Manager",
    text: "Please confirm arrival.",
    timestamp: "2024-05-01 09:00",
  },
  {
    id: "2",
    job: "JOB-1",
    sender: "Tech",
    text: "On site now.",
    timestamp: "2024-05-01 09:15",
  },
];

const MessagesPanel: React.FC = () => {
  const { session, isAuthorized, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");

  if (authLoading) return <p className="p-4">Loading...</p>;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized("Manager") && !isAuthorized("Admin"))
    return <Navigate to="/unauthorized" replace />;

  const send = () => {
    if (!text.trim()) return;
    setMessages((ms) => [
      ...ms,
      {
        id: Date.now().toString(),
        job: "JOB-1",
        sender: "You",
        text,
        timestamp: new Date().toLocaleString(),
      },
    ]);
    setText("");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Messages</h2>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="p-2 border rounded">
            <p className="text-sm">
              <span className="font-semibold">{m.sender}:</span> {m.text}
            </p>
            <p className="text-xs text-gray-500">{m.timestamp}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <SZInput
          id="msg"
          value={text}
          onChange={setText}
          className="flex-1"
          placeholder="Type message..."
        />
        <SZButton size="sm" onClick={send}>
          Send
        </SZButton>
      </div>
    </div>
  );
};

export default MessagesPanel;
