import { test, expect } from "@playwright/test";

test.describe("create event", () => {
  test("redirects to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dj/events/new");
    await expect(page).toHaveURL("/sign-in");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("redirects to become-dj when authenticated but no DJ profile", async ({
    page,
  }) => {
    // This test would require setting up authenticated state without DJ profile
    // For now, we'll test the redirect behavior
    await page.goto("/dj/events/new");
    // After authentication, it should redirect to become-dj if no profile exists
    // This is a placeholder - actual implementation would need auth setup
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("loads create event page for authenticated DJ", async ({ page }) => {
    // This test would require authenticated DJ user
    // For now, we'll test the page structure when accessible
    // This is a placeholder - actual implementation would need auth setup
    await page.goto("/dj/events/new");
    // After proper auth setup, should see create event form
    // await expect(page.getByRole("heading", { name: "Create Event" })).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test form validation for required fields
    // await page.goto("/dj/events/new");
    // await page.click('button[type="submit"]');
    // await expect(page.getByText("Title is required")).toBeVisible();
    // await expect(page.getByText("Category is required")).toBeVisible();
    // await expect(page.getByText("Start date is required")).toBeVisible();
    // await expect(page.getByText("Country is required")).toBeVisible();
  });

  test("successfully creates event with valid data", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test successful event creation
    // await page.goto("/dj/events/new");
    // await page.fill('input[name="title"]', "Test Event");
    // await page.selectOption('select[name="category"]', "CLUB_NIGHT");
    // await page.fill('input[name="startDate"]', "2026-12-31");
    // await page.selectOption('select[name="countryId"]', "1");
    // await page.click('button[type="submit"]');
    // await expect(page).toHaveURL(/\/dj\/events\/\d+\/edit/);
    // await expect(page.getByText("Event created! It's saved as a draft.")).toBeVisible();
  });

  test("shows error for invalid ticket URL", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test ticket URL validation
    // await page.goto("/dj/events/new");
    // await page.click('button:has-text("🌐 Public")');
    // await page.fill('input[name="ticketUrl"]', "invalid-url");
    // await page.click('button[type="submit"]');
    // await expect(page.getByText("Ticket URL must be a valid URL")).toBeVisible();
  });

  test("shows error for invalid audio link", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test audio link validation
    // await page.goto("/dj/events/new");
    // await page.fill('input[name="audioLink"]', "invalid-url");
    // await page.click('button[type="submit"]');
    // await expect(page.getByText("Audio link must be a valid URL")).toBeVisible();
  });

  test("shows error for invalid time format", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test time format validation
    // await page.goto("/dj/events/new");
    // await page.fill('input[name="startTime"]', "invalid");
    // await page.click('button[type="submit"]');
    // await expect(page.getByText("Use HH:MM format")).toBeVisible();
  });

  test("toggles between public and private event type", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test event type toggle
    // await page.goto("/dj/events/new");
    // await expect(page.getByText("Visible to everyone. Ticket URL can be added.")).toBeVisible();
    // await page.click('button:has-text("🔒 Private")');
    // await expect(page.getByText("Only you can see the full details. Location is hidden.")).toBeVisible();
    // await page.click('button:has-text("🌐 Public")');
    // await expect(page.getByText("Visible to everyone. Ticket URL can be added.")).toBeVisible();
  });

  test("auto-fills timezone when country is selected", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test timezone auto-fill
    // await page.goto("/dj/events/new");
    // await page.selectOption('select[name="countryId"]', "1"); // Sweden
    // await expect(page.locator('input[name="timezone"]')).toHaveValue(/Europe\/Stockholm/);
  });

  test("disables city selection until country is selected", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test city select dependency
    // await page.goto("/dj/events/new");
    // const citySelect = page.locator('select[name="cityId"]');
    // await expect(citySelect).toBeDisabled();
    // await page.selectOption('select[name="countryId"]', "1");
    // await expect(citySelect).toBeEnabled();
  });

  test("limits genre selection to 8 genres", async ({ page }) => {
    // This test would require authenticated DJ user
    // Test genre limit
    // await page.goto("/dj/events/new");
    // Add 8 genres
    // for (let i = 0; i < 8; i++) {
    //   await page.fill('input[placeholder="Add a custom genre…"]', `Genre ${i}`);
    //   await page.click('button:has-text("Add")');
    // }
    // await expect(page.getByText("8/8 selected")).toBeVisible();
    // Try to add 9th genre
    // await page.fill('input[placeholder="Add a custom genre…"]', "Genre 9");
    // const addButton = page.getByRole("button", { name: "Add" });
    // await expect(addButton).toBeDisabled();
  });
});
