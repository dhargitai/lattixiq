"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface NotificationPreferences {
  enabled: boolean;
  dailyReminderTime: string;
}

export default function NotificationSettings({
  userId: _userId,
  initialPreferences,
}: {
  userId: string;
  initialPreferences?: NotificationPreferences;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: initialPreferences?.enabled ?? true,
    dailyReminderTime: initialPreferences?.dailyReminderTime ?? "09:00",
  });

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    const time24 = `${hour}:00`;
    const hour12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
    const ampm = i < 12 ? "AM" : "PM";
    const display = `${hour12}:00 ${ampm}`;
    return { value: time24, label: display };
  });

  const handleToggleChange = async (checked: boolean) => {
    setPreferences((prev) => ({ ...prev, enabled: checked }));
    await savePreferences({ ...preferences, enabled: checked });
  };

  const handleTimeChange = async (value: string) => {
    setPreferences((prev) => ({ ...prev, dailyReminderTime: value }));
    await savePreferences({ ...preferences, dailyReminderTime: value });
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: newPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Settings saved", {
        description: "Your notification preferences have been updated.",
      });
    } catch {
      toast.error("Failed to save preferences", {
        description: "Please try again.",
      });
      setPreferences(initialPreferences ?? { enabled: true, dailyReminderTime: "09:00" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mb-9 animate-fadeIn animation-delay-200">
      <h2 className="text-[13px] font-semibold text-[#718096] uppercase tracking-[0.8px] mb-4 pl-1">
        NOTIFICATIONS
      </h2>

      <div className="space-y-3">
        <Card className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200">
          <div className="px-5 py-[18px]">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-[#2D3748]">Daily Reminder</span>
              <div
                onClick={() => !isSaving && handleToggleChange(!preferences.enabled)}
                className={`
                  relative inline-block w-12 h-7 rounded-full cursor-pointer transition-colors duration-300
                  ${preferences.enabled ? "bg-[#48BB78]" : "bg-[#CBD5E0]"}
                  ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md 
                    transition-transform duration-300
                    ${preferences.enabled ? "translate-x-5" : "translate-x-0"}
                  `}
                />
              </div>
            </div>
            <p className="text-sm text-[#718096] italic mt-2">
              Get reminders for your active plans
            </p>
          </div>
        </Card>

        {preferences.enabled && (
          <Card className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#CBD5E0] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 animate-fadeIn">
            <div className="px-5 py-[18px]">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-[#2D3748]">Reminder Time</span>
                <Select
                  value={preferences.dailyReminderTime}
                  onValueChange={handleTimeChange}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-[140px] border-0 bg-transparent hover:bg-[#F7FAFC] focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-[#718096] italic mt-2">
                Choose when to receive your daily reminders
              </p>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
