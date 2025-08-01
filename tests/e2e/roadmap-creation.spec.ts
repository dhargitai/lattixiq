import { test, expect } from "@playwright/test";

test.describe("Roadmap Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting a session cookie
    // In a real app, you'd use proper authentication setup
    await page.context().addCookies([
      {
        name: "sb-localhost-auth-token",
        value: "mock-auth-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // Navigate to the new roadmap page
    await page.goto("/new-roadmap");
  });

  test("should display the new roadmap form correctly", async ({ page }) => {
    // Check main heading
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "What is your single biggest challenge right now?"
    );

    // Check category buttons are visible
    await expect(page.getByRole("button", { name: "Stop Procrastinating" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Think More Clearly" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Make Better Decisions" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Overcome Biases" })).toBeVisible();

    // Check textarea is visible
    await expect(page.getByRole("textbox")).toBeVisible();

    // Check submit button is disabled initially
    await expect(page.getByRole("button", { name: "Create My Roadmap" })).toBeDisabled();
  });

  test("should populate starter text when category button is clicked", async ({ page }) => {
    const textarea = page.getByRole("textbox");

    // Click "Stop Procrastinating" button
    await page.getByRole("button", { name: "Stop Procrastinating" }).click();

    // Check textarea value
    await expect(textarea).toHaveValue("I want to stop procrastinating on...");
  });

  test("should enable submit button when goal has enough characters", async ({ page }) => {
    const textarea = page.getByRole("textbox");
    const submitButton = page.getByRole("button", { name: "Create My Roadmap" });

    // Type a short goal (less than 10 characters)
    await textarea.fill("Short");
    await expect(submitButton).toBeDisabled();

    // Type a longer goal (10+ characters)
    await textarea.fill("I want to stop procrastinating on my important work projects");
    await expect(submitButton).toBeEnabled();
  });

  test("should show validation hints based on input length", async ({ page }) => {
    const textarea = page.getByRole("textbox");

    // Empty input - gray hint
    await expect(
      page.getByText("Be specific - this helps us create a better roadmap")
    ).toBeVisible();

    // Short input - red hint
    await textarea.fill("Short text");
    await expect(page.getByText("Add more detail for a better personalized roadmap")).toBeVisible();

    // Long input - green hint
    await textarea.fill(
      "I want to stop procrastinating on my important work projects and develop better habits"
    );
    await expect(
      page.getByText("Great! This will help us build the right roadmap for you")
    ).toBeVisible();
  });

  test("should successfully create a roadmap", async ({ page }) => {
    // Intercept the API call
    await page.route("**/api/roadmaps", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          roadmapId: "test-roadmap-id",
          goalDescription: "I want to stop procrastinating on my important work projects",
          steps: [
            {
              knowledgeContentId: "test-content-1",
              order: 1,
              title: "First Principles Thinking",
            },
            {
              knowledgeContentId: "test-content-2",
              order: 2,
              title: "Parkinson's Law",
            },
          ],
        }),
      });
    });

    // Fill the form
    await page
      .getByRole("textbox")
      .fill("I want to stop procrastinating on my important work projects");

    // Submit the form
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Check loading state appears
    await expect(page.getByTestId("loading-overlay")).toBeVisible();
    await expect(page.getByText("Building Your Roadmap!")).toBeVisible();

    // Wait for navigation to roadmap page
    await page.waitForURL("/roadmap");
    expect(page.url()).toContain("/roadmap");
  });

  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API error
    await page.route("**/api/roadmaps", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "You already have an active roadmap. Please complete or archive it first.",
        }),
      });
    });

    // Fill and submit the form
    await page
      .getByRole("textbox")
      .fill("I want to stop procrastinating on my important work projects");
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Check loading state appears and disappears
    await expect(page.getByTestId("loading-overlay")).toBeVisible();
    await expect(page.getByTestId("loading-overlay")).not.toBeVisible();

    // Check error message is displayed
    await expect(
      page.getByText("You already have an active roadmap. Please complete or archive it first.")
    ).toBeVisible();

    // Ensure we're still on the same page
    expect(page.url()).toContain("/new-roadmap");
  });

  test("should handle network errors", async ({ page }) => {
    // Mock network error
    await page.route("**/api/roadmaps", async (route) => {
      await route.abort("failed");
    });

    // Fill and submit the form
    await page
      .getByRole("textbox")
      .fill("I want to stop procrastinating on my important work projects");
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Check error message is displayed
    await expect(page.getByText(/unexpected error occurred|Failed to fetch/i)).toBeVisible();
  });

  test("should save goal to localStorage on successful submission", async ({ page }) => {
    // Mock successful API response
    await page.route("**/api/roadmaps", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          roadmapId: "test-roadmap-id",
          steps: [],
        }),
      });
    });

    const goalText = "I want to stop procrastinating on my important work projects";

    // Fill and submit the form
    await page.getByRole("textbox").fill(goalText);
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Wait for navigation
    await page.waitForURL("/roadmap");

    // Check localStorage
    const userGoal = await page.evaluate(() => localStorage.getItem("userGoal"));
    expect(userGoal).toBe(goalText);

    const hasCompletedOnboarding = await page.evaluate(() =>
      localStorage.getItem("hasCompletedOnboarding")
    );
    expect(hasCompletedOnboarding).toBe("true");
  });

  test("should show different heading for returning users", async ({ page }) => {
    // Set localStorage to indicate returning user
    await page.evaluate(() => {
      localStorage.setItem("hasCompletedOnboarding", "true");
    });

    // Reload the page
    await page.reload();

    // Check heading text
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "What is your next challenge?"
    );
  });
});
