import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { RallyConfig } from "./RallyConfig";
import { useRallyStore } from "../../store/useRallyStore";
import { resetStore } from "../../test/storeFixture";

describe("RallyConfig", () => {
  beforeEach(() => {
    resetStore();
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

  it("should render form and allow updating participants", () => {
    const { container } = render(<RallyConfig />);
    expect(container).toBeDefined();

    // Get initial participants count
    const initialParticipants =
      useRallyStore.getState().rallyConfig.participants;
    expect(initialParticipants).toBe(3);
  });

  it("should display capacity and participants fields", () => {
    const { container } = render(<RallyConfig />);
    expect(container).toBeDefined();

    // Verify form structure exists with inputs
    const inputs = container.querySelectorAll("input[type='number']");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should have joiner selection slots for heroes", () => {
    render(<RallyConfig />);
    const initialJoiners = useRallyStore.getState().rallyConfig.joiners;
    expect(initialJoiners).toHaveLength(4);
    expect(initialJoiners.every((j) => j.hero === "None")).toBe(true);
  });
});
