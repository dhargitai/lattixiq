import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { redirect } from "next/navigation";
import NewRoadmapPage from "../page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/supabase", () => ({
  getUser: vi.fn(),
}));

const mockGetUser = vi.mocked(await import("@/lib/auth/supabase").then((m) => m.getUser));

describe("New Roadmap Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Authentication", () => {
    it("should redirect to login when user is unauthenticated", async () => {
      mockGetUser.mockResolvedValue(null);

      render(await NewRoadmapPage());

      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should not redirect when user is authenticated", async () => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });

      render(await NewRoadmapPage());

      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe("How this works section", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it('should show expanded "How this works" section for new users', async () => {
      render(await NewRoadmapPage());

      const howItWorksSection = screen.getByTestId("how-it-works");
      const content = screen.getByTestId("how-it-works-content");

      expect(howItWorksSection).toBeInTheDocument();
      expect(content).toBeVisible();
      expect(content).not.toHaveClass("hidden");
    });

    it('should show collapsed "How this works" section for returning users', async () => {
      localStorage.setItem("hasCompletedOnboarding", "true");

      render(await NewRoadmapPage());

      const howItWorksSection = screen.getByTestId("how-it-works");
      const content = screen.queryByTestId("how-it-works-content");

      expect(howItWorksSection).toBeInTheDocument();
      expect(content).not.toBeVisible();
    });

    it('should toggle "How this works" section on click', async () => {
      const user = userEvent.setup();
      localStorage.setItem("hasCompletedOnboarding", "true");

      render(await NewRoadmapPage());

      const toggleButton = screen.getByRole("button", { name: /how this works/i });

      await user.click(toggleButton);

      const content = screen.getByTestId("how-it-works-content");
      expect(content).toBeVisible();

      await user.click(toggleButton);

      expect(content).not.toBeVisible();
    });
  });

  describe("Question text adaptation", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it('should show "What is your single biggest challenge right now?" for new users', async () => {
      render(await NewRoadmapPage());

      expect(
        screen.getByText("What is your single biggest challenge right now?")
      ).toBeInTheDocument();
    });

    it('should show "What is your next challenge?" for returning users', async () => {
      localStorage.setItem("hasCompletedOnboarding", "true");

      render(await NewRoadmapPage());

      expect(screen.getByText("What is your next challenge?")).toBeInTheDocument();
    });
  });

  describe("Category buttons", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it('should populate starter text when "Stop Procrastinating" is clicked', async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const button = screen.getByRole("button", { name: /stop procrastinating/i });
      const textarea = screen.getByRole("textbox");

      await user.click(button);

      expect(textarea).toHaveValue("I want to stop procrastinating on...");
    });

    it('should populate starter text when "Think More Clearly" is clicked', async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const button = screen.getByRole("button", { name: /think more clearly/i });
      const textarea = screen.getByRole("textbox");

      await user.click(button);

      expect(textarea).toHaveValue("I want to think more clearly about...");
    });

    it('should populate starter text when "Make Better Decisions" is clicked', async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const button = screen.getByRole("button", { name: /make better decisions/i });
      const textarea = screen.getByRole("textbox");

      await user.click(button);

      expect(textarea).toHaveValue("I want to make better decisions when...");
    });

    it('should populate starter text when "Overcome Biases" is clicked', async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const button = screen.getByRole("button", { name: /overcome biases/i });
      const textarea = screen.getByRole("textbox");

      await user.click(button);

      expect(textarea).toHaveValue("I want to overcome my bias of...");
    });

    it("should clear existing text when category button is clicked", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      const button = screen.getByRole("button", { name: /stop procrastinating/i });

      await user.type(textarea, "Some existing text");
      await user.click(button);

      expect(textarea).toHaveValue("I want to stop procrastinating on...");
    });
  });

  describe("Goal input validation", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it("should show gray hint when input is empty", async () => {
      render(await NewRoadmapPage());

      const hint = screen.getByText("Be specific - this helps us create a better roadmap");
      expect(hint).toHaveClass("text-muted-foreground");
    });

    it("should show red hint when input has less than 20 characters", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Short text");

      const hint = screen.getByText("Add more detail for a better personalized roadmap");
      expect(hint).toHaveClass("text-destructive");
    });

    it("should show green hint when input has 20 or more characters", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "This is a longer text with more than 20 characters");

      const hint = screen.getByText("Great! This will help us build the right roadmap for you");
      expect(hint).toHaveClass("text-green-600");
    });

    it("should disable submit button when input has less than 10 characters", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      const submitButton = screen.getByRole("button", { name: /create my roadmap/i });

      expect(submitButton).toBeDisabled();

      await user.type(textarea, "Short");

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when input has 10 or more characters", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      const submitButton = screen.getByRole("button", { name: /create my roadmap/i });

      await user.type(textarea, "This is enough text");

      expect(submitButton).toBeEnabled();
    });
  });

  describe("Form submission and loading state", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it("should show loading state when form is submitted", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      const submitButton = screen.getByRole("button", { name: /create my roadmap/i });

      await user.type(textarea, "I want to stop procrastinating on my work projects");
      await user.click(submitButton);

      expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
      expect(screen.getByText("Building Your Roadmap!")).toBeInTheDocument();
      expect(screen.getByText("🚀")).toBeInTheDocument();
    });

    it("should save goal to localStorage on submission", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      const submitButton = screen.getByRole("button", { name: /create my roadmap/i });

      const goalText = "I want to stop procrastinating on my work projects";
      await user.type(textarea, goalText);
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("userGoal")).toBe(goalText);
      });
    });

    it("should set hasCompletedOnboarding flag after submission", async () => {
      const user = userEvent.setup();

      render(await NewRoadmapPage());

      const textarea = screen.getByRole("textbox");
      const submitButton = screen.getByRole("button", { name: /create my roadmap/i });

      await user.type(textarea, "I want to stop procrastinating on my work projects");
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("hasCompletedOnboarding")).toBe("true");
      });
    });
  });

  describe("Mobile responsiveness", () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        id: "test-user-id",
        email: "test@example.com",
      });
    });

    it("should render correctly on mobile viewport", async () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(await NewRoadmapPage());

      const container = screen.getByTestId("new-roadmap-container");
      expect(container).toHaveClass("min-h-screen");

      const categoryButtons = screen.getAllByRole("button", {
        name: /stop procrastinating|think more clearly|make better decisions|overcome biases/i,
      });
      categoryButtons.forEach((button) => {
        expect(button).toHaveClass("text-sm");
      });
    });

    it("should render correctly on desktop viewport", async () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;

      render(await NewRoadmapPage());

      const container = screen.getByTestId("new-roadmap-container");
      expect(container).toHaveClass("flex");

      // Check that content is properly centered with max width
      const contentWrapper = container.querySelector(".max-w-\\[640px\\]");
      expect(contentWrapper).toBeInTheDocument();
    });
  });
});
