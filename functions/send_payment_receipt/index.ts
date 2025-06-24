import nodemailer from 'npm:nodemailer@6.9.10'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const transport = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOSTNAME')!,
  port: Number(Deno.env.get('SMTP_PORT')!),
  secure: Boolean(Deno.env.get('SMTP_SECURE')!),
  auth: {
    user: Deno.env.get('SMTP_USERNAME')!,
    pass: Deno.env.get('SMTP_PASSWORD')!,
  },
})

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { payment_id } = await req.json()
  if (!payment_id) {
    return new Response('Missing payment_id', { status: 400 })
  }

  const { data: payment, error: paymentErr } = await supabase
    .from('payments')
    .select('id, amount, invoice_id')
    .eq('id', payment_id)
    .single()

  if (paymentErr || !payment) {
    return new Response('Payment not found', { status: 404 })
  }

  const { data: invoice, error: invoiceErr } = await supabase
    .from('invoices')
    .select('id, invoice_total, clients(contact_email, name)')
    .eq('id', payment.invoice_id)
    .single()

  if (invoiceErr || !invoice) {
    return new Response('Invoice not found', { status: 404 })
  }

  const toEmail = invoice.clients?.contact_email
  if (!toEmail) {
    return new Response('Client email missing', { status: 400 })
  }

  const html = `
    <h2>Payment Receipt</h2>
    <p>Invoice #${invoice.id}</p>
    <p>Amount Paid: $${payment.amount.toFixed(2)}</p>
    <p>Total Invoice: $${(invoice.invoice_total as number).toFixed(2)}</p>
  `

  try {
    await new Promise<void>((resolve, reject) => {
      transport.sendMail(
        {
          from: Deno.env.get('SMTP_FROM')!,
          to: toEmail,
          subject: `Payment Receipt for Invoice ${invoice.id}`,
          html,
        },
        (error) => {
          if (error) return reject(error)
          resolve()
        },
      )
    })
  } catch (err) {
    return new Response('Failed to send email', { status: 500 })
  }

  await supabase
    .from('payments')
    .update({ receipt_sent_at: new Date().toISOString() })
    .eq('id', payment_id)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
