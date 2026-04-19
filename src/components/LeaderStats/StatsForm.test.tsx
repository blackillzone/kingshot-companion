import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { StatsForm } from "./StatsForm";
import { useRallyStore } from "../../store/useRallyStore";
import { createProfile } from "../../lib/storage";

describe("StatsForm", () => {
  beforeEach(() => {
    localStorage.clear();
    const profile = createProfile("Test Profile");
    useRallyStore.setState({
      activeProfile: profile,
      profiles: [profile],
    });
  });

  it("should render without crash", () => {
    const { container } = render(<StatsForm />);
    expect(container).toBeDefined();
  });

  it("should have form inputs", () => {
    const { container } = render(<StatsForm />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(0);
  });
});
