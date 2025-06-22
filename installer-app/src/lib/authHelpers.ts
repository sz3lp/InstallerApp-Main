import supabase from "./supabaseClient";

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch user role", error);
    return null;
  }

  return data?.role ?? null;
}
