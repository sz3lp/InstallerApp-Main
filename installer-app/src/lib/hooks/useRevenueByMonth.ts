import { useState, useEffect } from "react";
import supabase from "../supabaseClient";

export interface RevenueByMonthRow {
  month: string;
  total_invoiced: number;
  total_paid: number;
  outstanding_balance: number;
}

export default function useRevenueByMonth() {
  const [data, setData] = useState<RevenueByMonthRow[]>([]);

  useEffect(() => {
    supabase
      .from("revenue_by_month")
      .select("*")
      .order("month", { ascending: true })
      .then((res) => setData((res.data as RevenueByMonthRow[]) || []));
  }, []);

  return data;
}
