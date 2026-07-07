import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConfigModal } from "@shared/ui/ConfigModal";

// Mock useAuth
vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
  }),
}));

// Mock useTheme
vi.mock("@shared/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark",
    toggle: vi.fn(),
  }),
}));

describe("ConfigModal", () => {
  const onClose = vi.fn();

  it("should not render when closed", () => {
    const { container } = render(
      <ConfigModal isOpen={false} onClose={onClose} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it.each([
    ["title", "config.title"],
    ["theme option", "config.theme"],
    ["language option", "config.language"],
    ["notifications option", "config.notifications"],
    ["login message for notifications", "chat.loginForNotifications"],
  ])("should show %s when open", (_, text) => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("should show version info", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("config.version")).toBeInTheDocument();
    expect(screen.getByText("0.1.0")).toBeInTheDocument();
  });
});
