import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StandardCTAButton } from "@/components/ui/StandardCTAButton";
import { ArrowRight } from "lucide-react";

describe("StandardCTAButton", () => {
  it("should render with default props", () => {
    render(<StandardCTAButton>Click me</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
    expect(button).toHaveClass("px-10", "py-6", "text-lg"); // md size by default
  });

  it("should apply primary variant styles by default", () => {
    render(<StandardCTAButton>Primary Button</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gradient-to-r", "from-blue-500", "to-blue-600");
  });

  it("should apply secondary variant styles", () => {
    render(<StandardCTAButton variant="secondary">Secondary Button</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gradient-to-r", "from-green-500", "to-green-600");
  });

  it("should handle different sizes", () => {
    const { rerender } = render(<StandardCTAButton size="sm">Small</StandardCTAButton>);
    expect(screen.getByRole("button")).toHaveClass("px-6", "py-3", "text-sm");

    rerender(<StandardCTAButton size="md">Medium</StandardCTAButton>);
    expect(screen.getByRole("button")).toHaveClass("px-10", "py-6", "text-lg");

    rerender(<StandardCTAButton size="lg">Large</StandardCTAButton>);
    expect(screen.getByRole("button")).toHaveClass("px-12", "py-7", "text-xl");
  });

  it("should apply fullWidth when specified", () => {
    render(<StandardCTAButton fullWidth>Full Width</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("w-full");
  });

  it("should show loading state", () => {
    render(<StandardCTAButton loading>Loading</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toContainHTML("animate-spin");
  });

  it("should handle disabled state", () => {
    render(<StandardCTAButton disabled>Disabled</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
  });

  it("should handle onClick events", () => {
    const handleClick = vi.fn();
    render(<StandardCTAButton onClick={handleClick}>Clickable</StandardCTAButton>);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render icon when provided", () => {
    render(
      <StandardCTAButton icon={<ArrowRight data-testid="arrow-icon" />}>
        With Icon
      </StandardCTAButton>
    );

    expect(screen.getByTestId("arrow-icon")).toBeInTheDocument();
  });

  it("should not render icon when loading", () => {
    render(
      <StandardCTAButton loading icon={<ArrowRight data-testid="arrow-icon" />}>
        Loading with Icon
      </StandardCTAButton>
    );

    expect(screen.queryByTestId("arrow-icon")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toContainHTML("animate-spin");
  });

  it("should accept custom className", () => {
    render(<StandardCTAButton className="custom-class">Custom Styled</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(<StandardCTAButton ref={ref}>Ref Test</StandardCTAButton>);

    expect(ref).toHaveBeenCalled();
  });

  it("should apply common styling classes", () => {
    render(<StandardCTAButton>Common Styles</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "font-semibold",
      "rounded-xl",
      "transition-all",
      "duration-300",
      "shadow-lg",
      "hover:shadow-xl",
      "transform",
      "hover:-translate-y-0.5"
    );
  });

  it("should handle type attribute", () => {
    render(<StandardCTAButton type="submit">Submit</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should handle form attribute", () => {
    render(<StandardCTAButton form="test-form">Form Button</StandardCTAButton>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("form", "test-form");
  });
});
