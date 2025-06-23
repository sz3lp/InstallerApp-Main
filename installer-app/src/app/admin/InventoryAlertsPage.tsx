import React from "react";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import useInventoryLevels from "../../lib/hooks/useInventoryLevels";
import {
  GlobalLoading,
  GlobalEmpty,
  GlobalError,
} from "../../components/global-states";

const InventoryAlertsPage: React.FC = () => {
  const { alerts, loading, error, fetchAlerts, markResolved } =
    useInventoryLevels();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
      {loading ? (
        <GlobalLoading />
      ) : error ? (
        <GlobalError message={error} onRetry={fetchAlerts} />
      ) : alerts.length === 0 ? (
        <GlobalEmpty message="No low stock alerts." />
      ) : (
        <SZTable
          headers={[
            "Material",
            "Current Stock",
            "Threshold",
            "Timestamp",
            "Actions",
          ]}
        >
          {alerts.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2 border">{a.material_name ?? a.material_id}</td>
              <td className="p-2 border text-right">{a.current_stock}</td>
              <td className="p-2 border text-right">{a.threshold}</td>
              <td className="p-2 border">
                {new Date(a.alert_timestamp).toLocaleString()}
              </td>
              <td className="p-2 border">
                <SZButton size="xs" onClick={() => markResolved(a.id)}>
                  Resolve
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
    </div>
  );
};

export default InventoryAlertsPage;
