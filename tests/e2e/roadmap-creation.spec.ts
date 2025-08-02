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

  test("should save goal to localStorage on successful submission", async ({ page }) => {
    const goalText = "I want to stop procrastinating on my important work projects";

    // Fill and submit the form
    await page.getByRole("textbox").fill(goalText);
    await page.getByRole("button", { name: "Create My Roadmap" }).click();

    // Wait for navigation
    await page.waitForURL("/roadmap", { timeout: 15000 });

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
