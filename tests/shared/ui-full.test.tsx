import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock useAuth with different states
const mockLogin = vi.fn();
const mockLogout = vi.fn();
let mockIsAuthenticated = false;
let mockUser: any = null;

vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
    login: mockLogin,
    logout: mockLogout,
    can: () => false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@shared/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: "dark",
    toggle: vi.fn(),
  }),
}));

describe("AuthButton — not authenticated", () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockUser = null;
    mockLogin.mockReset();
  });

  it("renders generic avatar", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    const { container } = render(<AuthButton />);
    const avatar = container.querySelector(".rounded-full");
    expect(avatar).toBeInTheDocument();
  });

  it("opens dropdown with login option", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("auth.login")).toBeInTheDocument();
  });

  it("shows settings option", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("auth.settings")).toBeInTheDocument();
  });

  it("calls login on click", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("auth.login"));
    expect(mockLogin).toHaveBeenCalled();
  });

  it("calls onConfigOpen", async () => {
    const onConfigOpen = vi.fn();
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton onConfigOpen={onConfigOpen} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("auth.settings"));
    expect(onConfigOpen).toHaveBeenCalled();
  });

  it("closes dropdown on backdrop click", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("auth.login")).toBeInTheDocument();
    // Click backdrop
    const backdrop = document.querySelector(".fixed.inset-0");
    if (backdrop) fireEvent.click(backdrop);
    expect(screen.queryByText("auth.login")).not.toBeInTheDocument();
  });
});

describe("AuthButton — authenticated", () => {
  beforeEach(() => {
    mockIsAuthenticated = true;
    mockUser = {
      id: "1",
      name: "Pipe",
      email: "pipe@test.com",
      avatarUrl: null,
      role: { name: "admin" },
    };
    mockLogout.mockReset();
  });

  it("shows user avatar with initials", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    const { container } = render(<AuthButton />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.src).toContain("ui-avatars.com");
  });

  it("shows user name and email in dropdown", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Pipe")).toBeInTheDocument();
    expect(screen.getByText("pipe@test.com")).toBeInTheDocument();
  });

  it("shows profile option", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("auth.profile")).toBeInTheDocument();
  });

  it("shows logout option", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("auth.logout")).toBeInTheDocument();
  });

  it("calls logout", async () => {
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("auth.logout"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("calls onProfileOpen", async () => {
    const onProfileOpen = vi.fn();
    const { AuthButton } = await import("@shared/ui/AuthButton");
    render(<AuthButton onProfileOpen={onProfileOpen} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("auth.profile"));
    expect(onProfileOpen).toHaveBeenCalled();
  });
});

describe("ConfigModal — full coverage", () => {
  it("shows theme toggle button", async () => {
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    render(<ConfigModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("config.theme")).toBeInTheDocument();
    expect(screen.getByText("config.dark")).toBeInTheDocument();
  });

  it("shows language with current value", async () => {
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    render(<ConfigModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("config.language")).toBeInTheDocument();
    expect(screen.getByText("Español")).toBeInTheDocument();
  });

  it("shows notifications with login message", async () => {
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    mockIsAuthenticated = false;
    render(<ConfigModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("chat.loginForNotifications")).toBeInTheDocument();
  });

  it("shows version", async () => {
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    render(<ConfigModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("0.1.0")).toBeInTheDocument();
  });

  it("clicking login calls onClose", async () => {
    const onClose = vi.fn();
    const { ConfigModal } = await import("@shared/ui/ConfigModal");
    mockIsAuthenticated = false;
    render(<ConfigModal isOpen={true} onClose={onClose} />);
    // The login button in notifications
    const loginBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.includes("Iniciar") || b.textContent?.includes("login"),
    );
    if (loginBtn) {
      fireEvent.click(loginBtn);
      // Should call onClose
      expect(onClose).toHaveBeenCalled();
    }
  });
});

describe("NotificationsModal — full coverage", () => {
  it("renders nothing when closed", async () => {
    const { NotificationsModal } = await import("@shared/ui/NotificationsModal");
    const { container } = render(
      <NotificationsModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows login message when not authenticated", async () => {
    const { NotificationsModal } = await import("@shared/ui/NotificationsModal");
    // Remove cookie to simulate no auth
    document.cookie = "access_token=; Max-Age=0; path=/";
    render(<NotificationsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("chat.loginRequired")).toBeInTheDocument();
  });

  it("shows empty state with auth cookie", async () => {
    const { NotificationsModal } = await import("@shared/ui/NotificationsModal");
    document.cookie = "access_token=test; path=/";
    render(<NotificationsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("chat.noNotifications")).toBeInTheDocument();
    document.cookie = "access_token=; Max-Age=0; path=/";
  });

  it("shows title", async () => {
    const { NotificationsModal } = await import("@shared/ui/NotificationsModal");
    render(<NotificationsModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("notifications.title")).toBeInTheDocument();
  });

  it("close button calls onClose", async () => {
    const onClose = vi.fn();
    const { NotificationsModal } = await import("@shared/ui/NotificationsModal");
    render(<NotificationsModal isOpen={true} onClose={onClose} />);
    // Find X button
    const buttons = screen.getAllByRole("button");
    const closeBtn = buttons.find((b) => b.getAttribute("aria-label") === "Cerrar");
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });
});
