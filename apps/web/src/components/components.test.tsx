import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { StackBadge } from "./StackBadge";
import { LogTerminal } from "./LogTerminal";
import { ErrorBoundary } from "./ErrorBoundary";

describe("StatusBadge", () => {
  it("renders provisioning status", () => {
    render(<StatusBadge status="provisioning" />);
    expect(screen.getByText("Provisioning")).toBeDefined();
  });

  it("renders ready status", () => {
    render(<StatusBadge status="ready" />);
    expect(screen.getByText("Ready")).toBeDefined();
  });

  it("renders failed status", () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText("Failed")).toBeDefined();
  });
});

describe("StackBadge", () => {
  it("renders backend category with nodejs language", () => {
    render(<StackBadge category="backend" languages={["nodejs"]} />);
    expect(screen.getByText("Node.js")).toBeDefined();
  });

  it("renders frontend category with react", () => {
    render(<StackBadge category="frontend" languages={["react"]} />);
    expect(screen.getByText("React")).toBeDefined();
  });

  it("renders database category without languages", () => {
    render(<StackBadge category="database" languages={[]} />);
    const elements = screen.getAllByText(/Database/i);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});

describe("ErrorBoundary", () => {
  const Thrower = ({ msg }: { msg?: string }) => {
    throw new Error(msg ?? "Boom");
  };

  it("renders children normally when no error", () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("Safe content")).toBeDefined();
  });

  it("renders error fallback on child crash", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("Reload page")).toBeDefined();
    vi.restoreAllMocks();
  });

  it("shows custom error message in fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Thrower msg="Custom failure" />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom failure")).toBeDefined();
    vi.restoreAllMocks();
  });
});

describe("LogTerminal", () => {
  it("renders empty state", () => {
    render(<LogTerminal logs={[]} />);
    expect(screen.getByText("Waiting for logs...")).toBeDefined();
  });

  it("renders log lines", () => {
    render(<LogTerminal logs={["[2024-01-01] Starting...", "[2024-01-01] Done."]} />);
    expect(screen.getByText(/Starting/)).toBeDefined();
    expect(screen.getByText(/Done/)).toBeDefined();
  });
});
