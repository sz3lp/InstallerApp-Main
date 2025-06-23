import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

export interface RevenueMonth {
  month: string;
  total_invoiced: number;
  total_paid: number;
  outstanding_balance: number;
}

export default function useRevenueByMonth() {
  const [data, setData] = useState<RevenueMonth[]>([]);

  useEffect(() => {
    supabase
      .from('revenue_by_month')
      .select('*')
      .then((res) => {
        if (res.error) {
          console.error(res.error);
          setData([]);
        } else {
          setData(res.data as RevenueMonth[]);
        }
      });
  }, []);

  return data;
}
