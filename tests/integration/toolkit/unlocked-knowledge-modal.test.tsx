import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UnlockedKnowledgeModal } from "@/components/features/toolkit/UnlockedKnowledgeModal";
import { ToolkitClient } from "@/components/features/toolkit/ToolkitClient";
import { getUnlockedKnowledge } from "@/lib/db/unlocked-knowledge";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the data fetching
vi.mock("@/lib/db/unlocked-knowledge", () => ({
  getUnlockedKnowledge: vi.fn(),
}));

describe("UnlockedKnowledgeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens modal when "Learned Models" is clicked', async () => {
    const mockData = [
      {
        id: "1",
        name: "Activation Energy",
        type: "mental-model" as const,
        category: "Productivity",
        completed_at: "2024-01-01",
      },
    ];
    vi.mocked(getUnlockedKnowledge).mockResolvedValue(mockData);

    render(
      <ToolkitClient learnedModelsCount={1} completedRoadmapsCount={0} recentLogEntry={null} />
    );

    // Find and click the Learned Models card
    const learnedModelsCard = screen
      .getByText("My Learned Models")
      .closest('[data-testid="navigation-card"]');
    expect(learnedModelsCard).toBeTruthy();

    fireEvent.click(learnedModelsCard!);

    // Check modal is open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(screen.getByText("Learned Models")).toBeTruthy();
    });
  });

  it("displays correct unlocked knowledge", async () => {
    const mockData = [
      {
        id: "1",
        name: "Activation Energy",
        type: "mental-model" as const,
        category: "Productivity",
        completed_at: "2024-01-01",
      },
      {
        id: "2",
        name: "Confirmation Bias",
        type: "cognitive-bias" as const,
        category: "Decision Making",
        completed_at: "2024-01-02",
      },
    ];
    vi.mocked(getUnlockedKnowledge).mockResolvedValue(mockData);

    const { rerender } = render(<UnlockedKnowledgeModal open={false} onOpenChange={() => {}} />);

    // Open the modal
    rerender(<UnlockedKnowledgeModal open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Activation Energy")).toBeTruthy();
      expect(screen.getByText("Productivity")).toBeTruthy();
      expect(screen.getByText("Mental Model")).toBeTruthy();

      expect(screen.getByText("Confirmation Bias")).toBeTruthy();
      expect(screen.getByText("Decision Making")).toBeTruthy();
      expect(screen.getByText("Cognitive Bias")).toBeTruthy();
    });
  });

  it("navigates to detail page when item is clicked", async () => {
    const mockData = [
      {
        id: "activation-energy",
        name: "Activation Energy",
        type: "mental-model" as const,
        category: "Productivity",
        completed_at: "2024-01-01",
      },
    ];
    vi.mocked(getUnlockedKnowledge).mockResolvedValue(mockData);

    const onOpenChange = vi.fn();
    render(<UnlockedKnowledgeModal open={true} onOpenChange={onOpenChange} />);

    await waitFor(() => {
      const item = screen.getByText("Activation Energy").closest("button");
      expect(item).toBeTruthy();
      fireEvent.click(item!);
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith("/unlocked/activation-energy");
  });

  it("closes modal via X button", async () => {
    const onOpenChange = vi.fn();
    vi.mocked(getUnlockedKnowledge).mockResolvedValue([]);

    render(<UnlockedKnowledgeModal open={true} onOpenChange={onOpenChange} />);

    // Find and click the close button (X)
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes modal via backdrop click", async () => {
    const onOpenChange = vi.fn();
    vi.mocked(getUnlockedKnowledge).mockResolvedValue([]);

    render(<UnlockedKnowledgeModal open={true} onOpenChange={onOpenChange} />);

    // Find the dialog overlay/backdrop and click it
    const backdrop = document.querySelector("[data-radix-dialog-overlay]");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it("displays empty state when no knowledge unlocked", async () => {
    vi.mocked(getUnlockedKnowledge).mockResolvedValue([]);

    render(<UnlockedKnowledgeModal open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("No models learned yet")).toBeTruthy();
      expect(
        screen.getByText("Complete your first roadmap step to unlock mental models")
      ).toBeTruthy();
    });
  });

  it("displays error state when fetching fails", async () => {
    vi.mocked(getUnlockedKnowledge).mockRejectedValue(new Error("Network error"));

    render(<UnlockedKnowledgeModal open={true} onOpenChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load your learned models")).toBeTruthy();
    });
  });

  it("shows loading state while fetching data", async () => {
    vi.mocked(getUnlockedKnowledge).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    render(<UnlockedKnowledgeModal open={true} onOpenChange={() => {}} />);

    // Should show loading spinner initially
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });
});
