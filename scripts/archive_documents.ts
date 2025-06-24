import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const jobId = process.argv[2];
if (!jobId) {
  console.error('Usage: ts-node archive_documents.ts <job_id>');
  process.exit(1);
}

async function archiveDocuments(jobId: string) {
  const { data: docs, error } = await supabase
    .from('job_documents')
    .select('id, url')
    .eq('job_id', jobId)
    .eq('archived', false);
  if (error) {
    console.error('Failed to fetch documents', error.message);
    return;
  }
  if (!docs || docs.length === 0) {
    console.log(`No documents to archive for job ${jobId}`);
    return;
  }

  const archivedIds: string[] = [];

  for (const doc of docs) {
    const { id, url } = doc as { id: string; url: string };
    const match = /storage\/v1\/object\/public\/([^/]+)\/(.+)$/.exec(url);
    if (!match) {
      console.warn(`Skipping document with unexpected URL: ${url}`);
      continue;
    }
    const [, bucket, path] = match;

    const { data: file, error: downloadErr } = await supabase.storage
      .from(bucket)
      .download(path);
    if (downloadErr || !file) {
      console.error(`Failed to download ${path}`, downloadErr?.message);
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from('archive')
      .upload(path, buffer, { upsert: true });
    if (uploadErr) {
      console.error(`Failed to upload to archive ${path}`, uploadErr.message);
      continue;
    }

    await supabase.storage.from(bucket).remove([path]);

    const { data: pub } = supabase.storage.from('archive').getPublicUrl(path);
    const { error: updateErr } = await supabase
      .from('job_documents')
      .update({ archived: true, url: pub.publicUrl })
      .eq('id', id);
    if (updateErr) {
      console.error(`Failed to update document ${id}`, updateErr.message);
    } else {
      archivedIds.push(id);
      console.log(`Archived document ${id} -> ${path}`);
    }
  }

  if (archivedIds.length) {
    await supabase.from('audit_log').insert({
      job_id: jobId,
      event: 'documents_archived',
      details: { document_ids: archivedIds },
    });
    console.log(`Archived ${archivedIds.length} documents for job ${jobId}`);
  }
}

archiveDocuments(jobId);
