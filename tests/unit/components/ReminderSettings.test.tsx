import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReminderSettings } from "@/components/shared/ReminderSettings";

describe("ReminderSettings", () => {
  const defaultProps = {
    enabled: false,
    time: "09:00:00",
    onEnabledChange: vi.fn(),
    onTimeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Happy Path
  describe("Happy Path", () => {
    it("should render without descriptive text by default", () => {
      render(<ReminderSettings {...defaultProps} />);

      // Test that "These settings apply..." text is not present
      expect(
        screen.queryByText(/These settings apply to all your active plans/i)
      ).not.toBeInTheDocument();
    });

    it("should show descriptive text when showDescription is true", () => {
      render(<ReminderSettings {...defaultProps} showDescription={true} />);

      // Test that text is present when explicitly enabled
      expect(
        screen.getByText(/These settings apply to all your active plans/i)
      ).toBeInTheDocument();
    });

    it("should save settings correctly", () => {
      const onEnabledChange = vi.fn();
      const onTimeChange = vi.fn();

      render(
        <ReminderSettings
          {...defaultProps}
          onEnabledChange={onEnabledChange}
          onTimeChange={onTimeChange}
        />
      );

      // Toggle the reminder switch
      const toggleSwitch = screen.getByRole("switch", { name: /daily reminder/i });
      fireEvent.click(toggleSwitch);

      expect(onEnabledChange).toHaveBeenCalledWith(true);
    });

    it("should update time correctly", () => {
      const onTimeChange = vi.fn();

      render(<ReminderSettings {...defaultProps} enabled={true} onTimeChange={onTimeChange} />);

      // Change the time selector
      const timeSelector = screen.getByLabelText(/remind me at/i);
      fireEvent.change(timeSelector, { target: { value: "14:00:00" } });

      expect(onTimeChange).toHaveBeenCalledWith("14:00:00");
    });

    it("should display correct labels and headers", () => {
      render(<ReminderSettings {...defaultProps} />);

      // Check that essential labels are present
      expect(screen.getByText("REMINDER")).toBeInTheDocument();
      expect(screen.getByLabelText(/daily reminder/i)).toBeInTheDocument();
    });
  });

  // Unhappy Path
  describe("Unhappy Path", () => {
    it("should handle disabled state correctly", () => {
      render(<ReminderSettings {...defaultProps} disabled={true} />);

      const toggleSwitch = screen.getByRole("switch", { name: /daily reminder/i });
      expect(toggleSwitch).toBeDisabled();
    });

    it("should disable time selector when reminder is disabled", () => {
      render(<ReminderSettings {...defaultProps} enabled={false} />);

      const timeSelector = screen.getByLabelText(/remind me at/i);
      expect(timeSelector).toBeDisabled();
    });

    it("should enable time selector when reminder is enabled", () => {
      render(<ReminderSettings {...defaultProps} enabled={true} />);

      const timeSelector = screen.getByLabelText(/remind me at/i);
      expect(timeSelector).not.toBeDisabled();
    });
  });

  // Responsive Layout
  describe("Responsive Layout", () => {
    it("should maintain layout on all screen sizes", () => {
      const { container } = render(<ReminderSettings {...defaultProps} />);

      // Test that main container has proper spacing classes
      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("space-y-4");
    });

    it("should render compact variant correctly", () => {
      render(<ReminderSettings {...defaultProps} variant="compact" />);

      // Compact variant should not have the REMINDER header
      expect(screen.queryByText("REMINDER")).not.toBeInTheDocument();

      // But should still have the Daily Reminder label
      expect(screen.getByLabelText(/daily reminder/i)).toBeInTheDocument();
    });

    it("should apply custom className when provided", () => {
      const { container } = render(
        <ReminderSettings {...defaultProps} className="custom-test-class" />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("custom-test-class");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("should handle time format conversion correctly", () => {
      render(<ReminderSettings {...defaultProps} time="09:00" />);

      const timeSelector = screen.getByLabelText(/remind me at/i);
      expect(timeSelector).toHaveValue("09:00:00");
    });

    it("should not call callbacks when disabled", () => {
      const onEnabledChange = vi.fn();

      render(
        <ReminderSettings {...defaultProps} disabled={true} onEnabledChange={onEnabledChange} />
      );

      const toggleSwitch = screen.getByRole("switch", { name: /daily reminder/i });
      fireEvent.click(toggleSwitch);

      // Should not trigger callback when disabled
      expect(onEnabledChange).not.toHaveBeenCalled();
    });

    it("should display all time options", () => {
      render(<ReminderSettings {...defaultProps} enabled={true} />);

      const timeSelector = screen.getByLabelText(/remind me at/i);
      const options = timeSelector.querySelectorAll("option");

      // Should have 15 time options (6 AM to 8 PM)
      expect(options).toHaveLength(15);
      expect(options[0]).toHaveTextContent("6:00 AM");
      expect(options[14]).toHaveTextContent("8:00 PM");
    });
  });
});
