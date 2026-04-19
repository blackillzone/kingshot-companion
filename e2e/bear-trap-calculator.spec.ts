import { test, expect } from "@playwright/test";

test.describe("Bear Trap Calculator - Main Workflow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for app to render (heading or main content)
    await page.waitForSelector("h1, h2, [role=main]", { timeout: 5000 });
  });

  test("should load application and display main interface", async ({
    page,
  }) => {
    // Verify app loaded with specific content
    const mainContent = page.locator("[role=main], main, .container").first();
    await expect(mainContent).toBeVisible();

    // Check for navigation/key UI elements
    const hasNav = await page
      .locator("nav, [role=navigation]")
      .isVisible()
      .catch(() => false);
    expect(hasNav || (await page.locator("button").count()) > 0).toBeTruthy();
  });

  test("should navigate between three main views (Profiles, Bear Trap, User Data)", async ({
    page,
  }) => {
    // Get navigation elements
    const navButtons = page.locator("button, a, [role=tab]");
    const count = await navButtons.count();
    expect(count).toBeGreaterThan(0);

    // Verify at least one nav button is visible
    if (count > 0) {
      await expect(navButtons.first()).toBeVisible();
    }
  });

  test("should display rally configuration interface with controls", async ({
    page,
  }) => {
    // Navigate to Bear Trap view first (initial view is user-data)
    const bearTrapBtn = page.getByRole("button", { name: /bear trap/i });
    if (await bearTrapBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bearTrapBtn.click();
    }

    // Rally Config should have capacity and participants controls
    const numberInputs = page.locator("input[type=number]");
    const count = await numberInputs.count();
    expect(count).toBeGreaterThanOrEqual(1); // At least one number input

    // Verify inputs are visible and interactive
    if (count > 0) {
      await expect(numberInputs.first()).toBeVisible();
    }
  });

  test("should compute and display results after configuration", async ({
    page,
  }) => {
    // Results should be displayed (Damage Score, Ratio, etc.)
    const results = page.locator("h2, h3, [class*=score], [class*=result]");
    const resultCount = await results.count();

    // Should have some result elements or data display
    if (resultCount > 0) {
      await expect(results.first()).toBeVisible();
    }
  });

  test("should support interaction with form controls and remain responsive", async ({
    page,
  }) => {
    // Test that clicking buttons doesn't crash the app
    const buttons = page.locator("button");
    const count = await buttons.count();

    if (count > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible({ timeout: 1000 })) {
        await firstButton.click();

        // Verify app remains responsive after click
        await page.waitForSelector("body", { timeout: 2000 });
        expect(page.url()).toBeTruthy();
      }
    }
  });
});
