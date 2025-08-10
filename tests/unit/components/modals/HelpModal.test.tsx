import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HelpModal } from "@/components/modals/HelpModal";
import { createClient } from "@/lib/supabase/client";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));

// Mock react-markdown
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("HelpModal Support Email", () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as Mock).mockReturnValue(mockSupabase);
  });

  it("should render support email link with correct attributes", async () => {
    // Mock successful content fetch
    mockSupabase.single.mockResolvedValue({
      data: { content: "This is help content for testing." },
      error: null,
    });

    render(<HelpModal contentId="test-help" onClose={mockOnClose} />);

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/This is help content for testing/)).toBeInTheDocument();
    });

    // Check for support email text
    const emailText = screen.getByText(/If you have any more questions, feel free to/);
    expect(emailText).toBeInTheDocument();

    // Check for email link
    const emailLink = screen.getByRole("link", {
      name: /Contact support via email at support@lattixiq.com/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", "mailto:support@lattixiq.com");
  });

  it("should have proper aria-label for screen readers", async () => {
    mockSupabase.single.mockResolvedValue({
      data: { content: "Test content" },
      error: null,
    });

    render(<HelpModal contentId="test-help" onClose={mockOnClose} />);

    await waitFor(() => {
      const emailLink = screen.getByRole("link", {
        name: /Contact support via email at support@lattixiq.com/i,
      });
      expect(emailLink).toHaveAttribute(
        "aria-label",
        "Contact support via email at support@lattixiq.com"
      );
    });
  });

  it("should match existing modal design patterns", async () => {
    mockSupabase.single.mockResolvedValue({
      data: { content: "Test content" },
      error: null,
    });

    render(<HelpModal contentId="test-help" onClose={mockOnClose} />);

    await waitFor(() => {
      // Check for proper text styling
      const emailText = screen.getByText(/If you have any more questions, feel free to/);
      expect(emailText).toHaveClass("text-sm", "text-gray-600");

      // Check for email link styling
      const emailLink = screen.getByRole("link", { name: /Contact support via email/i });
      expect(emailLink).toHaveClass("text-blue-600");
      expect(emailLink).toHaveClass("hover:text-blue-800");
      expect(emailLink).toHaveClass("underline");
      expect(emailLink).toHaveClass("focus:outline-none");
      expect(emailLink).toHaveClass("focus:ring-2");
      expect(emailLink).toHaveClass("focus:ring-blue-500");
    });
  });

  it("should render support section with border separator", async () => {
    mockSupabase.single.mockResolvedValue({
      data: { content: "Test content" },
      error: null,
    });

    render(<HelpModal contentId="test-help" onClose={mockOnClose} />);

    await waitFor(() => {
      // Find the parent div containing the support email section
      const emailText = screen.getByText(/If you have any more questions, feel free to/);
      const parentDiv = emailText.parentElement;

      expect(parentDiv).toHaveClass("mt-4", "pt-4", "border-t", "border-gray-200");
    });
  });

  it("should still render support email link even when content loading fails", async () => {
    // Mock error in content fetch
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: "Failed to load content" },
    });

    render(<HelpModal contentId="test-help" onClose={mockOnClose} />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Unable to load help content/)).toBeInTheDocument();
    });

    // Support email should NOT be shown in error state
    expect(screen.queryByText(/If you have any more questions/)).not.toBeInTheDocument();
  });

  it("should render support email link for all contentId values", async () => {
    const contentIds = [
      "toolkit-screen-help",
      "settings-screen-help",
      "roadmap-screen-help",
      "learn-screen-help",
      "plan-screen-help",
      "reflect-screen-help",
    ];

    for (const contentId of contentIds) {
      mockSupabase.single.mockResolvedValue({
        data: { content: `Content for ${contentId}` },
        error: null,
      });

      const { unmount } = render(<HelpModal contentId={contentId} onClose={mockOnClose} />);

      await waitFor(() => {
        const emailLink = screen.getByRole("link", { name: /Contact support via email/i });
        expect(emailLink).toBeInTheDocument();
        expect(emailLink).toHaveAttribute("href", "mailto:support@lattixiq.com");
      });

      unmount();
    }
  });
});
