import { createClient } from "@supabase/supabase-js";
import cron from "node-cron";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing Supabase credentials for scheduler");
}

const supabase = createClient(supabaseUrl, serviceKey);

interface InvoiceRow {
  id: string;
  client_email: string | null;
  due_date: string | null;
  payment_status: string;
  clients?: { reminder_cadence_days?: number | null } | null;
}

export default class InvoiceDeliveryScheduler {
  static async sendInitialInvoice(id: string): Promise<void> {
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("id, client_email")
      .eq("id", id)
      .single();
    if (error || !invoice) {
      console.error("Invoice not found", error);
      return;
    }

    await supabase.functions.invoke("send_invoice_email", {
      body: JSON.stringify({ invoice_id: id, client_email: invoice.client_email }),
    });

    await supabase.from("messages").insert({
      invoice_id: id,
      type: "invoice_email",
      sent_at: new Date().toISOString(),
    });

    await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", id);
  }

  static async sendReminder(inv: InvoiceRow): Promise<void> {
    await supabase.functions.invoke("send_invoice_reminder", {
      body: JSON.stringify({ invoice_id: inv.id, client_email: inv.client_email }),
    });
    await supabase.from("messages").insert({
      invoice_id: inv.id,
      type: "invoice_reminder",
      sent_at: new Date().toISOString(),
    });
  }

  static async checkOverdueInvoices(): Promise<void> {
    const today = new Date().toISOString();
    const { data, error } = await supabase
      .from("invoices")
      .select(
        "id, client_email, due_date, payment_status, clients(reminder_cadence_days)"
      )
      .lt("due_date", today)
      .neq("payment_status", "paid");
    if (error) {
      console.error("Failed to fetch overdue invoices", error);
      return;
    }
    const invoices = (data ?? []) as InvoiceRow[];
    for (const inv of invoices) {
      if (!inv.due_date) continue;
      const cadence = inv.clients?.reminder_cadence_days ?? 7;
      const { data: last } = await supabase
        .from("messages")
        .select("sent_at")
        .eq("invoice_id", inv.id)
        .eq("type", "invoice_reminder")
        .order("sent_at", { ascending: false })
        .limit(1)
        .single();
      const lastSent = last ? new Date(last.sent_at) : null;
      const now = new Date();
      const dueDate = new Date(inv.due_date);
      if (
        now.getTime() >= dueDate.getTime() &&
        (!lastSent ||
          now.getTime() - lastSent.getTime() >= cadence * 24 * 60 * 60 * 1000)
      ) {
        await this.sendReminder(inv);
      }
    }
  }

  static start(): void {
    cron.schedule("0 8 * * *", () => {
      this.checkOverdueInvoices();
    });
  }
}
