export default async function uploadSignature(jobId: string, file: File): Promise<string | null> {
  try {
    const { default: supabase } = await import('./supabaseClient');
    const filePath = `signature_${jobId}_${Date.now()}.png`;
    const { error } = await supabase.storage
      .from('signatures')
      .upload(filePath, file, { contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from('signatures').getPublicUrl(filePath);
    return data.publicUrl ?? null;
  } catch (err) {
    console.error('Failed to upload signature', err);
    return null;
  }
}
