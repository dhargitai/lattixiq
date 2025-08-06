"use client";

import { ReminderSettings } from "@/components/shared/ReminderSettings";
import { getUserTimezone } from "@/lib/notifications/timezone-utils";

interface NotificationPreferences {
  enabled: boolean;
  dailyReminderTime: string;
  timezone?: string;
}

interface NotificationSettingsProps {
  userId: string;
  initialPreferences?: NotificationPreferences;
  onPreferencesChange: (preferences: NotificationPreferences) => void;
}

export default function NotificationSettings({
  userId: _userId,
  initialPreferences,
  onPreferencesChange,
}: NotificationSettingsProps) {
  // Convert time format for the component (strip seconds if present)
  const timeForComponent = initialPreferences?.dailyReminderTime?.includes(":")
    ? initialPreferences.dailyReminderTime.split(":").slice(0, 2).join(":")
    : "09:00";

  const handleEnabledChange = (enabled: boolean) => {
    onPreferencesChange({
      enabled,
      dailyReminderTime: initialPreferences?.dailyReminderTime ?? "09:00:00",
      timezone: getUserTimezone(),
    });
  };

  const handleTimeChange = (time: string) => {
    onPreferencesChange({
      enabled: initialPreferences?.enabled ?? true,
      dailyReminderTime: time,
      timezone: getUserTimezone(),
    });
  };

  return (
    <section className="mb-9 animate-fadeIn animation-delay-200">
      <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
        NOTIFICATIONS
      </h2>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200">
        <div className="px-5 py-[18px]">
          <ReminderSettings
            enabled={initialPreferences?.enabled ?? true}
            time={timeForComponent}
            onEnabledChange={handleEnabledChange}
            onTimeChange={handleTimeChange}
            variant="compact"
            showDescription={false}
          />
          <p className="text-sm text-[#718096] italic mt-3">
            Get daily reminders for your active plans at your chosen time
          </p>
        </div>
      </div>
    </section>
  );
}
