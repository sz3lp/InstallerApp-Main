import React from "react";
import { Link } from "react-router-dom";
import { SZTable } from "../../components/ui/SZTable";
import { SZButton } from "../../components/ui/SZButton";
import useInventoryLevels from "../../lib/hooks/useInventoryLevels";
import { GlobalLoading, GlobalEmpty } from "../../components/global-states";

const InventoryAlertsPage: React.FC = () => {
  const { alerts, loading, markResolved } = useInventoryLevels();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
      {loading ? (
        <GlobalLoading />
      ) : alerts.length === 0 ? (
        <GlobalEmpty message="No low stock alerts." />
      ) : (
        <SZTable
          headers={["Material", "Qty", "Threshold", "Installer", "Actions"]}
        >
          {alerts.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2 border">{a.material_name}</td>
              <td className="p-2 border text-right">{a.quantity}</td>
              <td className="p-2 border text-right">{a.reorder_threshold}</td>
              <td className="p-2 border">{a.installer_name ?? a.installer_id}</td>
              <td className="p-2 border space-x-2">
                <Link
                  to={`/installer/${a.installer_id}/inventory`}
                  className="underline text-blue-600"
                >
                  View
                </Link>
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
