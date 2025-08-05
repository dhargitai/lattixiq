"use client";

import { ReminderSettings } from "@/components/features/settings/ReminderSettings";
import { useUserSettings } from "@/lib/hooks/useUserSettings";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading, error, updateReminderSettings } = useUserSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || "Please sign in to view settings"}</div>
      </div>
    );
  }

  const handleSaveReminders = async (settings: { enabled: boolean; time: string }) => {
    await updateReminderSettings({
      reminder_enabled: settings.enabled,
      reminder_time: settings.time,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <ReminderSettings
        initialEnabled={user.reminder_enabled || false}
        initialTime={user.reminder_time || "09:00"}
        onSave={handleSaveReminders}
      />
    </div>
  );
}
