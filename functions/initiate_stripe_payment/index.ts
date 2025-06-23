import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  try {
    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response("Missing invoice_id", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();
    if (error || !invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    const amount = invoice.total_due ?? invoice.invoice_total ?? 0;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Invoice ${invoice.id}` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { invoice_id },
      success_url: "https://yourdomain.com/invoices/success",
      cancel_url: "https://yourdomain.com/invoices/cancel",
    });

    await supabase
      .from("invoices")
      .update({ stripe_session_id: session.id })
      .eq("id", invoice_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("initiate_stripe_payment error", err);
    return new Response("Server error", { status: 500 });
  }
});
