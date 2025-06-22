export default async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const { default: supabase } = await import('./supabaseClient');
    const filePath = `${userId}.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl ?? null;
  } catch (err) {
    console.error('Failed to upload avatar', err);
    return null;
  }
}
