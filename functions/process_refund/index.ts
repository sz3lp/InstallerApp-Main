import Stripe from 'stripe';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { payment_id, invoice_id, amount, reason } = await req.json();

    const { data: payment, error } = await supabase
      .from('payments')
      .select('id, invoice_id, reference_number, amount')
      .eq('id', payment_id)
      .single();

    if (error || !payment) {
      return new Response('Payment not found', { status: 404 });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.reference_number ?? undefined,
      amount: Math.round(amount * 100),
    });

    const { error: insertErr } = await supabase.from('refunds').insert({
      payment_id,
      amount,
      reason,
      refunded_at: new Date().toISOString(),
      stripe_refund_id: refund.id,
    });

    if (insertErr) {
      return new Response(insertErr.message, { status: 400 });
    }

    if (payment.invoice_id) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_total, amount_paid')
        .eq('id', payment.invoice_id)
        .single();

      const newPaid = (invoice?.amount_paid ?? 0) - amount;
      let status = 'unpaid';
      if (newPaid >= (invoice?.invoice_total ?? 0)) status = 'paid';
      else if (newPaid > 0) status = 'partially_paid';

      await supabase
        .from('invoices')
        .update({ amount_paid: newPaid, payment_status: status })
        .eq('id', payment.invoice_id);
    }

    return new Response(JSON.stringify({ id: refund.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Refund error', err);
    return new Response('Refund error', { status: 500 });
  }
});
