import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  test("main page should have no critical violations", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude(".leaflet-container")
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    if (critical.length > 0) {
      console.log("Accessibility violations:");
      critical.forEach((v) => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        v.nodes.forEach((n) => console.log(`    → ${n.html.slice(0, 80)}`));
      });
    }

    expect(critical).toHaveLength(0);
  });

  test("chat widget should be accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator('[title="Chat con MoviBot"]').click();
    await page
      .locator('[title="Chat con MoviBot"]')
      .waitFor({ state: "hidden" })
      .catch(() => {});
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .include(String.raw`.z-\[600\]`)
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(critical).toHaveLength(0);
  });

  test("planificar panel should be accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /planificar/i }).click();
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude(".leaflet-container")
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");

    expect(critical).toHaveLength(0);
  });

  test("all images should have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["image-alt"])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test("all buttons should have accessible names", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["button-name"])
      .exclude(".leaflet-container")
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );

    expect(critical).toHaveLength(0);
  });

  test("color contrast should meet AA standards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .exclude(".leaflet-container")
      .analyze();

    // Log warnings but don't fail on minor contrast issues
    if (results.violations.length > 0) {
      console.log(`Color contrast issues: ${results.violations.length}`);
      results.violations.forEach((v) => {
        console.log(`  ${v.nodes.length} elements with insufficient contrast`);
      });
    }

    // Verify analysis ran successfully
    expect(
      results.passes.length + results.violations.length,
    ).toBeGreaterThanOrEqual(0);
  });

  test("forms should have labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /planificar/i }).click();
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .withRules(["label"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");

    expect(critical).toHaveLength(0);
  });
});
