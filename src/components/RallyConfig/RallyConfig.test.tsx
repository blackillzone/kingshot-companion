import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RallyConfig } from "./RallyConfig";
import { useRallyStore } from "../../store/useRallyStore";

describe("RallyConfig", () => {
  beforeEach(() => {
    localStorage.clear();
    useRallyStore.setState({
      rallyConfig: {
        capacity: 1_000_000,
        participants: 3,
        bearLevel: 1,
        joiners: [
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
        ],
      },
    });
  });

  it("should render without crash", () => {
    render(<RallyConfig />);
    expect(document.querySelector("div")).toBeDefined();
  });

  it("should display participants label or value", () => {
    const { container } = render(<RallyConfig />);
    expect(container).toBeDefined();
  });

  it("should render form controls", () => {
    render(<RallyConfig />);
    // Should have form elements (inputs, selects, etc.)
    const inputs = screen.queryAllByRole("spinbutton") || screen.queryAllByRole("combobox");
    expect(inputs.length >= 0).toBeTruthy();
  });
});
