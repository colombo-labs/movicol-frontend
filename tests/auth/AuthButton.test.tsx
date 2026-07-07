import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthButton } from "@shared/ui/AuthButton";

// Mock useAuth
vi.mock("@/shared/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    can: () => false,
    refetch: vi.fn(),
  }),
}));

describe("AuthButton", () => {
  it("should render avatar button", () => {
    const { container } = render(<AuthButton />);
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
  });

  it("should show generic avatar when not authenticated", () => {
    const { container } = render(<AuthButton />);
    // Should have a div with User icon, not an img
    const avatar = container.querySelector("div.rounded-full");
    expect(avatar).toBeInTheDocument();
  });

  it("should open dropdown on click", () => {
    render(<AuthButton />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // Should show login option
    expect(screen.getByText("auth.login")).toBeInTheDocument();
  });

  it("should show settings option in dropdown", () => {
    const onConfigOpen = vi.fn();
    render(<AuthButton onConfigOpen={onConfigOpen} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("auth.settings")).toBeInTheDocument();
  });

  it("should call onConfigOpen when settings clicked", () => {
    const onConfigOpen = vi.fn();
    render(<AuthButton onConfigOpen={onConfigOpen} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("auth.settings"));
    expect(onConfigOpen).toHaveBeenCalled();
  });
});
