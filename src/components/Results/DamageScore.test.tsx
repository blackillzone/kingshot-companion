import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DamageScore } from "./DamageScore";
import { useRallyStore } from "../../store/useRallyStore";
import { computeFormation } from "../../lib/formulas";

describe("DamageScore", () => {
  beforeEach(() => {
    localStorage.clear();
    // Initialize store with complete state
    useRallyStore.setState({
      activeProfile: null,
      profiles: [],
      rallyConfig: {
        participants: 3,
        capacity: 900,
        bearLevel: 1,
        joiners: [
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
        ],
      },
      result: computeFormation(
        {
          inf_atk: 100,
          inf_let: 100,
          cav_atk: 100,
          cav_let: 100,
          arc_atk: 100,
          arc_let: 100,
        },
        {
          inf_atk: 0,
          inf_let: 0,
          cav_atk: 0,
          cav_let: 0,
          arc_atk: 0,
          arc_let: 0,
        },
        "T1-T6" as const,
        0,
        900,
        3,
        [
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
          { hero: "None", skillLevel: 1 as const },
        ],
      ),
    });
  });

  it("should render without crash with valid result", () => {
    const { container } = render(<DamageScore />);
    expect(container.querySelector("h2")).toBeDefined();
  });

  it("should display improvement percentage", () => {
    render(<DamageScore />);
    expect(screen.getByText(/\+/)).toBeDefined();
  });

  it("should return null when no result available", () => {
    useRallyStore.setState({ result: null });
    const { container } = render(<DamageScore />);
    expect(container.firstChild).toBeNull();
  });
});
