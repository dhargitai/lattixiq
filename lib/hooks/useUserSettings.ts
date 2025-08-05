"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/supabase/types";
import { getUserTimezone } from "@/lib/notifications/timezone-utils";

export function useUserSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setError("Not authenticated");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (fetchError) throw fetchError;

      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReminderSettings = async (settings: {
    reminder_enabled: boolean;
    reminder_time: string;
  }) => {
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) throw new Error("Not authenticated");

      // Get user's timezone
      const timezone = getUserTimezone();

      // Update via API endpoint
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: settings.reminder_enabled,
          time: settings.reminder_time,
          timezone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      // Update local state
      await fetchUserSettings();
    } catch (err) {
      throw err;
    }
  };

  return {
    user,
    isLoading,
    error,
    updateReminderSettings,
    refetch: fetchUserSettings,
  };
}
