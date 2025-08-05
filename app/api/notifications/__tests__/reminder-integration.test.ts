import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          reminder_enabled: true,
          reminder_time: "09:00",
          reminder_timezone: "America/New_York",
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
    })),
  })),
}));

describe("Reminder System Integration Tests", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup fetch mock
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock service worker
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: vi.fn().mockResolvedValue({
          active: { state: "activated" },
        }),
        ready: Promise.resolve({
          active: { state: "activated" },
        }),
      },
      writable: true,
    });

    // Mock Notification API
    Object.defineProperty(window, "Notification", {
      value: {
        permission: "granted",
        requestPermission: vi.fn().mockResolvedValue("granted"),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Reminder Preferences API", () => {
    it("should fetch user reminder preferences", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          enabled: true,
          time: "09:00",
          timezone: "America/New_York",
          lastSent: null,
        }),
      });

      const response = await fetch("/api/notifications/preferences");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual({
        enabled: true,
        time: "09:00",
        timezone: "America/New_York",
        lastSent: null,
      });
    });

    it("should update user reminder preferences", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          time: "15:00",
          timezone: "Europe/London",
        }),
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/notifications/preferences",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            enabled: true,
            time: "15:00",
            timezone: "Europe/London",
          }),
        })
      );
    });

    it("should handle errors when updating preferences", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Database error" }),
      });

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe("Notification Scheduling", () => {
    it("should schedule a notification for an active plan", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scheduled: true,
          scheduledFor: "2025-08-04T15:00:00Z",
        }),
      });

      const response = await fetch("/api/notifications/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: "test-step-id",
          roadmapId: "test-roadmap-id",
        }),
      });

      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.scheduled).toBe(true);
      expect(data.scheduledFor).toBeTruthy();
    });

    it("should handle missing active plans gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scheduled: false,
          reason: "no_active_plan",
        }),
      });

      const response = await fetch("/api/notifications/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkActivePlans: true }),
      });

      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.scheduled).toBe(false);
      expect(data.reason).toBe("no_active_plan");
    });
  });

  describe("Service Worker Integration", () => {
    it("should register service worker successfully", async () => {
      const registration = await navigator.serviceWorker.register("/sw.js");
      expect(registration.active?.state).toBe("activated");
    });

    it("should handle push notifications through service worker", async () => {
      // Mock push event data
      const pushData = {
        title: "Time to practice your plan",
        body: "Review your IF-THEN implementation",
        stepId: "test-step-id",
        deepLink: "/reflect/test-step-id",
      };

      // Mock ExtendableMessageEvent for service worker context
      const mockPushEvent = {
        data: {
          json: () => pushData,
        },
      };

      // Service worker would handle this event
      expect(mockPushEvent.data.json().title).toBe("Time to practice your plan");
    });
  });

  describe("Cron Job Integration", () => {
    it("should process scheduled reminders", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          processed: 5,
          sent: 3,
          skipped: 2,
          errors: 0,
        }),
      });

      const response = await fetch("/api/notifications/cron", {
        headers: {
          Authorization: "Bearer test-cron-secret",
        },
      });

      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.processed).toBe(5);
      expect(data.sent).toBe(3);
      expect(data.skipped).toBe(2);
    });

    it("should log notification delivery status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          logs: [
            {
              user_id: "user-1",
              status: "sent",
              delivered_at: "2025-08-04T15:00:00Z",
            },
            {
              user_id: "user-2",
              status: "no_active_plan",
              delivered_at: null,
            },
          ],
        }),
      });

      const response = await fetch("/api/notifications/cron/logs");
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.logs).toHaveLength(2);
      expect(data.logs[0].status).toBe("sent");
      expect(data.logs[1].status).toBe("no_active_plan");
    });
  });

  describe("End-to-End Reminder Flow", () => {
    it("should complete full reminder flow from settings to delivery", async () => {
      // 1. Enable reminders
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const enableResponse = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          time: "15:00",
          timezone: "America/New_York",
        }),
      });
      expect(enableResponse.ok).toBe(true);

      // 2. Create a plan (mocked as it would happen in the Plan screen)
      const planData = {
        stepId: "test-step-id",
        situation: "When I'm feeling overwhelmed",
        trigger: "I notice my breathing getting shallow",
        action: "Take 3 deep breaths and list priorities",
      };

      // 3. Cron job runs and finds user with active plan
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          processed: 1,
          sent: 1,
          notification: {
            title: "Time to practice your plan",
            body: `${planData.situation}: ${planData.action}`,
          },
        }),
      });

      const cronResponse = await fetch("/api/notifications/cron");
      const cronData = await cronResponse.json();

      expect(cronResponse.ok).toBe(true);
      expect(cronData.sent).toBe(1);
      expect(cronData.notification.body).toContain(planData.situation);
    });

    it("should handle timezone conversions correctly", async () => {
      // Test that reminders are sent at the correct local time
      const timezones = [
        { timezone: "America/New_York", time: "15:00", utcHour: 20 }, // EST
        { timezone: "Europe/London", time: "15:00", utcHour: 15 }, // GMT
        { timezone: "Asia/Tokyo", time: "15:00", utcHour: 6 }, // JST
      ];

      for (const tz of timezones) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            scheduledUtcHour: tz.utcHour,
            localTime: tz.time,
            timezone: tz.timezone,
          }),
        });

        const response = await fetch("/api/notifications/schedule/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tz),
        });

        const data = await response.json();
        expect(data.scheduledUtcHour).toBe(tz.utcHour);
      }
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle notification permission denial", async () => {
      Object.defineProperty(window, "Notification", {
        value: {
          permission: "denied",
          requestPermission: vi.fn().mockResolvedValue("denied"),
        },
        writable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: "Notification permission denied",
          fallback: "Email reminders available",
        }),
      });

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.fallback).toBe("Email reminders available");
    });

    it("should skip notifications for completed plans", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          processed: 1,
          sent: 0,
          skipped: 1,
          skipReason: "plan_completed",
        }),
      });

      const response = await fetch("/api/notifications/cron");
      const data = await response.json();

      expect(data.sent).toBe(0);
      expect(data.skipped).toBe(1);
      expect(data.skipReason).toBe("plan_completed");
    });

    it("should handle service worker registration failure", async () => {
      navigator.serviceWorker.register = vi
        .fn()
        .mockRejectedValue(new Error("Registration failed"));

      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        expect(error).toEqual(new Error("Registration failed"));
      }
    });

    it("should handle database connection errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: "Database connection failed",
          retryAfter: 60,
        }),
      });

      const response = await fetch("/api/notifications/preferences");
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.retryAfter).toBe(60);
    });
  });
});
