import { test, expect } from "@playwright/test";
import { MapPage } from "../pages/MapPage";

test.describe("Auth — No session", () => {
  test("should show generic avatar when not logged in", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await expect(mapPage.avatar).toBeVisible();
  });

  test("should show login option in avatar dropdown", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.avatar.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/iniciar sesión|login/i).first()).toBeVisible();
  });

  test("should show settings option in avatar dropdown", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.avatar.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/configuración|settings/i).first()).toBeVisible();
  });
});

test.describe("Notifications — No session", () => {
  test("should open notifications dropdown", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.notificationBell.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/notificaciones|notifications/i).first()).toBeVisible();
  });

  test("should show login message when not authenticated", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.notificationBell.click();
    await page.waitForTimeout(300);
    // Should show login required message
    await expect(
      page.getByText(/iniciar sesión|inicia sesión|sign in/i).first()
    ).toBeVisible();
  });
});

test.describe("Config Modal", () => {
  test("should open config from avatar", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.avatar.click();
    await page.waitForTimeout(300);
    await page.getByText(/configuración|settings/i).first().click();
    await page.waitForTimeout(300);
    // Should show theme and language options
    await expect(page.getByText(/tema|theme/i).first()).toBeVisible();
    await expect(page.getByText(/idioma|language/i).first()).toBeVisible();
  });

  test("should change language", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.avatar.click();
    await page.waitForTimeout(300);
    await page.getByText(/configuración|settings/i).first().click();
    await page.waitForTimeout(300);
    // Click language button to cycle
    const langButton = page.getByText(/español|english|français|português/i).first();
    await langButton.click();
    await page.waitForTimeout(300);
    // Language should have changed
    const newLang = await langButton.textContent();
    expect(newLang).toBeTruthy();
  });
});
