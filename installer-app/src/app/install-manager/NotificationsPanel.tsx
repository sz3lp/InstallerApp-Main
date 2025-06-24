import React from "react";
import useLowStockNotifications from "../../lib/hooks/useLowStockNotifications";
import { SZButton } from "../../components/ui/SZButton";
import { GlobalLoading, GlobalError } from "../../components/global-states";

const NotificationsPanel: React.FC = () => {
  const { notifications, loading, error, dismiss, fetchNotifications } =
    useLowStockNotifications();

  if (loading) return <GlobalLoading />;
  if (error) return <GlobalError message={error} onRetry={fetchNotifications} />;
  if (notifications.length === 0)
    return <div className="p-4 text-sm">No low stock alerts.</div>;

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li
          key={n.id}
          className="p-2 rounded bg-yellow-50 flex justify-between items-start"
        >
          <div>
            <p>{n.message}</p>
            <span className="text-xs text-gray-500">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </div>
          <SZButton size="sm" variant="secondary" onClick={() => dismiss(n.id)}>
            Dismiss
          </SZButton>
        </li>
      ))}
    </ul>
  );
};

export default NotificationsPanel;
