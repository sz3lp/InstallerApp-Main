import supabase, { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

export async function getUserRole(userId: string): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/user_roles?select=role&user_id=eq.${userId}`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: session ? `Bearer ${session.access_token}` : undefined,
        Accept: 'application/json',
      },
    }
  );

  if (!res.ok) {
    console.error('Failed to fetch user role', await res.text());
    return null;
  }

  const data = await res.json();
  return data?.[0]?.role ?? null;
}
