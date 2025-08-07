import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AppLayout from "@/app/(app)/layout";

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the keyboard visibility hook
vi.mock("@/lib/hooks/useKeyboardVisibility", () => ({
  useKeyboardVisibility: vi.fn(() => false),
}));

describe("Navigation Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/toolkit");
  });

  it("renders navigation on toolkit page", () => {
    render(
      <AppLayout>
        <div>Toolkit Content</div>
      </AppLayout>
    );

    expect(screen.getByText("My Toolkit")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("hides navigation on learn page", () => {
    mockPathname.mockReturnValue("/learn/123");

    render(
      <AppLayout>
        <div>Learn Content</div>
      </AppLayout>
    );

    expect(screen.queryByText("My Toolkit")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("hides navigation on plan page", () => {
    mockPathname.mockReturnValue("/plan/123");

    render(
      <AppLayout>
        <div>Plan Content</div>
      </AppLayout>
    );

    expect(screen.queryByText("My Toolkit")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("hides navigation on reflect page", () => {
    mockPathname.mockReturnValue("/reflect/123");

    render(
      <AppLayout>
        <div>Reflect Content</div>
      </AppLayout>
    );

    expect(screen.queryByText("My Toolkit")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("hides navigation on new-roadmap page", () => {
    mockPathname.mockReturnValue("/new-roadmap");

    render(
      <AppLayout>
        <div>New Roadmap Content</div>
      </AppLayout>
    );

    expect(screen.queryByText("My Toolkit")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("applies padding when navigation is visible", () => {
    mockPathname.mockReturnValue("/toolkit");

    const { container } = render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    const main = container.querySelector("main");
    expect(main).toHaveClass("pb-20");
  });

  it("does not apply padding when navigation is hidden", () => {
    mockPathname.mockReturnValue("/learn/123");

    const { container } = render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    const main = container.querySelector("main");
    expect(main).not.toHaveClass("pb-20");
  });

  it("navigation links are clickable", async () => {
    mockPathname.mockReturnValue("/toolkit");

    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>
    );

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/settings");

    // Verify link structure
    expect(settingsLink).toBeInTheDocument();
  });

  it("shows active state for current route", () => {
    mockPathname.mockReturnValue("/settings");

    const { container } = render(
      <AppLayout>
        <div>Settings Content</div>
      </AppLayout>
    );

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveClass("text-primary");

    // Check for active indicator
    const activeIndicator = container.querySelector(".bg-primary");
    expect(activeIndicator).toBeInTheDocument();
  });

  it("maintains navigation across route changes", () => {
    // Start on toolkit page
    mockPathname.mockReturnValue("/toolkit");

    const { rerender } = render(
      <AppLayout>
        <div>Toolkit Content</div>
      </AppLayout>
    );

    expect(screen.getByText("My Toolkit")).toBeInTheDocument();

    // Navigate to settings
    mockPathname.mockReturnValue("/settings");

    rerender(
      <AppLayout>
        <div>Settings Content</div>
      </AppLayout>
    );

    expect(screen.getByText("My Toolkit")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
});
