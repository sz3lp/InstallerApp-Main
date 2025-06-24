import Stripe from 'stripe';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const invoice_id = session.metadata?.invoice_id;
    const client_id = session.metadata?.client_id;

    const amount = session.amount_total ? session.amount_total / 100 : null;

    if (!invoice_id || !amount) {
      return new Response('Missing metadata', { status: 400 });
    }

    await supabase.from('payments').insert({
      invoice_id,
      client_id,
      amount,
      payment_method: 'stripe',
      reference_number: session.payment_intent,
    });

    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', invoice_id);
  }

  return new Response('OK', { status: 200 });
});
