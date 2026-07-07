import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ChatMessage } from "@modules/chat/components/ui/ChatMessage";

describe("ChatMessage", () => {
  it("renders user message aligned right", () => {
    const { container } = render(
      <ChatMessage role="user" content="Hola bot" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("text-right");
    expect(screen.getByText("Hola bot")).toBeInTheDocument();
  });

  it("renders assistant message aligned left", () => {
    const { container } = render(
      <ChatMessage role="assistant" content="Soy MoviBot" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("text-left");
    expect(screen.getByText("Soy MoviBot")).toBeInTheDocument();
  });

  it("renders multiline assistant messages", () => {
    const content = "Línea 1\nLínea 2\nLínea 3";
    render(<ChatMessage role="assistant" content={content} />);
    expect(screen.getByText("Línea 1")).toBeInTheDocument();
    expect(screen.getByText("Línea 2")).toBeInTheDocument();
    expect(screen.getByText("Línea 3")).toBeInTheDocument();
  });

  it("renders bullet points with indent", () => {
    const content = "Info:\n• Punto uno\n• Punto dos";
    const { container } = render(
      <ChatMessage role="assistant" content={content} />,
    );
    const bullets = container.querySelectorAll(".pl-2");
    expect(bullets).toHaveLength(2);
  });

  it("renders labels with primary color", () => {
    const content = "Estación: Héroes\nTroncal: Caracas";
    const { container } = render(
      <ChatMessage role="assistant" content={content} />,
    );
    const labels = container.querySelectorAll(".text-primary");
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it("filters empty lines", () => {
    const content = "Hola\n\n\nMundo";
    render(<ChatMessage role="assistant" content={content} />);
    expect(screen.getByText("Hola")).toBeInTheDocument();
    expect(screen.getByText("Mundo")).toBeInTheDocument();
  });
});
