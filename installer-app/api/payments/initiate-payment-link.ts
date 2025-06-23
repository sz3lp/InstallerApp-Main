import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecret as string, { apiVersion: "2023-10-16" });

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const serviceRole =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl as string, serviceRole as string);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { invoice_id } = req.body || {};
    if (!invoice_id) {
      return res.status(400).json({ error: "Missing invoice_id" });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("id, invoice_total, total_due, clients(email)")
      .eq("id", invoice_id)
      .single();

    if (error || !invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const total = invoice.invoice_total ?? invoice.total_due;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: invoice.clients?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `SentientZone Invoice ${invoice.id}` },
            unit_amount: Math.round(Number(total) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoice_id: invoice.id,
        client_email: invoice.clients?.email || "",
      },
      success_url: "https://your-domain.com/payment-success",
      cancel_url: "https://your-domain.com/invoice-cancelled",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("initiate_payment_link error", err);
    return res.status(500).json({ error: "Failed to create payment link" });
  }
}
