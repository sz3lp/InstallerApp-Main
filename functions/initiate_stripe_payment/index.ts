import Stripe from 'stripe';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { invoice_id } = await req.json();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, total_fees, client_id')
    .eq('id', invoice_id)
    .single();

  if (error || !invoice) {
    return new Response('Invoice not found', { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Invoice #${invoice.id}` },
          unit_amount: Math.round(invoice.total_fees * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoice.id,
      client_id: invoice.client_id,
    },
    success_url: 'https://your-domain.com/invoice/success',
    cancel_url: 'https://your-domain.com/invoice/cancel',
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
