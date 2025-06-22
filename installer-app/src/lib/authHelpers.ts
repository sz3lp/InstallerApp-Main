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
        Authorization: session ? `Bearer ${session.access_token}` : undefined,import supabase from "./supabaseClient";

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch user role", error);
    return null;
  }

  return data?.role ?? null;
}

     
