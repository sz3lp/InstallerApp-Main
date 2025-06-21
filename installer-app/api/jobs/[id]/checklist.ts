import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const jobId = Array.isArray(id) ? id[0] : id;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { data, error } = await supabase
      .from('checklists')
      .insert({
        job_id: jobId,
        ...body,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error', error);
      return res.status(500).json({ error: 'Failed to save checklist' });
    }

    return res.status(200).json({ success: true, checklist: data });
  } catch (err) {
    console.error('Failed to process checklist', err);
    return res.status(500).json({ error: 'Failed to process checklist' });
  }
}
