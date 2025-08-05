"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface TestResult {
  serviceWorker: {
    supported: boolean;
    registered: boolean;
    ready: boolean;
  };
  notifications: {
    supported: boolean;
    permission: NotificationPermission | "unsupported";
  };
}

export function NotificationTest() {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Run initial support check
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const result: TestResult = {
      serviceWorker: {
        supported: "serviceWorker" in navigator,
        registered: false,
        ready: false,
      },
      notifications: {
        supported: "Notification" in window,
        permission: "Notification" in window ? Notification.permission : "unsupported",
      },
    };

    if (result.serviceWorker.supported) {
      const registration = await navigator.serviceWorker.getRegistration();
      result.serviceWorker.registered = !!registration;
      result.serviceWorker.ready = !!navigator.serviceWorker.controller;
    }

    setTestResult(result);
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setError("Notifications not supported in this browser");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      await checkSupport(); // Refresh status

      if (permission === "granted") {
        // Show a test notification
        showTestNotification();
      } else if (permission === "denied") {
        setError(
          "Notification permission was denied. To enable reminders, please allow notifications in your browser settings."
        );
      } else {
        // permission === "default" - user dismissed the prompt
        setError(
          "Notification permission request was dismissed. Please try again when you're ready to enable reminders."
        );
      }
    } catch {
      setError("Failed to request permission");
    }
  };

  const showTestNotification = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      setError("Notification permission not granted");
      return;
    }

    try {
      const notification = new Notification("LattixIQ Test Notification", {
        body: "Your reminders are working! This is what they'll look like.",
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: "test-notification",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    } catch {
      // Fallback to service worker notification
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "TEST_NOTIFICATION",
          title: "LattixIQ Test Notification",
          body: "Your reminders are working! This is what they'll look like.",
        });
      } else {
        setError("No active service worker to show notification");
      }
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check current status
      await checkSupport();

      // 2. Test API endpoint
      const response = await fetch("/api/notifications/test");
      const apiTest = await response.json();
      console.log("API test result:", apiTest);

      // 3. Request permission if needed
      if (Notification.permission === "default") {
        await requestPermission();
      }

      // 4. Show test notification if permitted
      if (Notification.permission === "granted") {
        showTestNotification();
      }

      setIsLoading(false);
    } catch {
      setError("Test failed");
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System Test
        </CardTitle>
        <CardDescription>
          Test service worker registration and notification capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {testResult?.notifications.permission === "denied" && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Notifications Blocked</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p>You&apos;ve blocked notifications for this site. To enable reminders:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click the lock icon in your browser&apos;s address bar</li>
                <li>Find &quot;Notifications&quot; in the site settings</li>
                <li>Change it from &quot;Block&quot; to &quot;Allow&quot;</li>
                <li>Refresh this page and try again</li>
              </ol>
              <p className="text-sm mt-2">
                Alternatively, you can enable email reminders in your account settings.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {testResult && (
          <div className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Service Worker Status</h3>
              <div className="space-y-1 text-sm">
                <StatusItem label="Browser Support" status={testResult.serviceWorker.supported} />
                <StatusItem label="Registration" status={testResult.serviceWorker.registered} />
                <StatusItem label="Active Controller" status={testResult.serviceWorker.ready} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Notification Status</h3>
              <div className="space-y-1 text-sm">
                <StatusItem label="Browser Support" status={testResult.notifications.supported} />
                <StatusItem
                  label="Permission"
                  status={testResult.notifications.permission === "granted"}
                  text={testResult.notifications.permission}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={runFullTest} disabled={isLoading} variant="default">
            {isLoading ? "Testing..." : "Run Full Test"}
          </Button>

          {testResult?.notifications.permission === "default" && (
            <Button onClick={requestPermission} variant="outline">
              Request Permission
            </Button>
          )}

          {testResult?.notifications.permission === "granted" && (
            <Button onClick={showTestNotification} variant="outline">
              Show Test Notification
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, status, text }: { label: string; status: boolean; text?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}:</span>
      <div className="flex items-center gap-2">
        {text && <span className="text-muted-foreground">{text}</span>}
        {status ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
}
