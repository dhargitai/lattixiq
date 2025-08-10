"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { NotificationPreview } from "@/components/features/notifications/NotificationPreview";
import { useNotificationPermission } from "@/lib/hooks/useNotificationPermission";

interface ReminderSettingsProps {
  initialEnabled?: boolean;
  initialTime?: string;
  onSave?: (settings: { enabled: boolean; time: string }) => Promise<void>;
}

export function ReminderSettings({
  initialEnabled = false,
  initialTime = "09:00",
  onSave,
}: ReminderSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [time, setTime] = useState(initialTime);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    permissionState,
    isLoading: isRequestingPermission,
    error: permissionError,
    requestPermission,
    showTest,
  } = useNotificationPermission();

  // Track changes
  useEffect(() => {
    setHasChanges(enabled !== initialEnabled || time !== initialTime);
  }, [enabled, time, initialEnabled, initialTime]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSave = async () => {
    if (enabled && permissionState !== "granted") {
      const granted = await requestPermission();
      if (!granted) {
        setMessage({
          type: "error",
          text: permissionError || "Please allow notifications to enable reminders",
        });
        return;
      }
    }

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave({ enabled, time });
        setMessage({ type: "success", text: "Reminder settings saved" });
        setHasChanges(false);

        // Show test notification if enabled
        if (enabled && permissionState === "granted") {
          try {
            await showTest();
          } catch {
            // Ignore test notification errors
          }
        }
      } catch {
        setMessage({ type: "error", text: "Failed to save reminder settings" });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (checked && permissionState === "denied") {
      setMessage({ type: "error", text: "Please enable notifications in your browser settings" });
      return;
    }

    if (checked && permissionState === "default") {
      const granted = await requestPermission();
      if (!granted) {
        setMessage({
          type: "error",
          text: permissionError || "Notification permission is required for reminders",
        });
        return;
      }
    }

    setEnabled(checked);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Reminders</CardTitle>
        <CardDescription>Get reminded to practice your plans at your chosen time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reminder-toggle" className="text-base font-medium">
                Enable daily reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                You&apos;ll receive a notification when you have active plans to practice
              </p>
            </div>
            <Switch
              id="reminder-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={permissionState === "unsupported" || isRequestingPermission}
            />
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-32"
                />
                <p className="text-sm text-muted-foreground">Time shown in your local timezone</p>
              </div>

              <NotificationPreview
                title="Time to practice your plan"
                body="Work on your implementation plan to build better habits"
                time={time}
              />
            </>
          )}

          {permissionState === "denied" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="font-medium">Notifications are blocked</p>
                <p>To enable reminders, you need to allow notifications:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click the lock/info icon in your browser&apos;s address bar</li>
                  <li>Find &quot;Notifications&quot; in the site settings</li>
                  <li>Change it from &quot;Block&quot; to &quot;Allow&quot;</li>
                  <li>Refresh this page and try again</li>
                </ol>
                <p className="text-sm">
                  <span className="font-medium">Alternative:</span> Email reminders will be
                  available soon.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {permissionState === "unsupported" && (
            <Alert>
              <AlertDescription>
                Your browser doesn&apos;t support notifications. Try using a modern browser like
                Chrome, Firefox, or Safari.
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className={message.type === "error" ? "border-destructive" : "border-green-500"}>
              {message.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>

        {hasChanges && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
