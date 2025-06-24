import React, { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import {
  GlobalLoading,
  GlobalError,
  GlobalEmpty,
} from "../../components/global-states";
import usePurchaseOrders from "../../lib/hooks/usePurchaseOrders";
import useAuth from "../../lib/hooks/useAuth";
import PurchaseOrderForm from "../../components/forms/PurchaseOrderForm";

const PurchaseOrdersPage: React.FC = () => {
  const { role, loading: authLoading } = useAuth();
  const { orders, loading, error, createOrder, updateStatus, fetchOrders } =
    usePurchaseOrders();
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);

  if (authLoading) return <GlobalLoading />;
  if (role !== "Admin" && role !== "Install Manager") {
    return <Navigate to="/unauthorized" replace />;
  }

  const filtered = useMemo(() => {
    return statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <SZButton size="sm" onClick={() => setOpen(true)}>
          New Purchase Order
        </SZButton>
      </div>
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="received">Received</option>
        </select>
      </div>
      {loading ? (
        <GlobalLoading />
      ) : error ? (
        <GlobalError message={error} onRetry={fetchOrders} />
      ) : filtered.length === 0 ? (
        <GlobalEmpty message="No purchase orders found." />
      ) : (
        <SZTable headers={["Supplier", "Order Date", "Status", "Actions"]}>
          {filtered.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-2 border">{o.supplier}</td>
              <td className="p-2 border">
                {new Date(o.order_date).toLocaleDateString()}
              </td>
              <td className="p-2 border">{o.status}</td>
              <td className="p-2 border space-x-2">
                {o.status === "draft" && (
                  <SZButton
                    size="xs"
                    onClick={() => updateStatus(o.id, "submitted")}
                  >
                    Submit
                  </SZButton>
                )}
                {o.status !== "received" && (
                  <SZButton
                    size="xs"
                    onClick={() => updateStatus(o.id, "received")}
                  >
                    Mark Received
                  </SZButton>
                )}
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      <PurchaseOrderForm
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={async (data) => {
          await createOrder(data);
          setOpen(false);
        }}
      />
    </div>
  );
};

export default PurchaseOrdersPage;
