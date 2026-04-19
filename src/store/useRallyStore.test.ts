import { describe, it, expect, beforeEach } from "vitest";
import {
  useRallyStore,
  selectStats,
  selectWidgets,
  selectTier,
  selectTG,
} from "./useRallyStore";
import { createProfile } from "../lib/storage";

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

// ─── newProfile tests ────────────────────────────────────────────────────────

describe("useRallyStore - newProfile", () => {
  it("should create a new profile and select it", () => {
    const store = useRallyStore.getState();
    const initialCount = store.profiles.length;

    store.newProfile("New Profile");

    const updated = useRallyStore.getState();
    expect(updated.profiles.length).toBe(initialCount + 1);
    expect(updated.activeProfile?.name).toBe("New Profile");
  });

  it("should set new profile as active", () => {
    const store = useRallyStore.getState();
    const oldActiveId = store.activeProfileId;

    store.newProfile("Another Profile");

    const updated = useRallyStore.getState();
    expect(updated.activeProfileId).not.toBe(oldActiveId);
    expect(updated.activeProfile?.name).toBe("Another Profile");
  });

  it("should recompute result after creating new profile", () => {
    const store = useRallyStore.getState();
    store.newProfile("Test Profile");

    const updated = useRallyStore.getState();
    expect(updated.result).not.toBeNull();
    expect(updated.result?.ratio).toBeDefined();
    expect(updated.result?.distribution).toBeDefined();
  });
});

// ─── selectProfile tests ──────────────────────────────────────────────────

describe("useRallyStore - selectProfile", () => {
  it("should switch to an existing profile", () => {
    const store = useRallyStore.getState();
    store.newProfile("Profile 1");
    store.newProfile("Profile 2");

    const state1 = useRallyStore.getState();
    const profile1Id = state1.profiles[0]?.id as string;

    store.selectProfile(profile1Id);

    const updated = useRallyStore.getState();
    expect(updated.activeProfileId).toBe(profile1Id);
    expect(updated.activeProfile?.id).toBe(profile1Id);
  });

  it("should not crash when selecting non-existent profile", () => {
    const store = useRallyStore.getState();
    const before = store.activeProfileId;

    store.selectProfile("non-existent-id");

    const after = useRallyStore.getState();
    expect(after.activeProfileId).toBe(before);
  });

  it("should switch between existing profiles", () => {
    const store = useRallyStore.getState();
    store.newProfile("Profile 1");
    store.newProfile("Profile 2");

    const state = useRallyStore.getState();
    const profile1 = state.profiles.at(0);
    expect(profile1).toBeDefined();

    store.selectProfile(profile1?.id as string);

    const updated = useRallyStore.getState();
    expect(updated.activeProfileId).toBe(profile1?.id as string);
    expect(updated.activeProfile?.id).toBe(profile1?.id as string);
  });
});

// ─── updateProfile tests ─────────────────────────────────────────────────

describe("useRallyStore - updateProfile", () => {
  it("should update active profile stats", () => {
    const store = useRallyStore.getState();
    store.updateProfile({
      stats: {
        inf_atk: 100,
        inf_let: 100,
        cav_atk: 100,
        cav_let: 100,
        arc_atk: 100,
        arc_let: 100,
      },
    });

    const updated = useRallyStore.getState();
    expect(updated.activeProfile?.stats.inf_atk).toBe(100);
  });

  it("should recompute result after updating profile", () => {
    const store = useRallyStore.getState();

    store.updateProfile({
      stats: {
        inf_atk: 200,
        inf_let: 200,
        cav_atk: 200,
        cav_let: 200,
        arc_atk: 200,
        arc_let: 200,
      },
    });

    const updated = useRallyStore.getState();
    expect(updated.result?.damageScore).toBeGreaterThan(0);
  });

  it("should persist update to localStorage", () => {
    const store = useRallyStore.getState();
    store.updateProfile({
      stats: {
        inf_atk: 150,
        inf_let: 150,
        cav_atk: 150,
        cav_let: 150,
        arc_atk: 150,
        arc_let: 150,
      },
    });

    const saved = localStorage.getItem("ks_profiles");
    expect(saved).not.toBeNull();
    if (saved) {
      const profiles = JSON.parse(saved);
      const active = profiles.find(
        (p: Record<string, unknown>) => p.id === useRallyStore.getState().activeProfileId,
      );
      expect(active?.stats?.inf_atk).toBe(150);
    }
  });
});

// ─── removeProfile tests ──────────────────────────────────────────────────

describe("useRallyStore - removeProfile", () => {
  it("should remove a profile from the list", () => {
    const store = useRallyStore.getState();
    store.newProfile("Profile to Remove");

    const state = useRallyStore.getState();
    const profileIdToRemove = state.profiles[0]?.id as string;
    const count = state.profiles.length;

    store.removeProfile(profileIdToRemove);

    const updated = useRallyStore.getState();
    expect(updated.profiles.length).toBe(count - 1);
    expect(updated.profiles.find((p) => p.id === profileIdToRemove)).toBeUndefined();
  });

  it("should switch to another profile when removing active profile", () => {
    const store = useRallyStore.getState();
    store.newProfile("Profile 1");
    store.newProfile("Profile 2");

    const state = useRallyStore.getState();
    const activeId = state.activeProfileId;
    expect(activeId).toBeDefined();

    if (activeId) {
      store.removeProfile(activeId);

      const updated = useRallyStore.getState();
      expect(updated.activeProfileId).not.toBe(activeId);
      expect(updated.activeProfile).not.toBeNull();
    }
  });

  it("should create default profile if all removed", () => {
    const store = useRallyStore.getState();
    const profiles = store.profiles.slice();

    profiles.forEach((p) => {
      store.removeProfile(p.id);
    });

    const updated = useRallyStore.getState();
    expect(updated.profiles.length).toBeGreaterThan(0);
    expect(updated.activeProfile?.name).toBe("My Profile");
  });
});

// ─── setRallyConfig tests ────────────────────────────────────────────────

describe("useRallyStore - setRallyConfig", () => {
  it("should update rally config", () => {
    const store = useRallyStore.getState();
    store.setRallyConfig({ participants: 10 });

    const updated = useRallyStore.getState();
    expect(updated.rallyConfig.participants).toBe(10);
  });

  it("should update capacity and persist to profile", () => {
    const store = useRallyStore.getState();
    store.setRallyConfig({ capacity: 5_000_000 });

    const updated = useRallyStore.getState();
    expect(updated.rallyConfig.capacity).toBe(5_000_000);
    expect(updated.activeProfile?.rally_capacity).toBe(5_000_000);
  });

  it("should recompute result when config changes", () => {
    const store = useRallyStore.getState();

    store.setRallyConfig({ participants: 5 });

    const updated = useRallyStore.getState();
    expect(updated.result?.distribution.troopsPerParticipant).toBeDefined();
  });

  it("should handle multiple partial updates", () => {
    const store = useRallyStore.getState();
    store.setRallyConfig({ participants: 8 });
    store.setRallyConfig({ bearLevel: 3 });

    const updated = useRallyStore.getState();
    expect(updated.rallyConfig.participants).toBe(8);
    expect(updated.rallyConfig.bearLevel).toBe(3);
  });
});

// ─── setJoiner tests ──────────────────────────────────────────────────────

describe("useRallyStore - setJoiner", () => {
  it("should update joiner in specific slot", () => {
    const store = useRallyStore.getState();
    store.setJoiner(0, { hero: "Chenko", skillLevel: 3 });

    const updated = useRallyStore.getState();
    expect(updated.rallyConfig.joiners[0].hero).toBe("Chenko");
    expect(updated.rallyConfig.joiners[0].skillLevel).toBe(3);
  });

  it("should recompute result when joiner changes", () => {
    const store = useRallyStore.getState();

    store.setJoiner(0, { hero: "Yeonwoo", skillLevel: 5 });

    const updated = useRallyStore.getState();
    expect(updated.result?.damageScore).toBeDefined();
  });

  it("should update all 4 joiner slots independently", () => {
    const store = useRallyStore.getState();
    store.setJoiner(0, { hero: "Amane" });
    store.setJoiner(1, { hero: "Chenko" });
    store.setJoiner(2, { hero: "Yeonwoo" });
    store.setJoiner(3, { hero: "None" });

    const updated = useRallyStore.getState();
    expect(updated.rallyConfig.joiners[0].hero).toBe("Amane");
    expect(updated.rallyConfig.joiners[1].hero).toBe("Chenko");
    expect(updated.rallyConfig.joiners[2].hero).toBe("Yeonwoo");
    expect(updated.rallyConfig.joiners[3].hero).toBe("None");
  });
});

// ─── Selector tests ───────────────────────────────────────────────────────

describe("useRallyStore - selectors", () => {
  it("selectStats should return active profile stats", () => {
    const store = useRallyStore.getState();
    store.updateProfile({
      stats: {
        inf_atk: 123,
        inf_let: 456,
        cav_atk: 789,
        cav_let: 111,
        arc_atk: 222,
        arc_let: 333,
      },
    });

    const stats = selectStats(useRallyStore.getState());
    expect(stats.inf_atk).toBe(123);
    expect(stats.arc_let).toBe(333);
  });

  it("selectWidgets should return active profile widgets", () => {
    const store = useRallyStore.getState();
    store.updateProfile({
      widgets: {
        inf_atk: 50,
        inf_let: 60,
        cav_atk: 70,
        cav_let: 80,
        arc_atk: 90,
        arc_let: 100,
      },
    });

    const widgets = selectWidgets(useRallyStore.getState());
    expect(widgets.inf_atk).toBe(50);
    expect(widgets.arc_let).toBe(100);
  });

  it("selectTier should return active profile tier", () => {
    const store = useRallyStore.getState();
    store.updateProfile({ troop_tier: "T11" });

    const tier = selectTier(useRallyStore.getState());
    expect(tier).toBe("T11");
  });

  it("selectTG should return active profile TG level", () => {
    const store = useRallyStore.getState();
    store.updateProfile({ tg_level: 5 });

    const tg = selectTG(useRallyStore.getState());
    expect(tg).toBe(5);
  });

  it("selectors should return defaults when no active profile", () => {
    // This is a edge case that shouldn't happen, but test resilience
    const store = useRallyStore.getState();
    store.activeProfile = null;

    const stats = selectStats(store);
    expect(stats.inf_atk).toBe(0); // Default

    const tier = selectTier(store);
    expect(tier).toBe("T10"); // Default
  });
});

// ─── UI Actions tests ────────────────────────────────────────────────────

describe("useRallyStore - UI actions", () => {
  it("setActiveView should update activeView", () => {
    const store = useRallyStore.getState();
    store.setActiveView("bear-trap");

    const updated = useRallyStore.getState();
    expect(updated.activeView).toBe("bear-trap");
  });

  it("setActiveTab should update activeTab", () => {
    const store = useRallyStore.getState();
    store.setActiveTab("participants");

    const updated = useRallyStore.getState();
    expect(updated.activeTab).toBe("participants");
  });

  it("setUserDataTab should update userDataTab", () => {
    const store = useRallyStore.getState();
    store.setUserDataTab("gov-gear");

    const updated = useRallyStore.getState();
    expect(updated.userDataTab).toBe("gov-gear");
  });
});

// ─── Integration tests ────────────────────────────────────────────────────

describe("useRallyStore - integration scenarios", () => {
  it("should handle complete workflow: create, update, configure, compute", () => {
    const store = useRallyStore.getState();

    // Create profile
    store.newProfile("My Rally");
    let state = useRallyStore.getState();
    expect(state.activeProfile?.name).toBe("My Rally");

    // Update stats
    store.updateProfile({
      stats: {
        inf_atk: 100,
        inf_let: 100,
        cav_atk: 150,
        cav_let: 150,
        arc_atk: 50,
        arc_let: 50,
      },
    });

    // Configure rally
    store.setRallyConfig({ participants: 10 });
    store.setJoiner(0, { hero: "Amane", skillLevel: 5 });

    // Check result
    state = useRallyStore.getState();
    expect(state.result?.damageScore).toBeGreaterThan(0);
    expect(state.rallyConfig.participants).toBe(10);
    expect(state.rallyConfig.joiners[0].hero).toBe("Amane");
  });

  it("should persist state across store resets", () => {
    const store = useRallyStore.getState();
    store.newProfile("Persisted Profile");

    const state = useRallyStore.getState();
    const profileName = state.activeProfile?.name;
    const savedId = state.activeProfileId;

    // Simulate store reset by checking localStorage
    const saved = localStorage.getItem("ks_profiles");
    expect(saved).not.toBeNull();
    if (saved) {
      const profiles = JSON.parse(saved);
      expect(profiles.some((p: Record<string, unknown>) => p.name === profileName)).toBe(true);
    }

    const savedActiveId = localStorage.getItem("ks_active_profile");
    expect(savedActiveId).toBe(savedId);
  });
});

// ─── importProfile tests ──────────────────────────────────────────────────────

describe("useRallyStore - importProfile", () => {
  it("should add the imported profile to the list", () => {
    const store = useRallyStore.getState();
    const initialCount = store.profiles.length;

    const profile = createProfile("Imported");
    store.importProfile(profile);

    const updated = useRallyStore.getState();
    expect(updated.profiles.length).toBe(initialCount + 1);
  });

  it("should select the imported profile as active", () => {
    const store = useRallyStore.getState();
    const profile = createProfile("My Import");
    store.importProfile(profile);

    const updated = useRallyStore.getState();
    expect(updated.activeProfileId).toBe(profile.id);
    expect(updated.activeProfile?.name).toBe("My Import");
  });

  it("should persist the imported profile id as active in localStorage", () => {
    const store = useRallyStore.getState();
    const profile = createProfile("Saved Import");
    store.importProfile(profile);

    const savedActiveId = localStorage.getItem("ks_active_profile");
    expect(savedActiveId).toBe(profile.id);
  });

  it("should recompute result after import", () => {
    const store = useRallyStore.getState();
    const profile = createProfile("Result Import");
    store.importProfile(profile);

    const updated = useRallyStore.getState();
    expect(updated.result).not.toBeNull();
  });
});
