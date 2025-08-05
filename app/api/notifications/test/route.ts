import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if service worker is supported
    const serviceWorkerSupported = typeof window !== "undefined" && "serviceWorker" in navigator;

    // Check notification support
    const notificationSupported = typeof window !== "undefined" && "Notification" in window;

    // Get notification permission status
    const permissionStatus = notificationSupported
      ? typeof Notification !== "undefined"
        ? Notification.permission
        : "unsupported"
      : "unsupported";

    return NextResponse.json({
      serviceWorker: {
        supported: serviceWorkerSupported,
        registration: null, // Can't check from server-side
      },
      notifications: {
        supported: notificationSupported,
        permission: permissionStatus,
      },
      testResults: {
        message: "Basic notification support check completed",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to test notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // This endpoint can be used to trigger a test notification
    // from the client-side after service worker is registered

    return NextResponse.json({
      message: "Test notification request received",
      instructions: "Call this endpoint from client-side with service worker registered",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process test notification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
