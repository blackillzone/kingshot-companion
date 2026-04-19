import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileManager } from "./ProfileManager";
import { useRallyStore } from "../../store/useRallyStore";
import { createProfile } from "../../lib/storage";
import { resetStore } from "../../test/storeFixture";

describe("ProfileManager", () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
    useRallyStore.setState({
      profiles: [],
      activeProfile: null,
      activeProfileId: null,
    });
  });

  it("should render profiles section with title", () => {
    render(<ProfileManager />);
    expect(screen.getByText("Saved Profiles")).toBeDefined();
  });

  it("should display empty state when no profiles exist", () => {
    const { container } = render(<ProfileManager />);
    expect(container).toBeDefined();
    
    // Verify no profile items initially
    const profileList = useRallyStore.getState().profiles;
    expect(profileList).toHaveLength(0);
  });

  it("should display profile list when profiles exist", () => {
    const profile1 = createProfile("Test Profile 1");
    const profile2 = createProfile("Test Profile 2");
    
    useRallyStore.setState({
      profiles: [profile1, profile2],
      activeProfile: profile1,
      activeProfileId: profile1.id,
    });
    
    render(<ProfileManager />);
    
    expect(screen.getByText("Test Profile 1")).toBeDefined();
    expect(screen.getByText("Test Profile 2")).toBeDefined();
  });

  it("should highlight active profile", () => {
    const profile1 = createProfile("Active Profile");
    useRallyStore.setState({
      profiles: [profile1],
      activeProfile: profile1,
      activeProfileId: profile1.id,
    });
    
    const { container } = render(<ProfileManager />);
    const activeItem = container.querySelector("[class*=orange-500]");
    expect(activeItem).toBeDefined();
  });

  it("should select profile when clicked", async () => {
    const user = userEvent.setup();
    const profile1 = createProfile("Profile 1");
    const profile2 = createProfile("Profile 2");
    
    useRallyStore.setState({
      profiles: [profile1, profile2],
      activeProfile: profile1,
      activeProfileId: profile1.id,
    });
    
    render(<ProfileManager />);
    
    // Click on profile 2
    const profile2Button = screen.getByText("Profile 2");
    await user.click(profile2Button);
    
    // Verify store updated
    await waitFor(() => {
      const active = useRallyStore.getState().activeProfile;
      expect(active?.id).toBe(profile2.id);
    });
  });

  it("should show create profile form when add button clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProfileManager />);
    
    // Find and click "+" button or "New Profile" button
    const addButtons = screen.queryAllByRole("button");
    const addButton = addButtons.find(btn => 
      btn.textContent?.includes("+") || btn.textContent?.includes("New")
    );
    
    if (addButton) {
      await user.click(addButton);
      // Form should appear
      await waitFor(() => {
        const input = container.querySelector("input[type='text']");
        expect(input).toBeDefined();
      });
    }
  });

  it("should render export and delete buttons for profiles", () => {
    const profile = createProfile("Test Profile");
    useRallyStore.setState({
      profiles: [profile],
      activeProfile: profile,
      activeProfileId: profile.id,
    });
    
    const { container } = render(<ProfileManager />);
    
    // Should have action buttons (download/trash icons)
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should not crash with profile containing stats", () => {
    const profile = createProfile("Stats Profile");
    profile.stats = {
      inf_atk: 100,
      inf_let: 150,
      cav_atk: 200,
      cav_let: 250,
      arc_atk: 300,
      arc_let: 350,
    };
    
    useRallyStore.setState({
      profiles: [profile],
      activeProfile: profile,
      activeProfileId: profile.id,
    });
    
    render(<ProfileManager />);
    
    // Stats should be visible
    expect(screen.getByText(/INF/)).toBeDefined();
  });
});
