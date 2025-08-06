import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TestimonialPrompt } from "@/components/features/toolkit/TestimonialPrompt";

// Mock the SenjaWidget component
vi.mock("@/components/features/toolkit/SenjaWidget", () => ({
  SenjaWidget: ({ onSuccess }: { onSuccess: (url?: string) => void }) => (
    <div data-testid="senja-widget">
      <button onClick={() => onSuccess("https://senja.io/test")}>Submit Testimonial</button>
    </div>
  ),
}));

describe("TestimonialPrompt", () => {
  const mockOnDismiss = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders first roadmap completion content", () => {
    render(
      <TestimonialPrompt
        testimonialState="not_asked"
        triggerType="first_roadmap"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    expect(
      screen.getByText("Congratulations on finishing your first roadmap!")
    ).toBeInTheDocument();
    expect(screen.getByText("🎉")).toBeInTheDocument();
  });

  it("renders sustained success content", () => {
    render(
      <TestimonialPrompt
        testimonialState="asked_first"
        triggerType="sustained_success"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    expect(
      screen.getByText("Wow, you've completed several roadmaps with great results!")
    ).toBeInTheDocument();
    expect(screen.getByText("🌟")).toBeInTheDocument();
  });

  it("does not render if already dismissed", () => {
    const { container } = render(
      <TestimonialPrompt
        testimonialState="dismissed_first"
        triggerType="first_roadmap"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("does not render if already submitted", () => {
    const { container } = render(
      <TestimonialPrompt
        testimonialState="submitted"
        triggerType="first_roadmap"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("calls onDismiss when close button is clicked", async () => {
    render(
      <TestimonialPrompt
        testimonialState="not_asked"
        triggerType="first_roadmap"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    const closeButton = screen.getByLabelText("Dismiss");
    fireEvent.click(closeButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders Senja widget", () => {
    render(
      <TestimonialPrompt
        testimonialState="not_asked"
        triggerType="first_roadmap"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByTestId("senja-widget")).toBeInTheDocument();
  });

  it("calls onSubmit when testimonial is submitted through widget", () => {
    render(
      <TestimonialPrompt
        testimonialState="not_asked"
        triggerType="first_roadmap"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText("Submit Testimonial");
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith("https://senja.io/test");
  });

  it("does not render for sustained success if not yet asked first", () => {
    const { container } = render(
      <TestimonialPrompt
        testimonialState="not_asked"
        triggerType="sustained_success"
        onDismiss={mockOnDismiss}
        onSubmit={mockOnSubmit}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
