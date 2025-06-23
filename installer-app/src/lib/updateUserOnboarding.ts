import supabase from "./supabaseClient";

export type OnboardingTask =
  | "installer_started_job"
  | "sales_created_quote"
  | "manager_reviewed_job"
  | "admin_invited_user";

export default async function updateUserOnboarding(
  userId: string,
  task: OnboardingTask,
) {
  if (!userId) return;
  await supabase
    .from("user_onboarding_status")
    .upsert({ user_id: userId, [task]: true }, { onConflict: "user_id" });
}
