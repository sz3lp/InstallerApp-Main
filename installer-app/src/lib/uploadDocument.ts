import supabase from './supabaseClient';

export interface UploadDocumentOptions {
  jobId?: string;
  serviceCallId?: string;
  file: File;
  type: 'before_photo' | 'after_photo' | 'job_jacket' | 'contract' | 'completion_cert' | 'installer_note' | 'other';
  uploaderId: string;
  fileName?: string;
}

/**
 * Upload a document to Supabase storage and record metadata in job_documents.
 * @param options UploadDocumentOptions describing the file and related ids
 * @returns Public URL string to the uploaded file
 */
export default async function uploadDocument(
  options: UploadDocumentOptions,
): Promise<string> {
  const { jobId, serviceCallId, file, type, uploaderId, fileName } = options;
  if (!jobId && !serviceCallId) {
    throw new Error('Either jobId or serviceCallId must be provided');
  }

  const id = jobId ?? serviceCallId as string;
  const uniqueName = fileName
    ? `${crypto.randomUUID()}-${fileName}`
    : `${crypto.randomUUID()}-${file.name}`;
  const path = `job-documents/${id}/${uniqueName}`;

  try {
    const { error: uploadErr } = await supabase.storage
      .from('job-documents')
      .upload(path, file, { upsert: true });
    if (uploadErr) throw new Error(uploadErr.message);

    const { data: urlData, error: urlErr } = supabase.storage
      .from('job-documents')
      .getPublicUrl(path);
    if (urlErr) throw new Error(urlErr.message);
    const publicUrl = urlData.publicUrl;

    const { error: insertErr } = await supabase.from('job_documents').insert({
      id: crypto.randomUUID(),
      job_id: jobId ?? null,
      service_call_id: serviceCallId ?? null,
      uploader_id: uploaderId,
      uploaded_at: new Date().toISOString(),
      name: uniqueName,
      type,
      url: publicUrl,
    });
    if (insertErr) throw new Error(insertErr.message);

    return publicUrl;
  } catch (err: any) {
    console.error('Failed to upload document', err);
    throw err;
  }
}

