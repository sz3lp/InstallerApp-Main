import { useState, useEffect, useCallback } from "react";
import supabase from "../supabaseClient";

export interface Quote {
  id: string;
  client_id: string | null;
  created_by: string | null;
  status: string;
  title: string | null;
  created_at: string;
  client_name?: string | null;
  total?: number;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("id, client_id, created_by, status, title, created_at, clients(name), quote_items(quantity, unit_price, total)")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error);
      setQuotes([]);
    } else {
      const list = (data ?? []).map((q: any) => {
        const items: any[] = q.quote_items ?? [];
        const total = items.reduce(
          (sum, it) => sum + (it.total ?? it.quantity * it.unit_price),
          0,
        );
        return { ...q, client_name: q.clients?.name ?? null, total };
      });
      setQuotes(list);
      setError(null);
    }
    setLoading(false);
  }, []);

  const createQuote = useCallback(
    async (
      quote: { client_id: string; title?: string; items: Omit<QuoteItem, "id" | "quote_id">[] }
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("quotes")
        .insert({ client_id: quote.client_id, title: quote.title ?? null, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      if (quote.items.length) {
        const rows = quote.items.map((i) => ({ ...i, quote_id: data.id }));
        const { error: itemErr } = await supabase.from("quote_items").insert(rows);
        if (itemErr) throw itemErr;
      }
      setQuotes((qs) => [{ ...data, client_name: data.clients?.name ?? null }, ...qs]);
      return data as Quote;
    },
    []
  );

  const updateQuote = useCallback(
    async (
      id: string,
      quote: { client_id: string; title?: string; status?: string; items: Omit<QuoteItem, "id" | "quote_id">[] }
    ) => {
      const { data, error } = await supabase
        .from("quotes")
        .update({ client_id: quote.client_id, title: quote.title ?? null, status: quote.status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      await supabase.from("quote_items").delete().eq("quote_id", id);
      if (quote.items.length) {
        const rows = quote.items.map((i) => ({ ...i, quote_id: id }));
        const { error: itemErr } = await supabase.from("quote_items").insert(rows);
        if (itemErr) throw itemErr;
      }
      setQuotes((qs) => qs.map((q) => (q.id === id ? { ...data, client_name: data.clients?.name ?? null } : q)));
      return data as Quote;
    },
    []
  );

  const approveQuote = useCallback(async (id: string) => {
    const { error } = await supabase.rpc("approve_quote", { quote_id: id });
    if (error) throw error;
    setQuotes((qs) =>
      qs.map((q) => (q.id === id ? { ...q, status: "approved" } : q)),
    );
  }, []);

  const deleteQuote = useCallback(async (id: string) => {
    await supabase.from("quote_items").delete().eq("quote_id", id);
    const { error } = await supabase.from("quotes").delete().eq("id", id);
    if (error) throw error;
    setQuotes((qs) => qs.filter((q) => q.id !== id));
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return [
    quotes,
    { data: quotes, loading, error, fetchQuotes, createQuote, updateQuote, approveQuote, deleteQuote },
  ] as const;
}

export default useQuotes;
