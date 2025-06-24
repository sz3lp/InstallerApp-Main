import React, { useEffect, useState, useRef } from "react";
import supabase from "../../lib/supabaseClient";
import { SZButton } from "../../components/ui/SZButton";
import {
  GlobalEmpty,
  GlobalError,
  GlobalLoading,
} from "../../components/global-states";

interface NotificationRow {
  id: string;
  message: string;
  created_at: string;
}

const MAX_RETRIES = 5;

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retriesRef = useRef(0);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("id, message, created_at")
      .eq("type", "low_stock")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setNotifications([]);
    } else {
      setNotifications((data ?? []) as NotificationRow[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const channel = supabase.channel("low_stock_notifications");
    const subscribe = () => {
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: "type=eq.low_stock",
          },
          async (payload) => {
            const row = payload.new as NotificationRow;
            setNotifications((n) => [row, ...n]);
            await supabase.functions.invoke("send_low_stock_email", {
              body: JSON.stringify({ notification_id: row.id }),
            });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "notifications",
            filter: "type=eq.low_stock",
          },
          (payload) => {
            const oldRow = payload.old as NotificationRow;
            setNotifications((n) => n.filter((m) => m.id !== oldRow.id));
          },
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
      }
    };

    subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((n) => n.filter((m) => m.id !== id));
  };

  if (loading) return <GlobalLoading />;
  if (error)
    return <GlobalError message={error} onRetry={fetchNotifications} />;
  if (notifications.length === 0)
    return <GlobalEmpty message="No low stock notifications." />;

  return (
    <div className="space-y-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="p-2 rounded bg-gray-50 flex justify-between items-start"
        >
          <div>
            <p>{n.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
          <SZButton size="sm" variant="secondary" onClick={() => dismiss(n.id)}>
            Dismiss
          </SZButton>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPanel;
