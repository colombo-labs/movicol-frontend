import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object: Planificar Viaje panel.
 */
export class PlanificarPage {
  readonly page: Page;
  readonly originInput: Locator;
  readonly destinationInput: Locator;
  readonly useMyLocationButton: Locator;
  readonly searchResults: Locator;
  readonly modeButtons: Locator;
  readonly routeOptions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.originInput = page.locator("input").first();
    this.destinationInput = page.locator("input").nth(1);
    this.useMyLocationButton = page.getByText(/mi ubicación|my location/i);
    this.searchResults = page.locator(
      "[class*='search-result'], [class*='bg-default']",
    );
    this.modeButtons = page.locator("[class*='mode-tab'], [role='tab']");
    this.routeOptions = page.locator("[class*='route-option']");
  }

  async searchOrigin(text: string) {
    await this.originInput.fill(text);
    await this.page.waitForTimeout(500);
  }

  async searchDestination(text: string) {
    await this.destinationInput.fill(text);
    await this.page.waitForTimeout(500);
  }

  async selectFirstResult() {
    const results = await this.searchResults.all();
    if (results.length > 0) {
      await results[0].click();
    }
  }
}
