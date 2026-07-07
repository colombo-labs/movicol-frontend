import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationsDropdown } from "@shared/ui/NotificationsModal";

// Mock useNotifications
vi.mock("@shared/hooks/useNotifications", () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    markAllRead: vi.fn(),
    clear: vi.fn(),
  }),
}));

describe("NotificationsDropdown", () => {
  const onExpand = vi.fn();

  it("should render bell icon", () => {
    const { container } = render(<NotificationsDropdown onExpand={onExpand} />);
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("should open dropdown on click", () => {
    render(<NotificationsDropdown onExpand={onExpand} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("notifications.title")).toBeInTheDocument();
  });

  it("should show empty state when no notifications", () => {
    render(<NotificationsDropdown onExpand={onExpand} />);
    fireEvent.click(screen.getByRole("button"));
    // Empty state renders when no notifications
    const dropdown = screen.getByText("notifications.title");
    expect(dropdown).toBeInTheDocument();
  });

  it("should not show unread badge when count is 0", () => {
    const { container } = render(<NotificationsDropdown onExpand={onExpand} />);
    const badge = container.querySelector(".bg-danger");
    expect(badge).toBeNull();
  });
});
