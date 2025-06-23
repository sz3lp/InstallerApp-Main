import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "npm:stripe";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Bad signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const invoice_id = session.metadata.invoice_id;

    await supabase
      .from("invoices")
      .update({
        payment_status: "paid",
        amount_paid: session.amount_total / 100,
      })
      .eq("id", invoice_id);

    await supabase.from("payments").insert({
      invoice_id,
      amount: session.amount_total / 100,
      payment_method: "stripe",
      logged_by_user_id: "stripe_system",
    });
  }

  return new Response("ok", { status: 200 });
});
