import { useEffect, useState } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import supabase from "../../lib/supabaseClient";
import { SZCard } from "../../components/ui/SZCard";

interface InventoryRow {
  material_id: string;
  material: {
    name: string;
  };
  quantity: number;
}

export default function InventoryPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<InventoryRow[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from("installer_inventory")
        .select("material_id, quantity, material:materials(name)")
        .eq("installer_id", session?.user?.id);

      if (!error) setItems(data ?? []);
    };

    if (session?.user?.id) fetchInventory();
  }, [session]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">My Inventory</h1>
      <div className="grid gap-2">
        {items.map((item) => (
          <SZCard key={item.material_id} className="flex justify-between">
            <span>{item.material.name}</span>
            <span className="font-mono">{item.quantity}</span>
          </SZCard>
        ))}
      </div>
    </div>
  );
}
