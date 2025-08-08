import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppHeader } from "@/components/ui/AppHeader";

// Mock the HelpModal component
vi.mock("@/components/modals/HelpModal", () => ({
  HelpModal: ({ contentId, onClose }: { contentId: string; onClose: () => void }) => (
    <div data-testid="help-modal" data-content-id={contentId}>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

describe("AppHeader", () => {
  it("renders the screen name", () => {
    render(<AppHeader screenName="Test Screen" />);
    expect(screen.getByText("Test Screen")).toBeInTheDocument();
  });

  it("renders help icon when helpContentId is provided", () => {
    render(<AppHeader screenName="Test Screen" helpContentId="test-help" />);
    const helpButton = screen.getByRole("button", { name: /show help/i });
    expect(helpButton).toBeInTheDocument();
  });

  it("does not render help icon when showHelp is false", () => {
    render(<AppHeader screenName="Test Screen" helpContentId="test-help" showHelp={false} />);
    const helpButton = screen.queryByRole("button", { name: /show help/i });
    expect(helpButton).not.toBeInTheDocument();
  });

  it("does not render help icon when helpContentId is not provided", () => {
    render(<AppHeader screenName="Test Screen" />);
    const helpButton = screen.queryByRole("button", { name: /show help/i });
    expect(helpButton).not.toBeInTheDocument();
  });

  it("opens help modal when help icon is clicked", () => {
    render(<AppHeader screenName="Test Screen" helpContentId="test-help" />);

    // Modal should not be visible initially
    expect(screen.queryByTestId("help-modal")).not.toBeInTheDocument();

    // Click help button
    const helpButton = screen.getByRole("button", { name: /show help/i });
    fireEvent.click(helpButton);

    // Modal should now be visible
    expect(screen.getByTestId("help-modal")).toBeInTheDocument();
    expect(screen.getByTestId("help-modal")).toHaveAttribute("data-content-id", "test-help");
  });

  it("closes help modal when close is triggered", () => {
    render(<AppHeader screenName="Test Screen" helpContentId="test-help" />);

    // Open modal
    const helpButton = screen.getByRole("button", { name: /show help/i });
    fireEvent.click(helpButton);

    // Modal should be visible
    expect(screen.getByTestId("help-modal")).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText("Close Modal");
    fireEvent.click(closeButton);

    // Modal should no longer be visible
    expect(screen.queryByTestId("help-modal")).not.toBeInTheDocument();
  });

  it("applies correct CSS classes for responsive design", () => {
    const { container } = render(<AppHeader screenName="Test Screen" />);
    const header = container.querySelector("header");

    expect(header).toHaveClass("h-16");
    expect(header).toHaveClass("md:h-14");
    expect(header).toHaveClass("border-b");
    expect(header).toHaveClass("bg-background");
    expect(header).toHaveClass("px-4");
    expect(header).toHaveClass("md:px-6");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("items-center");
    expect(header).toHaveClass("justify-between");
  });

  it("truncates long screen names", () => {
    const longScreenName = "This is a very long screen name that should be truncated";
    render(<AppHeader screenName={longScreenName} />);

    const title = screen.getByText(longScreenName);
    expect(title).toHaveClass("truncate");
  });

  it("applies hover styles to help button", () => {
    render(<AppHeader screenName="Test Screen" helpContentId="test-help" />);

    const helpButton = screen.getByRole("button", { name: /show help/i });
    expect(helpButton).toHaveClass("hover:bg-accent");
    expect(helpButton).toHaveClass("hover:text-accent-foreground");
  });
});
