import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import { SZButton } from "./ui/SZButton";

const InventoryAlertBanner: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase
        .from("inventory_alerts")
        .select("id", { count: "exact", head: true })
        .eq("is_resolved", false);
      setCount(count ?? 0);
    };
    load();
  }, []);

  if (count === 0) return null;

  return (
    <div className="p-4 mb-4 border rounded bg-red-50 flex justify-between items-center">
      <span className="text-red-800 font-medium">
        {count} inventory item{count === 1 ? "" : "s"} below threshold
      </span>
      <SZButton size="sm" onClick={() => navigate("/admin/inventory-alerts")}>
        Review Inventory Alerts
      </SZButton>
    </div>
  );
};

export default InventoryAlertBanner;
