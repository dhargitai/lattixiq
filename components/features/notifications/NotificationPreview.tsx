"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Smartphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationPreviewProps {
  title?: string;
  body?: string;
  time?: string;
  className?: string;
}

export function NotificationPreview({
  title = "Time to practice your plan",
  body = 'It\'s time to work on your IF-THEN plan for "Mental Model Name"',
  time,
  className,
}: NotificationPreviewProps) {
  const displayTime = time ? formatTime(time) : "9:00 AM";

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-gray-700">Preview:</p>

      {/* Desktop Notification Preview */}
      <div className="hidden sm:block">
        <Card className="max-w-sm bg-white shadow-lg border-gray-200">
          <CardContent className="p-0">
            <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-xs font-medium text-gray-700">LattixIQ</span>
              </div>
              <X className="h-3 w-3 text-gray-400" />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{body}</p>
                  <p className="text-xs text-gray-400 mt-1">{displayTime}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors">
                  Open LattixIQ
                </button>
                <button className="flex-1 text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Notification Preview */}
      <div className="sm:hidden">
        <Card className="bg-black text-white">
          <CardContent className="p-0">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">{displayTime}</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-white rounded-sm" />
                  <div className="w-3 h-3 bg-white rounded-sm opacity-60" />
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs opacity-70">LATTIXIQ</span>
                      <span className="text-xs opacity-50">now</span>
                    </div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs opacity-80 line-clamp-2 mt-0.5">{body}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-gray-800 text-xs py-2 rounded-full">Dismiss</button>
                <button className="flex-1 bg-blue-500 text-xs py-2 rounded-full">Open</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Smartphone className="h-3 w-3" />
        Actual appearance may vary by device
      </p>
    </div>
  );
}

function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
}
