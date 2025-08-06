import SettingsPageContent from "@/components/settings/SettingsPageContent";
import { getUserInfo } from "@/lib/db/users";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userInfo = await getUserInfo(user.id);
  const provider = user.app_metadata?.provider || "email";

  // Fetch user preferences and billing info
  const { data: userData } = await supabase
    .from("users")
    .select("reminder_enabled, reminder_time, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const initialPreferences = {
    enabled: userData?.reminder_enabled ?? true,
    dailyReminderTime: userData?.reminder_time ?? "09:00",
  };

  return (
    <SettingsPageContent
      userId={user.id}
      userEmail={user.email || ""}
      provider={provider}
      subscriptionStatus={userInfo?.subscription_status || undefined}
      stripeCustomerId={userData?.stripe_customer_id || undefined}
      initialPreferences={initialPreferences}
    />
  );
}
