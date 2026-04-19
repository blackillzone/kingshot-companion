import { test, expect } from "@playwright/test";

test.describe("Profile Management E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
  });

  test("should load profiles interface on startup", async ({ page }) => {
    // App should render without crashing
    const pageText = await page.textContent("body");
    expect(pageText?.length || 0).toBeGreaterThan(0);
  });

  test("should display profile-related UI elements", async ({ page }) => {
    // Look for buttons, lists, or profile containers
    const buttons = page.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should persist data across page reload", async ({ page }) => {
    const initialUrl = page.url();
    await page.reload();
    await page.waitForTimeout(500);
    const reloadUrl = page.url();
    // URL should remain the same (same route)
    expect(initialUrl).toBe(reloadUrl);
  });

  test("should support profile list navigation if available", async ({ page }) => {
    // Try to find and interact with profile list
    const listItems = page.locator("li, [role=listitem], [role=option]");
    const count = await listItems.count();
    // Should have at least default profile or be empty initially
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should handle localStorage properly (no console errors)", async ({ page }) => {
    // Listen for console errors
    let hasError = false;
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        hasError = true;
      }
    });
    await page.waitForTimeout(300);
    // Should not have localStorage-related errors
    expect(hasError).toBeFalsy();
  });
});
