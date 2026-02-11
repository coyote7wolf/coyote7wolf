import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../loading-spinner";

describe("LoadingSpinner", () => {
  it("should render without crashing", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should display loading text", () => {
    render(<LoadingSpinner />);
    const loadingText = screen.getByText("Loading...");
    expect(loadingText).toBeInTheDocument();
  });

  it("should render a spinner container", () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerContainer = container.querySelector("div");
    expect(spinnerContainer).toBeInTheDocument();
  });

  it("should render spinner div", () => {
    const { container } = render(<LoadingSpinner />);
    const divs = container.querySelectorAll("div");
    expect(divs.length).toBeGreaterThan(1);
  });

  it("should apply flex layout styles", () => {
    const { container } = render(<LoadingSpinner />);
    const mainContainer = container.firstChild as HTMLElement;
    const styles = window.getComputedStyle(mainContainer);
    expect(mainContainer.style.display).toBe("flex");
  });

  it("should have minimum height of 100vh", () => {
    const { container } = render(<LoadingSpinner />);
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.style.minHeight).toBe("100vh");
  });

  it("should center content", () => {
    const { container } = render(<LoadingSpinner />);
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.style.alignItems).toBe("center");
    expect(mainContainer.style.justifyContent).toBe("center");
  });

  it("should render exactly one paragraph", () => {
    const { container } = render(<LoadingSpinner />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
  });

  it("should have correct text content", () => {
    const { container } = render(<LoadingSpinner />);
    const paragraph = container.querySelector("p");
    expect(paragraph?.textContent).toBe("Loading...");
  });

  it("should have spinner with specific dimensions", () => {
    const { container } = render(<LoadingSpinner />);
    const divs = container.querySelectorAll("div");
    const spinner = divs[1] as HTMLElement;
    expect(spinner.style.width).toBe("40px");
    expect(spinner.style.height).toBe("40px");
  });

  it("should apply animation to spinner", () => {
    const { container } = render(<LoadingSpinner />);
    const divs = container.querySelectorAll("div");
    const spinner = divs[1] as HTMLElement;
    expect(spinner.style.animation).toContain("spin");
  });

  it("should use CSS variables for colors", () => {
    const { container } = render(<LoadingSpinner />);
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer.style.backgroundColor).toContain("var(--bg-primary)");
  });

  it("should have border styles", () => {
    const { container } = render(<LoadingSpinner />);
    const divs = container.querySelectorAll("div");
    const spinner = divs[1] as HTMLElement;
    expect(spinner.style.borderColor).toBeDefined();
    expect(spinner.style.borderRadius).toBe("50%");
  });

  it("should have rounded spinner", () => {
    const { container } = render(<LoadingSpinner />);
    const divs = container.querySelectorAll("div");
    const spinner = divs[1] as HTMLElement;
    expect(spinner.style.borderRadius).toBe("50%");
  });
});
