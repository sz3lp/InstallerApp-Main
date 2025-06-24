import React, { useEffect, useRef, useState } from "react";
import { SZButton } from "../../components/ui/SZButton";
import { SZTextarea } from "../../components/ui/SZTextarea";
import supabase from "../../lib/supabaseClient";
import useAuth from "../../lib/hooks/useAuth";

interface MessagesPanelProps {
  jobId: string;
}

interface MessageRow {
  id: string;
  job_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  users: { full_name: string | null; email: string | null } | null;
}

const MAX_RETRIES = 5;

const MessagesPanel: React.FC<MessagesPanelProps> = ({ jobId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const retriesRef = useRef(0);

  const toast = {
    error: (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
    },
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("job_messages")
      .select(
        "id, job_id, sender_id, message, created_at, users(full_name, email)"
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch messages", error);
      return;
    }
    setMessages(data as MessageRow[]);
  };

  useEffect(() => {
    fetchMessages();
  }, [jobId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!jobId) return;
    const channel = supabase.channel(`job_messages_${jobId}`);
    const subscribe = () => {
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "job_messages",
            filter: `job_id=eq.${jobId}`,
          },
          (payload) => {
            const newRow = payload.new as MessageRow;
            setMessages((ms) => [newRow, ...ms]);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            retriesRef.current = 0;
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            handleDisconnect();
          }
        });
    };

    const handleDisconnect = () => {
      supabase.removeChannel(channel);
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setTimeout(subscribe, 1000 * retriesRef.current);
      } else {
        toast.error("Realtime sync lost. Please refresh.");
      }
    };

    subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const send = async () => {
    const content = text.trim();
    if (!content || !user) return;
    const { data, error } = await supabase
      .from("job_messages")
      .insert({
        job_id: jobId,
        sender_id: user.id,
        message: content,
        created_at: new Date().toISOString(),
      })
      .select(
        "id, job_id, sender_id, message, created_at, users(full_name, email)"
      )
      .single();
    if (error) {
      console.error("Failed to send message", error);
      toast.error("Failed to send message");
    } else if (data) {
      setMessages((ms) => [data as MessageRow, ...ms]);
      setText("");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Messages</h2>
      <div
        ref={listRef}
        className="max-h-64 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2"
      >
        {messages.map((m) => (
          <div key={m.id} className="p-2 border rounded">
            <p className="text-sm font-semibold">
              {m.users?.full_name || m.users?.email || m.sender_id} —{' '}
              {new Date(m.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="whitespace-pre-wrap text-sm">{m.message}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <SZTextarea
          id="msg"
          value={text}
          onChange={setText}
          className="flex-1"
          rows={2}
          placeholder="Type message..."
        />
        <SZButton size="sm" onClick={send} disabled={!text.trim()}>
          Send
        </SZButton>
      </div>
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;
