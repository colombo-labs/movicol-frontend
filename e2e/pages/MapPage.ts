import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object: Main map layout.
 * Handles navigation panels, map interaction, and common elements.
 */
export class MapPage {
  readonly page: Page;
  readonly panelPlanificar: Locator;
  readonly panelRutas: Locator;
  readonly panelMetricas: Locator;
  readonly chatButton: Locator;
  readonly avatar: Locator;
  readonly notificationBell: Locator;
  readonly map: Locator;

  constructor(page: Page) {
    this.page = page;
    this.panelPlanificar = page.getByRole("button", { name: /planificar/i });
    this.panelRutas = page.getByRole("button", { name: /rutas/i });
    this.panelMetricas = page.getByRole("button", {
      name: /métricas|metricas/i,
    });
    this.chatButton = page.locator('[title="Chat con MoviBot"]');
    this.avatar = page.locator(".rounded-full").first();
    this.notificationBell = page.locator('[title*="otificaci"]');
    this.map = page.locator(".leaflet-container");
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async openPanel(name: "planificar" | "rutas" | "metricas") {
    const panels = {
      planificar: this.panelPlanificar,
      rutas: this.panelRutas,
      metricas: this.panelMetricas,
    };
    await panels[name].click();
  }

  async openChat() {
    await this.chatButton.click();
  }

  async clickOnMap(x: number, y: number) {
    await this.map.click({ position: { x, y } });
  }
}
