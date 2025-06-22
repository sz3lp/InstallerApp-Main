import { useCallback } from "react";
import supabase from "../supabaseClient";

export interface JobQuantity {
  job_id: string;
  material_id: string;
  quantity: number;
}

export default function useJobQuantities() {
  const logQuantity = useCallback(
    async (job_id: string, material_id: string, quantity: number) => {
      const { error } = await supabase.rpc("log_material_usage", {
        _job_id: job_id,
        _material_id: material_id,
        _quantity: quantity,
      });
      if (error) throw error;
    },
    [],
  );

  return { logQuantity } as const;
}
