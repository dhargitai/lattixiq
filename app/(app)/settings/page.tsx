import SettingsPageContent from "@/components/settings/SettingsPageContent";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const provider = user.app_metadata?.provider || "email";

  // Fetch user preferences
  const { data: userData } = await supabase
    .from("users")
    .select("reminder_enabled, reminder_time")
    .eq("id", user.id)
    .single();

  // Fetch subscription info from user_subscriptions table
  const { data: subscriptionData } = await supabase
    .from("user_subscriptions")
    .select("subscription_status, stripe_customer_id, subscription_current_period_end")
    .eq("user_id", user.id)
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
      subscriptionStatus={subscriptionData?.subscription_status || undefined}
      stripeCustomerId={subscriptionData?.stripe_customer_id || undefined}
      subscriptionPeriodEnd={subscriptionData?.subscription_current_period_end || undefined}
      initialPreferences={initialPreferences}
    />
  );
}
