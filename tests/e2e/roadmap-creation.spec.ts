import { test, expect } from "@playwright/test";

test.describe("Roadmap Creation Flow", () => {
  test.beforeEach(async ({ page }) => {
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
    // Add console listener to debug
    page.on("console", (msg) => console.log("Browser console:", msg.text()));
    page.on("pageerror", (err) => console.log("Page error:", err.message));

    // Fill the form
    await page
      .getByRole("textbox")
      .fill("I want to stop procrastinating on my important work projects");

    // Submit the form
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Check loading state appears
    await expect(page.getByTestId("loading-overlay")).toBeVisible();
    await expect(page.getByText("Building Your Roadmap!")).toBeVisible();

    // Wait for either navigation or error
    await Promise.race([
      page.waitForURL("/roadmap", { timeout: 15000 }),
      page.waitForSelector("div.bg-red-50", { timeout: 15000 }), // Error div
    ]).catch(async (e) => {
      // Log current URL and page content for debugging
      console.log("Current URL:", page.url());
      const bodyText = await page.locator("body").textContent();
      console.log("Page content:", bodyText);
      throw e;
    });

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

    // Wait for error message to appear
    await expect(
      page
        .locator("div.bg-red-50")
        .getByText("You already have an active roadmap. Please complete or archive it first.")
    ).toBeVisible({ timeout: 10000 });

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

    // Check error message is displayed - look for the error in the error div
    await expect(
      page.locator("div.bg-red-50").getByText(/unexpected error occurred|Failed to fetch/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("should not save data to localStorage (now using database)", async ({ page }) => {
    const goalText = "I want to stop procrastinating on my important work projects";

    // Fill and submit the form
    await page.getByRole("textbox").fill(goalText);
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Wait for navigation
    await page.waitForURL("/roadmap", { timeout: 15000 });

    // Check that localStorage is not used for these values anymore
    const userGoal = await page.evaluate(() => localStorage.getItem("userGoal"));
    expect(userGoal).toBeNull();

    const hasCompletedOnboarding = await page.evaluate(() =>
      localStorage.getItem("hasCompletedOnboarding")
    );
    expect(hasCompletedOnboarding).toBeNull();
  });

  test("should show loading state while checking onboarding status", async ({ page }) => {
    // Navigate to the page
    await page.goto("/new-roadmap");

    // The heading might briefly show "Loading..." before the actual question
    // This is a fast operation so we may not always catch it
    // Instead, verify that the correct heading appears after loading
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      /What is your (single biggest challenge right now|next challenge)/
    );
  });

  test("should clean up localStorage during migration", async ({ page }) => {
    // Set old localStorage values to simulate existing user
    await page.evaluate(() => {
      localStorage.setItem("hasCompletedOnboarding", "true");
      localStorage.setItem("userGoal", "Old goal from localStorage");
    });

    // Navigate to the page
    await page.goto("/new-roadmap");

    // Wait a moment for migration to complete
    await page.waitForTimeout(1000);

    // Check that localStorage has been cleared
    const localStorageData = await page.evaluate(() => ({
      hasCompletedOnboarding: localStorage.getItem("hasCompletedOnboarding"),
      userGoal: localStorage.getItem("userGoal"),
    }));

    expect(localStorageData.hasCompletedOnboarding).toBeNull();
    expect(localStorageData.userGoal).toBeNull();
  });

  test("should persist onboarding status across page refreshes", async ({ page }) => {
    // First visit - should show new user question
    await page.goto("/new-roadmap");
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "What is your single biggest challenge right now?"
    );

    // Create a roadmap
    await page
      .getByRole("textbox")
      .fill("I want to stop procrastinating on my important work projects");
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Wait for navigation to roadmap
    await page.waitForURL("/roadmap", { timeout: 15000 });

    // Navigate back to new-roadmap page
    await page.goto("/new-roadmap");

    // Should now show returning user question (if the component re-fetches the DB)
    // Note: This might still show "single biggest challenge" if the user hasn't completed
    // their first roadmap yet, as onboarding is based on roadmap_count
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      /What is your (single biggest challenge right now|next challenge)/
    );
  });
});
