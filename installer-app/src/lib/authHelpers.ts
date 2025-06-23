import supabase from "./supabaseClient";

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch user role", error);
    return null;
  }

  return data?.role ?? null;
}
