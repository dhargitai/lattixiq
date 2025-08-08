"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NotificationSettings from "@/components/settings/NotificationSettings";
import BillingSection from "@/components/settings/BillingSection";
import LogoutButton from "@/components/settings/LogoutButton";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/components/features/shared/BottomNav";
import { AppHeader } from "@/components/ui/AppHeader";

interface SettingsPageContentProps {
  userId: string;
  userEmail: string;
  provider: string;
  subscriptionStatus?: string;
  stripeCustomerId?: string;
  subscriptionPeriodEnd?: string;
  initialPreferences: {
    enabled: boolean;
    dailyReminderTime: string;
  };
}

export default function SettingsPageContent({
  userId,
  userEmail,
  provider,
  subscriptionStatus,
  stripeCustomerId,
  subscriptionPeriodEnd,
  initialPreferences,
}: SettingsPageContentProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);

  const handlePreferencesChange = (newPreferences: {
    enabled: boolean;
    dailyReminderTime: string;
    timezone?: string;
  }) => {
    setPreferences({
      enabled: newPreferences.enabled,
      dailyReminderTime: newPreferences.dailyReminderTime,
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: {
            ...preferences,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Settings saved", {
        description: "Your preferences have been updated successfully.",
      });
      setIsDirty(false);
    } catch {
      toast.error("Failed to save settings", {
        description: "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <AppHeader screenName="Settings" helpContentId="settings-screen-help" />

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
                {userEmail}
                {provider === "google" ? " (Google)" : ""}
              </span>
            </div>
          </Card>
        </section>

        {/* Billing Section */}
        <BillingSection
          subscriptionStatus={subscriptionStatus}
          stripeCustomerId={stripeCustomerId}
          subscriptionPeriodEnd={subscriptionPeriodEnd}
        />

        {/* Notifications Section */}
        <NotificationSettings
          userId={userId}
          initialPreferences={preferences}
          onPreferencesChange={handlePreferencesChange}
        />

        {/* Action Buttons */}
        <div className="mt-12 mb-8 space-y-4 animate-fadeIn animation-delay-300">
          {/* Save Button */}
          {isDirty && (
            <div className="flex justify-center">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3.5 text-base font-semibold rounded-[10px] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(59,130,246,0.35)] active:translate-y-0 active:shadow-[0_2px_6px_rgba(59,130,246,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          )}

          {/* Logout Button */}
          <div className="flex justify-center">
            <LogoutButton />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toaster position="bottom-center" />
    </div>
  );
}
