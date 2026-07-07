import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object: MoviBot Chat widget.
 */
export class ChatPage {
  readonly page: Page;
  readonly openButton: Locator;
  readonly input: Locator;
  readonly sendButton: Locator;
  readonly messages: Locator;
  readonly clearButton: Locator;
  readonly micButton: Locator;
  readonly closeButton: Locator;
  readonly minimizeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openButton = page.locator('[title="Chat con MoviBot"]');
    this.input = page.locator("#chat-input");
    this.sendButton = page.locator('[aria-label="send"], button:has(svg)').last();
    this.messages = page.locator(".text-xs.text-left, .text-xs.text-right");
    this.clearButton = page.getByText(/limpiar|clear/i);
    this.micButton = page.locator('[title*="ablar"], [title*="etener"]');
    this.closeButton = page.locator(".z-\\[600\\] button:has(svg)").last();
    this.minimizeButton = page.locator('[title="Minimizar"]');
  }

  async open() {
    await this.openButton.click();
    await this.page.waitForTimeout(300);
  }

  async sendMessage(text: string) {
    await this.input.fill(text);
    await this.input.press("Enter");
    // Wait for response
    await this.page.waitForTimeout(1500);
  }

  async getLastBotMessage(): Promise<string> {
    const msgs = await this.page.locator(".text-xs.text-left span").all();
    if (msgs.length === 0) return "";
    return (await msgs[msgs.length - 1].textContent()) || "";
  }

  async getSuggestions(): Promise<string[]> {
    const buttons = await this.page.locator(".bg-primary\\/10.text-primary").all();
    return Promise.all(buttons.map((b) => b.textContent().then((t) => t || "")));
  }

  async clear() {
    await this.clearButton.click();
  }
}
