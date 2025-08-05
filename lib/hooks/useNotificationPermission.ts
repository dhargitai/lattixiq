"use client";

import { useState, useEffect, useCallback } from "react";

type PermissionState = "granted" | "denied" | "default" | "unsupported";

interface UseNotificationPermissionReturn {
  permissionState: PermissionState;
  canRequestPermission: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  showTest: () => Promise<void>;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check initial permission state
  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionState("unsupported");
    } else {
      setPermissionState(Notification.permission as PermissionState);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      setError("Notifications are not supported in this browser");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      setError("Notifications are blocked. Please enable them in your browser settings.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PermissionState);

      if (permission === "granted") {
        return true;
      } else if (permission === "denied") {
        setError("Notification permission was denied.");
        return false;
      } else {
        setError("Notification permission was not granted. Please try again.");
        return false;
      }
    } catch {
      setError("Failed to request notification permission");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showTest = useCallback(async (): Promise<void> => {
    if (!("Notification" in window)) {
      throw new Error("Notifications not supported");
    }

    if (Notification.permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    try {
      // Try to show notification via service worker first
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title: "Reminder settings saved!",
          body: "You'll receive daily reminders at your chosen time.",
          tag: "settings-test",
        });
      } else {
        // Fallback to direct notification
        const notification = new Notification("Reminder settings saved!", {
          body: "You'll receive daily reminders at your chosen time.",
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: "settings-test",
        });

        setTimeout(() => notification.close(), 3000);
      }
    } catch {
      // Silently fail for test notifications
      console.error("Failed to show test notification");
    }
  }, []);

  const canRequestPermission =
    permissionState !== "unsupported" &&
    permissionState !== "denied" &&
    permissionState !== "granted";

  return {
    permissionState,
    canRequestPermission,
    isLoading,
    error,
    requestPermission,
    showTest,
  };
}
