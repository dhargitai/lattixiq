/**
 * Notification permission management utilities
 */

export type NotificationPermissionState = "granted" | "denied" | "default" | "unsupported";

export interface PermissionCheckResult {
  state: NotificationPermissionState;
  canRequestPermission: boolean;
  message?: string;
}

/**
 * Check if notifications are supported in the current browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

/**
 * Get current notification permission state
 */
export function getPermissionState(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  return Notification.permission as NotificationPermissionState;
}

/**
 * Check permission status and determine if we can request
 */
export function checkPermissionStatus(): PermissionCheckResult {
  if (!isNotificationSupported()) {
    return {
      state: "unsupported",
      canRequestPermission: false,
      message: "Your browser doesn't support notifications",
    };
  }

  const state = getPermissionState();

  switch (state) {
    case "granted":
      return {
        state,
        canRequestPermission: false,
        message: "Notifications are enabled",
      };

    case "denied":
      return {
        state,
        canRequestPermission: false,
        message: "Please enable notifications in your browser settings to receive reminders",
      };

    case "default":
      return {
        state,
        canRequestPermission: true,
        message: "Allow notifications to receive daily reminders",
      };

    default:
      return {
        state: "unsupported",
        canRequestPermission: false,
        message: "Notification status unknown",
      };
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error("Notifications are not supported in this browser");
  }

  if (Notification.permission === "denied") {
    throw new Error(
      "Notifications have been blocked. Please enable them in your browser settings."
    );
  }

  try {
    const permission = await Notification.requestPermission();

    // Register service worker after permission is granted
    if (permission === "granted" && isServiceWorkerSupported()) {
      await registerServiceWorker();
    }

    return permission;
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    throw error;
  }
}

/**
 * Register the service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.warn("Service workers are not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service worker registered successfully");
    return registration;
  } catch (error) {
    console.error("Service worker registration failed:", error);
    throw error;
  }
}

/**
 * Check if push notifications are supported and available
 */
export async function checkPushSupport(): Promise<boolean> {
  if (!isServiceWorkerSupported() || !isNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return "pushManager" in registration;
  } catch {
    return false;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isServiceWorkerSupported()) {
    throw new Error("Service workers are not supported");
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (!("pushManager" in registration)) {
      throw new Error("Push notifications are not supported");
    }

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    // Subscribe with VAPID public key (you'll need to generate this)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
    });

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    throw error;
  }
}

/**
 * Show a test notification
 */
export async function showTestNotification(): Promise<void> {
  const permission = await checkPermissionStatus();

  if (permission.state !== "granted") {
    throw new Error("Notification permission not granted");
  }

  const notification = new Notification("LattixIQ Test Notification", {
    body: "Great! You'll receive reminders at your chosen time.",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "test-notification",
  });

  // Auto-close after 4 seconds
  setTimeout(() => notification.close(), 4000);
}

/**
 * Check if the page is running in a secure context (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

/**
 * Get helpful error message for common issues
 */
export function getPermissionErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("blocked")) {
    return "Notifications are blocked. Please check your browser settings and allow notifications for this site.";
  }

  if (errorMessage.includes("not supported")) {
    return "Your browser doesn't support notifications. Please try a different browser.";
  }

  if (!isSecureContext()) {
    return "Notifications require a secure connection (HTTPS). They won't work on HTTP sites.";
  }

  return "Failed to enable notifications. Please try again.";
}
