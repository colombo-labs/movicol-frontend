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

  it("should render title when open", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("config.title")).toBeInTheDocument();
  });

  it("should show theme option", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("config.theme")).toBeInTheDocument();
  });

  it("should show language option", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("config.language")).toBeInTheDocument();
  });

  it("should show notifications option", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("config.notifications")).toBeInTheDocument();
  });

  it("should show login message for notifications when not authenticated", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("chat.loginForNotifications")).toBeInTheDocument();
  });

  it("should show version info", () => {
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("config.version")).toBeInTheDocument();
    expect(screen.getByText("0.1.0")).toBeInTheDocument();
  });
});
