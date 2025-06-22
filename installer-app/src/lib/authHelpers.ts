export async function getUserRole(userId: string): Promise<string | null> {
  const { default: supabase } = await import('./supabaseClient');
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  return data?.role ?? null;
}
