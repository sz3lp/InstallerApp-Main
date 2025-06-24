import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { MailService } from 'https://esm.sh/@sendgrid/mail@7.7.0';

serve(async (req) => {
  const { email, message } = await req.json();
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  const from = Deno.env.get('ALERT_FROM_EMAIL');
  if (!apiKey || !from) {
    return new Response('Missing email configuration', { status: 500 });
  }

  const mail = new MailService();
  mail.setApiKey(apiKey);

  try {
    await mail.send({
      to: email,
      from,
      subject: 'Low Stock Alert',
      text: message,
    });
    return new Response('sent', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('failed', { status: 500 });
  }
});
