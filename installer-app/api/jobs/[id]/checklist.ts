import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const body = req.body || {};
    console.log('Checklist submitted for job', id, body);
    // TODO: validate and store checklist using Supabase
    return res.status(200).json({ success: true, jobId: id, received: body });
  } catch (err) {
    console.error('Failed to process checklist', err);
    return res.status(500).json({ error: 'Failed to process checklist' });
  }
}
