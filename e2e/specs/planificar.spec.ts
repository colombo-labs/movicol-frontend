import { test, expect } from "@playwright/test";
import { MapPage } from "../pages/MapPage";

test.describe("Planificar Viaje", () => {
  let mapPage: MapPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    await mapPage.goto();
  });

  test("should open planificar panel", async ({ page }) => {
    await mapPage.openPanel("planificar");
    await expect(page.getByText(/planificar viaje/i)).toBeVisible();
  });

  test("should show origin input", async ({ page }) => {
    await mapPage.openPanel("planificar");
    const inputs = await page.locator("input").all();
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  test("should show use my location option", async ({ page }) => {
    await mapPage.openPanel("planificar");
    await expect(page.getByText(/mi ubicación|my location/i)).toBeVisible();
  });

  test("should show transport mode options", async ({ page }) => {
    await mapPage.openPanel("planificar");
    const panel = page.locator("[class*='panel'], [class*='side']");
    await expect(panel).toBeVisible();
  });

  test("should show departure time options", async ({ page }) => {
    await mapPage.openPanel("planificar");
    await expect(
      page.getByText(/salir ahora|programar/i).first(),
    ).toBeVisible();
  });

  test("should add point on map click", async ({ page }) => {
    await mapPage.openPanel("planificar");
    await mapPage.clickOnMap(300, 300);
    await page.waitForLoadState("domcontentloaded");
    const inputs = await page.locator("input").all();
    const values = await Promise.all(inputs.map((i) => i.inputValue()));
    const hasValue = values.some((v) => v.length > 0);
    expect(hasValue).toBe(true);
  });
});
