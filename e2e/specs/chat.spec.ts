import { test, expect } from "@playwright/test";
import { MapPage } from "../pages/MapPage";
import { ChatPage } from "../pages/ChatPage";

test.describe("Chat — MoviBot", () => {
  let mapPage: MapPage;
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    mapPage = new MapPage(page);
    chatPage = new ChatPage(page);
    await mapPage.goto();
  });

  test("should show chat button on load", async () => {
    await expect(chatPage.openButton).toBeVisible();
  });

  test("should open chat widget", async () => {
    await chatPage.open();
    await expect(chatPage.input).toBeVisible();
  });

  test("should show suggestions when empty", async () => {
    await chatPage.open();
    const suggestions = await chatPage.getSuggestions();
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test("should send message and receive response", async ({ page }) => {
    await chatPage.open();
    await chatPage.sendMessage("hola");
    const response = await chatPage.getLastBotMessage();
    expect(response).toContain("MoviBot");
  });

  test("should handle route query", async () => {
    await chatPage.open();
    await chatPage.sendMessage("ir de usaquen al centro");
    const response = await chatPage.getLastBotMessage();
    expect(response.toLowerCase()).toContain("ruta");
  });

  test("should handle cost query", async () => {
    await chatPage.open();
    await chatPage.sendMessage("cuánto cuesta");
    const response = await chatPage.getLastBotMessage();
    expect(response).toContain("3.550");
  });

  test("should clear messages", async () => {
    await chatPage.open();
    await chatPage.sendMessage("hola");
    await chatPage.clear();
    const messages = await chatPage.messages.count();
    expect(messages).toBe(0);
  });

  test("should minimize and restore", async ({ page }) => {
    await chatPage.open();
    await chatPage.minimizeButton.click();
    // Should show minimized bar
    await expect(
      page.locator('[role="button"]').filter({ hasText: "MoviBot" }),
    ).toBeVisible();
  });
});
