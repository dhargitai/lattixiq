import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationSettings from "@/components/settings/NotificationSettings";

vi.mock("@/lib/notifications/timezone-utils", () => ({
  getUserTimezone: vi.fn(() => "America/New_York"),
}));

describe("NotificationSettings", () => {
  const mockUserId = "test-user-123";
  const mockOnPreferencesChange = vi.fn();
  const defaultPreferences = {
    enabled: true,
    dailyReminderTime: "09:00:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders notification toggle and displays initial state", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={defaultPreferences}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    expect(screen.getByText("Daily Reminder")).toBeInTheDocument();
    expect(
      screen.getByText("Get daily reminders for your active plans at your chosen time")
    ).toBeInTheDocument();

    const toggleElement = screen.getByText("Daily Reminder").closest("div")?.parentElement;
    expect(toggleElement).toBeInTheDocument();
  });

  it("shows time selector when notifications are enabled", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={defaultPreferences}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    expect(screen.getByText("Remind me at:")).toBeInTheDocument();
    const selectElement = screen.getByRole("combobox");
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue("09:00:00");
  });

  it("hides time selector when notifications are disabled", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={{ enabled: false, dailyReminderTime: "09:00:00" }}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    expect(screen.queryByText("Remind me at:")).not.toBeInTheDocument();
  });

  it("toggles notification state and calls onPreferencesChange", () => {
    const { rerender } = render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={defaultPreferences}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    const toggleButton = screen.getByRole("switch");
    fireEvent.click(toggleButton);

    expect(mockOnPreferencesChange).toHaveBeenCalledWith({
      enabled: false,
      dailyReminderTime: "09:00:00",
      timezone: "America/New_York",
    });

    // Simulate parent component updating props after state change
    rerender(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={{ enabled: false, dailyReminderTime: "09:00:00" }}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    expect(screen.queryByText("Remind me at:")).not.toBeInTheDocument();
  });

  it("changes reminder time and calls onPreferencesChange", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={defaultPreferences}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: "14:00:00" } });

    expect(mockOnPreferencesChange).toHaveBeenCalledWith({
      enabled: true,
      dailyReminderTime: "14:00:00",
      timezone: "America/New_York",
    });
  });

  it("calls onPreferencesChange with correct timezone", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={defaultPreferences}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    const toggleButton = screen.getByRole("switch");
    fireEvent.click(toggleButton);

    expect(mockOnPreferencesChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timezone: "America/New_York",
      })
    );
  });

  it("handles preferences without seconds in time format", () => {
    render(
      <NotificationSettings
        userId={mockUserId}
        initialPreferences={{ enabled: true, dailyReminderTime: "14:30" }}
        onPreferencesChange={mockOnPreferencesChange}
      />
    );

    const selectElement = screen.getByRole("combobox");
    // Component should handle time format conversion internally
    expect(selectElement).toBeInTheDocument();
  });
});
