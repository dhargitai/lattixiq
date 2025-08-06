import { Card } from "@/components/ui/card";
import BottomNav from "@/components/features/shared/BottomNav";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { getUserInfo } from "@/lib/db/users";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";

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

  // Fetch notification preferences
  const { data: userData } = await supabase
    .from("users")
    .select("reminder_enabled, reminder_time")
    .eq("id", user.id)
    .single();

  const initialPreferences = {
    enabled: userData?.reminder_enabled ?? true,
    dailyReminderTime: userData?.reminder_time ?? "09:00",
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white py-4 px-5 border-b border-[#E1E4E8] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h1 className="text-xl font-semibold text-[#1A202C] text-center tracking-[-0.5px]">
          Settings
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-6 pb-20 max-w-[600px] mx-auto w-full">
        {/* Account Section */}
        <section className="mb-9 animate-fadeIn">
          <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
            ACCOUNT
          </h2>

          {/* Email */}
          <Card className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200">
            <div className="px-5 flex justify-between items-center">
              <span className="text-base font-medium text-[#2D3748]">Email</span>
              <span className="text-[15px] text-[#4A5568] break-words">
                {user.email}
                {provider === "google" ? " (Google)" : ""}
              </span>
            </div>
          </Card>
        </section>

        {/* Billing Section */}
        <section className="mb-9 animate-fadeIn animation-delay-100">
          <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
            BILLING
          </h2>

          <Card className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200">
            <div className="px-5 flex justify-between items-center cursor-pointer hover:bg-[#F7FAFC] transition-colors duration-200">
              <span className="text-base font-medium text-[#2D3748]">Plan</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-2xl text-sm font-semibold ${
                    userInfo?.subscription_status === "premium"
                      ? "bg-gradient-to-r from-[#F6E05E] to-[#ECC94B] text-[#744210]"
                      : "bg-[#F7FAFC] text-[#4A5568]"
                  }`}
                >
                  {userInfo?.subscription_status === "premium" ? "Premium" : "Free Tier"}
                </span>
                <span className="text-base text-[#CBD5E0] transition-transform duration-200 group-hover:translate-x-0.5">
                  ›
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Notifications Section */}
        <NotificationSettings
          userId={user.id}
          initialPreferences={initialPreferences as { enabled: boolean; dailyReminderTime: string }}
        />

        {/* Logout Button */}
        <div className="mt-12 mb-8 flex justify-center animate-fadeIn animation-delay-300">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="bg-white text-[#E53E3E] border-2 border-[#E53E3E] px-8 py-3.5 text-base font-semibold rounded-[10px] transition-all duration-300 hover:bg-[#E53E3E] hover:text-white hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(229,62,62,0.25)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(229,62,62,0.25)]"
            >
              Logout
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toaster position="bottom-center" />
    </div>
  );
}
