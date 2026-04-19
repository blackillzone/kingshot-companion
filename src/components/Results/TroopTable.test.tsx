import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TroopTable } from "./TroopTable";
import { useRallyStore } from "../../store/useRallyStore";
import { computeFormation } from "../../lib/formulas";
import { resetStore } from "../../test/storeFixture";

describe("TroopTable", () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
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

  it("should render table with troop distribution data", () => {
    render(<TroopTable />);
    const table = screen.getByRole("table");
    expect(table).toBeDefined();

    // Verify result has distribution data
    const result = useRallyStore.getState().result;
    expect(result).not.toBeNull();
    expect(result?.distribution).toBeDefined();
    expect(result?.distribution.inf).toBeGreaterThanOrEqual(0);
    expect(result?.distribution.cav).toBeGreaterThanOrEqual(0);
    expect(result?.distribution.arc).toBeGreaterThanOrEqual(0);
  });

  it("should display troop type rows with correct structure", () => {
    render(<TroopTable />);

    // Check for troop type headers
    expect(screen.getByText("Infantry")).toBeDefined();
    expect(screen.getByText("Cavalry")).toBeDefined();
    expect(screen.getByText("Archery")).toBeDefined();
  });

  it("should return null when no result available", () => {
    useRallyStore.setState({ result: null });
    const { container } = render(<TroopTable />);
    expect(container.firstChild).toBeNull();
  });
});
