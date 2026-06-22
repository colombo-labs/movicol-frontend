import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, RouteSkeleton } from "../Skeleton";

describe("Skeleton", () => {
  it("should render with animate-pulse class", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild?.className).toContain("animate-pulse");
  });

  it("should accept custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-full" />);
    expect(container.firstChild?.className).toContain("h-8");
  });
});

describe("RouteSkeleton", () => {
  it("should render multiple skeleton blocks", () => {
    const { container } = render(<RouteSkeleton />);
    const pulseElements = container.querySelectorAll(
      "[class*='animate-pulse']",
    );
    expect(pulseElements.length).toBeGreaterThan(5);
  });
});
