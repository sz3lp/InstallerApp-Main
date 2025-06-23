import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.VITE_SUPABASE_API_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-04-10' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { invoiceId } = req.body;
  if (!invoiceId) return res.status(400).json({ error: 'Missing invoiceId' });

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, invoice_total, client_id')
    .eq('id', invoiceId)
    .single();
  if (error || !invoice) return res.status(404).json({ error: 'Invoice not found' });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Invoice ${invoice.id}` },
          unit_amount: Math.round(Number(invoice.invoice_total) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoice.id,
      client_id: invoice.client_id || '',
    },
    success_url: `${baseUrl}/invoices/${invoice.id}?success=1`,
    cancel_url: `${baseUrl}/invoices/${invoice.id}?canceled=1`,
  });

  return res.status(200).json({ url: session.url });
}
