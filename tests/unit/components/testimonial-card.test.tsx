import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TestimonialCard } from "@/components/features/testimonial/TestimonialCard";

// Mock next/script
vi.mock("next/script", () => ({
  __esModule: true,
  default: ({ children, onLoad }: { children?: React.ReactNode; onLoad?: () => void }) => {
    // Simulate script loading
    if (onLoad) {
      setTimeout(() => onLoad(), 0);
    }
    return children || null;
  },
}));

describe("TestimonialCard", () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear();
  });

  it("should render with first-completion trigger text", () => {
    render(<TestimonialCard trigger="first-completion" onDismiss={mockOnDismiss} />);

    expect(
      screen.getByText("Congratulations on finishing your first roadmap!")
    ).toBeInTheDocument();
    expect(screen.getByText(/That's a huge achievement/)).toBeInTheDocument();
  });

  it("should render with sustained-success trigger text", () => {
    render(<TestimonialCard trigger="sustained-success" onDismiss={mockOnDismiss} />);

    expect(
      screen.getByText("Wow, you've completed several roadmaps with great results!")
    ).toBeInTheDocument();
    expect(screen.getByText(/We're so glad you're finding this valuable/)).toBeInTheDocument();
  });

  it("should display important instructions about using same email", () => {
    render(<TestimonialCard trigger="first-completion" onDismiss={mockOnDismiss} />);

    expect(screen.getByText(/Please use the same email address/)).toBeInTheDocument();
    expect(screen.getByText(/This is a one-time offer/)).toBeInTheDocument();
  });

  it("should embed Senja iframe with correct attributes", () => {
    render(<TestimonialCard trigger="first-completion" onDismiss={mockOnDismiss} />);

    const iframe = screen.getByTitle("Senja testimonial form");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://senja.io/p/lattixiq/r/eOsaq7?mode=embed&nostyle=true"
    );
    expect(iframe).toHaveAttribute("allow", "camera;microphone");
    expect(iframe).toHaveAttribute("width", "100%");
  });

  it("should call onDismiss when close button is clicked", () => {
    render(<TestimonialCard trigger="first-completion" onDismiss={mockOnDismiss} />);

    const closeButton = screen.getByLabelText("Dismiss testimonial prompt");
    fireEvent.click(closeButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("should have correct styling for serene minimalist aesthetic", () => {
    const { container } = render(
      <TestimonialCard trigger="first-completion" onDismiss={mockOnDismiss} />
    );

    const card = container.querySelector(".animate-slideIn");
    expect(card).toBeInTheDocument();
    expect(card).toHaveStyle({
      background: "linear-gradient(135deg, #EBF4FF 0%, #E6F7FF 100%)",
      borderRadius: "16px",
    });
  });

  it("should handle iframe resize messages", async () => {
    render(<TestimonialCard trigger="first-completion" onDismiss={mockOnDismiss} />);

    const iframe = screen.getByTitle("Senja testimonial form");

    // Simulate a resize message from iframe
    const resizeEvent = new MessageEvent("message", {
      data: {
        type: "resize",
        iframe: "senja-collector-iframe",
        height: 800,
      },
    });

    window.dispatchEvent(resizeEvent);

    // Wait for the state update to occur
    await new Promise((resolve) => setTimeout(resolve, 10));

    // The iframe height should be updated
    expect(iframe.getAttribute("height")).toBe("800");
  });
});
