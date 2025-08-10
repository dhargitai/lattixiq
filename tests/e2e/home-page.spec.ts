import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  // --- Happy Path ---
  test("should redirect to /toolkit immediately", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Should be redirected to /toolkit (or /login if not authenticated)
    // The actual URL will depend on authentication state
    await expect(page.url()).toMatch(/\/(toolkit|login)/);

    // Check that the page loads successfully after redirect
    await expect(page.locator("body")).toBeVisible();
  });

  test("should redirect correctly on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Should still redirect on mobile
    await expect(page.url()).toMatch(/\/(toolkit|login)/);

    // Check that the page is still accessible on mobile
    await expect(page.locator("body")).toBeVisible();
  });

  test("should not create redirect loops", async ({ page }) => {
    // Navigate to homepage
    await page.goto("/");

    // Store the redirected URL
    const firstUrl = page.url();

    // The URL should be either /toolkit or /login, not homepage
    expect(firstUrl).not.toContain("http://localhost:3000/");
    expect(firstUrl).toMatch(/\/(toolkit|login)/);

    // Navigate away and back
    await page.goto("/settings");
    await page.goto("/");

    // Should redirect to same place as before
    const secondUrl = page.url();
    expect(secondUrl).toMatch(/\/(toolkit|login)/);
  });

  test("should handle unauthenticated users correctly", async ({ page, context }) => {
    // Clear any existing auth cookies to ensure unauthenticated state
    await context.clearCookies();

    // Navigate to homepage
    await page.goto("/");

    // Unauthenticated users should be redirected through: / → /toolkit → /login
    await expect(page.url()).toContain("/login");

    // Login page should be visible
    await expect(page.locator("body")).toBeVisible();
  });

  // --- Unhappy Paths ---
  test("should handle 404 pages gracefully", async ({ page }) => {
    const response = await page.goto("/non-existent-page");

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should still show some content (Next.js 404 page)
    await expect(page.locator("body")).toBeVisible();
  });

  test("should handle slow network conditions", async ({ page }) => {
    // Simulate slow network
    await page.route("**/*", (route) => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto("/");

    // Page should still load successfully
    await expect(page.locator("body")).toBeVisible();
  });
});

// This test will be updated once authentication is implemented
test.describe.skip("Authentication Flow (Placeholder)", () => {
  test("should allow user to login with OTP", async ({ page }) => {
    // TODO: Implement once Story 0.3 authentication is complete
    // This test should cover the complete login flow from Story 0.3
    await page.goto("/login");
    // Fill in OTP form
    // Verify successful login
    // Check redirect to dashboard
  });

  test("should complete full roadmap creation flow", async ({ page: _page }) => {
    // TODO: Implement once core features are complete
    // This test should cover the complete user journey:
    // 1. User registration
    // 2. Goal selection
    // 3. AI roadmap generation
    // 4. First learning step
    // 5. Plan creation
    // 6. Reflection entry
  });
});
