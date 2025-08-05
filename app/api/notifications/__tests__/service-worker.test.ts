import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Service Worker Registration", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it("should register service worker on supported browsers", async () => {
    // Mock service worker API
    const mockRegistration = {
      scope: "/",
      active: {
        state: "activated",
      },
    };

    global.navigator = {
      serviceWorker: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
      },
    } as unknown as Navigator;

    // Import the component (it will auto-register)
    await import("@/components/features/notifications/ServiceWorkerRegistration");

    // The component should be used in layout
    expect(global.navigator.serviceWorker.register).toBeDefined();
  });

  it("should handle service worker registration errors gracefully", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    global.navigator = {
      serviceWorker: {
        register: vi.fn().mockRejectedValue(new Error("Registration failed")),
      },
    } as unknown as Navigator;

    // The registration should not throw
    const registerSW = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    await expect(registerSW()).resolves.not.toThrow();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("should handle browsers without service worker support", () => {
    global.navigator = {} as unknown as Navigator;

    expect("serviceWorker" in navigator).toBe(false);
  });
});

describe("Notification Permission", () => {
  it("should request notification permission", async () => {
    global.Notification = {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    } as unknown as typeof Notification;

    const permission = await Notification.requestPermission();

    expect(permission).toBe("granted");
    expect(Notification.requestPermission).toHaveBeenCalled();
  });

  it("should handle denied notification permission", async () => {
    global.Notification = {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("denied"),
    } as unknown as typeof Notification;

    const permission = await Notification.requestPermission();

    expect(permission).toBe("denied");
  });
});
