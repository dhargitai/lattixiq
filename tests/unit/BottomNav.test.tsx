import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/features/shared/BottomNav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

// Mock the keyboard visibility hook
vi.mock("@/lib/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: vi.fn(() => false),
}));

import { usePathname } from "next/navigation";
import { useKeyboardVisibility } from "@/lib/hooks/useKeyboardVisibility";

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation items", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<BottomNav />);

    expect(screen.getByText("My Toolkit")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("highlights active route for toolkit", () => {
    vi.mocked(usePathname).mockReturnValue("/toolkit");
    const { container } = render(<BottomNav />);

    const toolkitLink = screen.getByRole("link", { name: /my toolkit/i });
    expect(toolkitLink).toHaveClass("text-primary");

    // Check for active indicator
    const activeIndicator = container.querySelector(".bg-primary");
    expect(activeIndicator).toBeInTheDocument();
  });

  it("highlights active route for settings", () => {
    vi.mocked(usePathname).mockReturnValue("/settings");
    const { container } = render(<BottomNav />);

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveClass("text-primary");

    // Check for active indicator
    const activeIndicator = container.querySelector(".bg-primary");
    expect(activeIndicator).toBeInTheDocument();
  });

  it("detects nested routes as active", () => {
    vi.mocked(usePathname).mockReturnValue("/toolkit/roadmaps");
    const { container } = render(<BottomNav />);

    const toolkitLink = screen.getByRole("link", { name: /my toolkit/i });
    expect(toolkitLink).toHaveClass("text-primary");

    // Should still show active indicator for nested routes
    const activeIndicator = container.querySelector(".bg-primary");
    expect(activeIndicator).toBeInTheDocument();
  });

  it("hides navigation when keyboard is visible", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    vi.mocked(useKeyboardVisibility).mockReturnValue(true);

    const { container } = render(<BottomNav />);
    const nav = container.querySelector("nav");

    expect(nav).toHaveClass("translate-y-full");
    expect(nav).toHaveAttribute("aria-hidden", "true");
  });

  it("shows navigation when keyboard is not visible", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    vi.mocked(useKeyboardVisibility).mockReturnValue(false);

    const { container } = render(<BottomNav />);
    const nav = container.querySelector("nav");

    expect(nav).not.toHaveClass("translate-y-full");
    expect(nav).toHaveAttribute("aria-hidden", "false");
  });

  it("applies custom className when provided", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const { container } = render(<BottomNav className="custom-class" />);
    const nav = container.querySelector("nav");

    expect(nav).toHaveClass("custom-class");
  });

  it("includes safe area padding", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const { container } = render(<BottomNav />);
    const nav = container.querySelector("nav");

    expect(nav).toHaveClass("safe-area-bottom");
  });

  it("has proper z-index for layering", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const { container } = render(<BottomNav />);
    const nav = container.querySelector("nav");

    expect(nav).toHaveClass("z-50");
  });

  it("links have correct href attributes", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<BottomNav />);

    const toolkitLink = screen.getByRole("link", { name: /my toolkit/i });
    const settingsLink = screen.getByRole("link", { name: /settings/i });

    expect(toolkitLink).toHaveAttribute("href", "/toolkit");
    expect(settingsLink).toHaveAttribute("href", "/settings");
  });
});
