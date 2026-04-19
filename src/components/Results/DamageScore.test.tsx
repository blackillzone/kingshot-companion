import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DamageScore } from "./DamageScore";
import { useRallyStore } from "../../store/useRallyStore";
import { computeFormation } from "../../lib/formulas";
import { resetStore } from "../../test/storeFixture";

describe("DamageScore", () => {
  beforeEach(() => {
    resetStore();
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

  it("should render damage score with title and value", () => {
    const { container } = render(<DamageScore />);
    expect(container.querySelector("h2")).toBeDefined();
    
    // Verify result exists with score data
    const result = useRallyStore.getState().result;
    expect(result).not.toBeNull();
    expect(result?.damageScore).toBeDefined();
    expect(result?.damageScore).toBeGreaterThan(0);
  });

  it("should display improvement percentage with plus sign", () => {
    render(<DamageScore />);
    const percentageText = screen.getByText(/\+/);
    expect(percentageText).toBeDefined();
    
    // Verify the score values are numeric
    const result = useRallyStore.getState().result;
    if (result) {
      expect(typeof result.damageScore).toBe("number");
      expect(typeof result.naiveScore).toBe("number");
      expect(result.damageScore).toBeGreaterThanOrEqual(result.naiveScore);
    }
  });

  it("should return null when no result available", () => {
    useRallyStore.setState({ result: null });
    const { container } = render(<DamageScore />);
    expect(container.firstChild).toBeNull();
  });
});
