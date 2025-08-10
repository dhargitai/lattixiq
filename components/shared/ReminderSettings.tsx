"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface ReminderSettingsProps {
  enabled: boolean;
  time: string;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  variant?: "default" | "compact";
  className?: string;
  showDescription?: boolean;
}

export const ReminderSettings = React.forwardRef<HTMLDivElement, ReminderSettingsProps>(
  (
    {
      enabled,
      time,
      onEnabledChange,
      onTimeChange,
      disabled = false,
      variant = "default",
      className,
      showDescription = false,
    },
    ref
  ) => {
    const timeOptions = [
      { value: "06:00:00", label: "6:00 AM" },
      { value: "07:00:00", label: "7:00 AM" },
      { value: "08:00:00", label: "8:00 AM" },
      { value: "09:00:00", label: "9:00 AM" },
      { value: "10:00:00", label: "10:00 AM" },
      { value: "11:00:00", label: "11:00 AM" },
      { value: "12:00:00", label: "12:00 PM" },
      { value: "13:00:00", label: "1:00 PM" },
      { value: "14:00:00", label: "2:00 PM" },
      { value: "15:00:00", label: "3:00 PM" },
      { value: "16:00:00", label: "4:00 PM" },
      { value: "17:00:00", label: "5:00 PM" },
      { value: "18:00:00", label: "6:00 PM" },
      { value: "19:00:00", label: "7:00 PM" },
      { value: "20:00:00", label: "8:00 PM" },
    ];

    // Convert time format if needed (handle both HH:MM and HH:MM:SS)
    const normalizedTime = time.includes(":") && time.split(":").length === 2 ? `${time}:00` : time;

    if (variant === "compact") {
      return (
        <div ref={ref} className={cn("space-y-3", className)}>
          <div className="flex items-center justify-between">
            <label
              htmlFor="reminder-toggle-compact"
              className="text-base font-medium text-gray-700 cursor-pointer"
            >
              Daily Reminder
            </label>
            <Switch
              id="reminder-toggle-compact"
              checked={enabled}
              onCheckedChange={onEnabledChange}
              disabled={disabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          {enabled && (
            <div
              className={cn(
                "flex items-center gap-3 transition-all duration-200",
                disabled && "opacity-50"
              )}
            >
              <label
                htmlFor="reminder-time-compact"
                className="text-base font-medium text-gray-700"
              >
                Remind me at:
              </label>
              <select
                id="reminder-time-compact"
                value={normalizedTime}
                onChange={(e) => onTimeChange(e.target.value)}
                disabled={disabled || !enabled}
                className="px-3 py-2 text-base border-2 border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed"
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">REMINDER</h3>
          {showDescription && (
            <p className="text-xs text-gray-500 mt-1">
              These settings apply to all your active plans
            </p>
          )}
        </div>
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="reminder-toggle"
              className="text-base font-medium text-gray-700 cursor-pointer"
            >
              Daily Reminder
            </label>
            <Switch
              id="reminder-toggle"
              checked={enabled}
              onCheckedChange={onEnabledChange}
              disabled={disabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-200",
              !enabled && "opacity-50"
            )}
          >
            <label htmlFor="reminder-time" className="text-base font-medium text-gray-700">
              Remind me at:
            </label>
            <select
              id="reminder-time"
              value={normalizedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={disabled || !enabled}
              className="px-3 py-2 text-base border-2 border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed"
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }
);

ReminderSettings.displayName = "ReminderSettings";
