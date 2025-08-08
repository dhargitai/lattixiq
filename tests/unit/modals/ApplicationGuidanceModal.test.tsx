import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationGuidanceModal } from "@/components/modals/ApplicationGuidanceModal";

describe("ApplicationGuidanceModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    conceptType: "mental-model" as const,
    conceptName: "Activation Energy",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct title", () => {
    render(<ApplicationGuidanceModal {...defaultProps} />);
    expect(screen.getByText("Time to Apply What You've Learned! 🎯")).toBeInTheDocument();
  });

  it("displays concept name when provided", () => {
    render(<ApplicationGuidanceModal {...defaultProps} />);
    expect(screen.getByText(/Activation Energy/)).toBeInTheDocument();
  });

  it("displays generic message when concept name is not provided", () => {
    render(<ApplicationGuidanceModal {...defaultProps} conceptName={undefined} />);
    expect(
      screen.getByText(/Go offline and work on applying this mental model in real life/)
    ).toBeInTheDocument();
  });

  it("displays correct concept type for mental model", () => {
    render(<ApplicationGuidanceModal {...defaultProps} />);
    expect(screen.getByText(/Activation Energy/)).toBeInTheDocument();
  });

  it("displays correct concept type for bias", () => {
    render(
      <ApplicationGuidanceModal
        {...defaultProps}
        conceptType="cognitive-bias"
        conceptName={undefined}
      />
    );
    expect(screen.getByText(/cognitive bias/)).toBeInTheDocument();
  });

  it("displays correct concept type for fallacy", () => {
    render(
      <ApplicationGuidanceModal {...defaultProps} conceptType="fallacy" conceptName={undefined} />
    );
    expect(screen.getByText(/logical fallacy/)).toBeInTheDocument();
  });

  it("calls onClose when 'Got it!' button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ApplicationGuidanceModal {...defaultProps} onClose={onClose} />);

    const button = screen.getByRole("button", { name: /Got it!/i });
    await user.click(button);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(<ApplicationGuidanceModal {...defaultProps} isOpen={false} />);

    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<ApplicationGuidanceModal {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const description = screen.getByText(/Great plan! Now it's time to put it into action/);
    expect(description).toHaveAttribute("id", "application-guidance-description");
  });

  it("displays the full guidance message", () => {
    render(<ApplicationGuidanceModal {...defaultProps} />);

    expect(screen.getByText(/Great plan! Now it's time to put it into action/)).toBeInTheDocument();
    expect(
      screen.getByText(/Come back when you have some experience to reflect on/)
    ).toBeInTheDocument();
  });
});
