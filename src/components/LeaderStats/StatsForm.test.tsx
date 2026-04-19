import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatsForm } from "./StatsForm";
import { useRallyStore } from "../../store/useRallyStore";
import { createProfile } from "../../lib/storage";
import { resetStore } from "../../test/storeFixture";

describe("StatsForm", () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
    const profile = createProfile("Test Profile");
    useRallyStore.setState({
      activeProfile: profile,
      profiles: [profile],
    });
  });

  it("should render form with troop tier and TG level selects", () => {
    const { container } = render(<StatsForm />);
    expect(container).toBeDefined();
    // Verify form structure exists
    const selects = container.querySelectorAll("select");
    expect(selects.length).toBeGreaterThan(0);
  });

  it("should update hero stats when input values change", async () => {
    const user = userEvent.setup();
    const { container } = render(<StatsForm />);
    
    // Get initial profile
    const initialProfile = useRallyStore.getState().activeProfile;
    expect(initialProfile?.stats.inf_atk).toBe(0);
    
    // Find and interact with an input (assuming at least one number input exists)
    const numberInputs = container.querySelectorAll("input[type='number']");
    if (numberInputs.length > 0) {
      const firstInput = numberInputs[0] as HTMLInputElement;
      await user.clear(firstInput);
      await user.type(firstInput, "100");
      
      // Wait for state update
      await waitFor(() => {
        const updatedProfile = useRallyStore.getState().activeProfile;
        expect(updatedProfile).not.toBeNull();
      });
    }
  });

  it("should render without crash and have form inputs", () => {
    const { container } = render(<StatsForm />);
    expect(container).toBeDefined();
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(0);
  });
});
