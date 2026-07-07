import { test, expect } from "@playwright/test";
import { MapPage } from "../pages/MapPage";

test.describe("Rutas Panel", () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    await mapPage.goto();
  });

  test("should open rutas panel", async ({ page }) => {
    await mapPage.openPanel("rutas");
    await page.waitForTimeout(500);
    // Should show some route content
    const panel = page.locator("[class*='panel'], [class*='side']").first();
    await expect(panel).toBeVisible();
  });

  test("should show route filters", async ({ page }) => {
    await mapPage.openPanel("rutas");
    await page.waitForTimeout(500);
    // Should have filter buttons or tabs
    const buttons = await page.locator("button").all();
    expect(buttons.length).toBeGreaterThan(2);
  });
});

test.describe("Métricas Panel", () => {
  test("should open metricas panel", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await mapPage.openPanel("metricas");
    await page.waitForTimeout(500);
    const panel = page.locator("[class*='panel'], [class*='side']").first();
    await expect(panel).toBeVisible();
  });
});

test.describe("Navigation & Layout", () => {
  test("should show map on load", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await expect(mapPage.map).toBeVisible();
  });

  test("should show notification bell", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await expect(mapPage.notificationBell).toBeVisible();
  });

  test("should show avatar", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    await expect(mapPage.avatar).toBeVisible();
  });

  test("should not show street view button without points", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    const eyeButton = page.locator('[title="Vista de calle"]');
    await expect(eyeButton).not.toBeVisible();
  });

  test("should toggle theme via config", async ({ page }) => {
    const mapPage = new MapPage(page);
    await mapPage.goto();
    // Open avatar dropdown
    await mapPage.avatar.click();
    await page.waitForTimeout(300);
    // Click settings
    await page.getByText(/configuración|settings/i).click();
    await page.waitForTimeout(300);
    // Config modal should be visible
    await expect(page.getByText(/config.title|Configuración/i).first()).toBeVisible();
  });
});
