import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

global.fetch = vi.fn();

describe("NotificationSettings", () => {
  const mockUserId = "test-user-123";
  const defaultPreferences = {
    enabled: true,
    dailyReminderTime: "09:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders notification toggle and displays initial state", () => {
    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    expect(screen.getByText("Daily Reminder")).toBeInTheDocument();
    expect(screen.getByText("Get reminders for your active plans")).toBeInTheDocument();

    const toggleElement = screen.getByText("Daily Reminder").closest("div")?.parentElement;
    expect(toggleElement).toBeInTheDocument();
  });

  it("shows time selector when notifications are enabled", () => {
    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    expect(screen.getByText("Reminder Time")).toBeInTheDocument();
    expect(screen.getByText("Choose when to receive your daily reminders")).toBeInTheDocument();
    expect(screen.getByText("9:00 AM")).toBeInTheDocument();
  });

  it("hides time selector when notifications are disabled", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={{ enabled: false, dailyReminderTime: "09:00" }}
      />
    );

    expect(screen.queryByText("Reminder Time")).not.toBeInTheDocument();
  });

  it("toggles notification state and saves preferences", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        preferences: { enabled: false, dailyReminderTime: "09:00" },
      }),
    });

    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    const toggleContainer = screen
      .getByText("Daily Reminder")
      .closest("div")
      ?.parentElement?.querySelector("div[class*='relative']") as HTMLElement;

    fireEvent.click(toggleContainer);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: {
            enabled: false,
            dailyReminderTime: "09:00",
          },
        }),
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Settings saved", {
      description: "Your notification preferences have been updated.",
    });

    expect(screen.queryByText("Reminder Time")).not.toBeInTheDocument();
  });

  it("changes reminder time and saves preferences", async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        preferences: { enabled: true, dailyReminderTime: "14:00" },
      }),
    });

    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    const selectTrigger = screen.getByText("9:00 AM");
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const option = screen.getByText("2:00 PM");
      fireEvent.click(option);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: {
            enabled: true,
            dailyReminderTime: "14:00",
          },
        }),
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Settings saved", {
      description: "Your notification preferences have been updated.",
    });
  });

  it("handles save errors gracefully", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Network error"));

    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    const toggleContainer = screen
      .getByText("Daily Reminder")
      .closest("div")
      ?.parentElement?.querySelector("div[class*='relative']") as HTMLElement;

    fireEvent.click(toggleContainer);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to save preferences", {
        description: "Please try again.",
      });
    });
  });

  it("disables interactions while saving", async () => {
    let resolveFetch: any;
    (fetch as any).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    const toggleContainer = screen
      .getByText("Daily Reminder")
      .closest("div")
      ?.parentElement?.querySelector("div[class*='relative']") as HTMLElement;

    fireEvent.click(toggleContainer);

    expect(toggleContainer).toHaveClass("opacity-50", "cursor-not-allowed");

    resolveFetch({
      ok: true,
      json: async () => ({
        success: true,
        preferences: { enabled: false, dailyReminderTime: "09:00" },
      }),
    });

    await waitFor(() => {
      expect(toggleContainer).not.toHaveClass("opacity-50", "cursor-not-allowed");
    });
  });

  it("restores original preferences on error", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Network error"));

    render(<NotificationSettings userId={mockUserId} initialPreferences={defaultPreferences} />);

    const toggleContainer = screen
      .getByText("Daily Reminder")
      .closest("div")
      ?.parentElement?.querySelector("div[class*='relative']") as HTMLElement;

    expect(screen.getByText("Reminder Time")).toBeInTheDocument();

    fireEvent.click(toggleContainer);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    expect(screen.getByText("Reminder Time")).toBeInTheDocument();
  });
});
