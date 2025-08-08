import { test, expect } from "@playwright/test";

test.describe("Premium Gating Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "supabase.auth.token",
        JSON.stringify({
          access_token: "mock-token",
          user: {
            id: "test-user-id",
            email: "test@example.com",
          },
        })
      );
    });
  });

  test("should allow first roadmap creation without subscription", async ({ page }) => {
    // Navigate to toolkit page
    await page.goto("/toolkit");

    // Should see "Start Your First Roadmap" button
    const startButton = page.getByRole("button", { name: /Start Your First Roadmap/i });
    await expect(startButton).toBeVisible();

    // Click should navigate to new-roadmap page
    await startButton.click();
    await expect(page).toHaveURL("/new-roadmap");

    // Should see the roadmap creation form
    await expect(page.getByText(/What is your single biggest challenge/i)).toBeVisible();
  });

  test("should show premium dialog after completing first roadmap", async ({ page }) => {
    // Mock completed roadmap state
    await page.route("**/api/toolkit", async (route) => {
      await route.fulfill({
        json: {
          activeRoadmap: null,
          completedRoadmapsCount: 1,
          learnedModelsCount: 5,
          hasActivePlan: false,
          currentStepId: null,
          stats: {
            totalRoadmaps: 1,
            completedSteps: 5,
            reflectionStreak: 3,
          },
        },
      });
    });

    // Mock subscription check
    await page.route("**/api/subscription/status", async (route) => {
      await route.fulfill({
        json: {
          isSubscribed: false,
          status: "free",
          canCreateRoadmap: false,
          completedFreeRoadmap: true,
        },
      });
    });

    // Navigate to toolkit page
    await page.goto("/toolkit");

    // Should see premium CTA button
    const premiumButton = page.getByRole("button", { name: /See what you'll get with Premium/i });
    await expect(premiumButton).toBeVisible();

    // Click should open premium dialog
    await premiumButton.click();

    // Check dialog content
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/Unlock Your Full Potential with Premium/i)).toBeVisible();
    await expect(page.getByText(/Unlimited Roadmaps/i)).toBeVisible();
    await expect(page.getByText(/\$9\.99\/month/i)).toBeVisible();

    // Check for checkout button
    const checkoutButton = page.getByRole("button", { name: /Get Premium Access/i });
    await expect(checkoutButton).toBeVisible();
  });

  test("should redirect from new-roadmap to toolkit with blocked message", async ({ page }) => {
    // Mock subscription check to return not allowed
    await page.route("**/api/subscription/check", async (route) => {
      await route.fulfill({
        json: {
          canCreateRoadmap: false,
        },
      });
    });

    // Try to navigate directly to new-roadmap
    await page.goto("/new-roadmap");

    // Should be redirected to toolkit with blocked parameter
    await expect(page).toHaveURL("/toolkit?blocked=true");

    // Should see toast message
    await expect(page.getByText(/Upgrade to Premium to create more roadmaps/i)).toBeVisible();

    // Should see premium dialog
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("should show success message after successful checkout", async ({ page }) => {
    // Navigate to toolkit with success parameter
    await page.goto("/toolkit?success=true");

    // Should see success toast
    await expect(
      page.getByText(/Welcome to Premium! You can now create unlimited roadmaps/i)
    ).toBeVisible();

    // Should see "Start New Roadmap" button for premium users
    const newRoadmapButton = page.getByRole("button", { name: /Start New Roadmap/i });
    await expect(newRoadmapButton).toBeVisible();
  });

  test("should show canceled message after canceled checkout", async ({ page }) => {
    // Navigate to toolkit with canceled parameter
    await page.goto("/toolkit?canceled=true");

    // Should see info toast
    await expect(page.getByText(/Checkout canceled. You can upgrade anytime/i)).toBeVisible();
  });

  test("should handle premium content loading errors gracefully", async ({ page }) => {
    // Mock content API to return error
    await page.route("**/api/content-blocks/premium-benefits-modal", async (route) => {
      await route.abort("failed");
    });

    // Navigate to toolkit page
    await page.goto("/toolkit");

    // Open premium dialog
    const premiumButton = page.getByRole("button", { name: /See what you'll get with Premium/i });
    if (await premiumButton.isVisible()) {
      await premiumButton.click();

      // Should still show dialog with default content
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/What You Get:/i)).toBeVisible();
      await expect(page.getByText(/\$9\.99\/month/i)).toBeVisible();
    }
  });

  test("should allow premium users to create multiple roadmaps", async ({ page }) => {
    // Mock premium subscription
    await page.route("**/api/subscription/status", async (route) => {
      await route.fulfill({
        json: {
          isSubscribed: true,
          status: "active",
          canCreateRoadmap: true,
          completedFreeRoadmap: true,
        },
      });
    });

    // Mock completed roadmaps
    await page.route("**/api/toolkit", async (route) => {
      await route.fulfill({
        json: {
          activeRoadmap: null,
          completedRoadmapsCount: 3,
          learnedModelsCount: 15,
          hasActivePlan: false,
          currentStepId: null,
          stats: {
            totalRoadmaps: 3,
            completedSteps: 15,
            reflectionStreak: 7,
          },
        },
      });
    });

    // Navigate to toolkit page
    await page.goto("/toolkit");

    // Should see regular "Start New Roadmap" button (not premium CTA)
    const newRoadmapButton = page.getByRole("button", { name: /Start New Roadmap/i });
    await expect(newRoadmapButton).toBeVisible();

    // Should NOT see premium CTA
    const premiumButton = page.getByRole("button", { name: /See what you'll get with Premium/i });
    await expect(premiumButton).not.toBeVisible();

    // Click should navigate to new-roadmap page
    await newRoadmapButton.click();
    await expect(page).toHaveURL("/new-roadmap");
  });
});
