import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadProfiles,
  saveProfiles,
  createProfile,
  upsertProfile,
  deleteProfile,
  loadActiveProfileId,
  saveActiveProfileId,
  exportProfile,
  importProfileFromJson,
  validateProfile,
  migrateProfile,
  CURRENT_PROFILE_VERSION,
  defaultStats,
  defaultWidgets,
  defaultOwnedHeroData,
} from "./storage";
import type { PlayerProfile } from "../types";

// ─── Mock localStorage is configured in src/test/setup.ts ────────────────

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
});

// ─── createProfile tests ──────────────────────────────────────────────────

describe("createProfile", () => {
  it("should create a profile with default values", () => {
    const profile = createProfile("My Profile");

    expect(profile.id).toBeDefined();
    expect(profile.name).toBe("My Profile");
    expect(profile.createdAt).toBeDefined();
    expect(profile.stats).toBeDefined();
    expect(profile.widgets).toBeDefined();
    expect(profile.heroes).toBeDefined();
    expect(profile.troop_tier).toBe("T10");
    expect(profile.tg_level).toBe(0);
    expect(profile.rally_capacity).toBe(2_000_000);
  });

  it("should generate unique IDs", () => {
    const profile1 = createProfile("Profile 1");
    const profile2 = createProfile("Profile 2");

    expect(profile1.id).not.toBe(profile2.id);
  });

  it("should use provided name or default", () => {
    const named = createProfile("My Profile");
    expect(named.name).toBe("My Profile");

    const unnamed = createProfile("");
    expect(unnamed.name).toBe("My Profile"); // Default fallback
  });

  it("should have default stats all 0", () => {
    const profile = createProfile("Test");
    expect(profile.stats.inf_atk).toBe(0);
    expect(profile.stats.inf_let).toBe(0);
    expect(profile.stats.cav_atk).toBe(0);
    expect(profile.stats.cav_let).toBe(0);
    expect(profile.stats.arc_atk).toBe(0);
    expect(profile.stats.arc_let).toBe(0);
  });

  it("should have default widget stats all 0", () => {
    const profile = createProfile("Test");
    expect(profile.widgets.inf_atk).toBe(0);
    expect(profile.widgets.inf_let).toBe(0);
    expect(profile.widgets.cav_atk).toBe(0);
    expect(profile.widgets.cav_let).toBe(0);
    expect(profile.widgets.arc_atk).toBe(0);
    expect(profile.widgets.arc_let).toBe(0);
  });

  it("should have default heroes set to 'None'", () => {
    const profile = createProfile("Test");
    expect(profile.heroes.inf).toBe("None");
    expect(profile.heroes.cav).toBe("None");
    expect(profile.heroes.arc).toBe("None");
  });
});

// ─── loadProfiles / saveProfiles tests ────────────────────────────────────

describe("loadProfiles / saveProfiles", () => {
  it("should return empty array when no profiles exist", () => {
    const profiles = loadProfiles();
    expect(profiles).toEqual([]);
  });

  it("should save and retrieve profiles", () => {
    const profile1 = createProfile("Profile 1");
    const profile2 = createProfile("Profile 2");

    saveProfiles([profile1, profile2]);

    const loaded = loadProfiles();
    expect(loaded).toHaveLength(2);
    expect(loaded[0]?.name).toBe("Profile 1");
    expect(loaded[1]?.name).toBe("Profile 2");
  });

  it("should migrate missing fields in loaded profiles", () => {
    const oldProfile = {
      id: "test-id",
      name: "Old Profile",
      createdAt: "2026-04-19T12:00:00.000Z",
      stats: defaultStats(),
      widgets: defaultWidgets(),
      heroes: { inf: "None", cav: "None", arc: "None" },
      troop_tier: "T10" as const,
      tg_level: 0,
      rally_capacity: 2_000_000,
      // Missing: widget_levels, ownedHeroes, govGear, govCharmLevel, staticBonuses, troops
    };

    localStorage.setItem("ks_profiles", JSON.stringify([oldProfile]));

    const loaded = loadProfiles();
    expect(loaded[0]?.widget_levels).toBeDefined();
    expect(loaded[0]?.ownedHeroes).toBeDefined();
    expect(loaded[0]?.govGear).toBeDefined();
    expect(loaded[0]?.govCharmLevel).toBeGreaterThanOrEqual(0);
    expect(loaded[0]?.staticBonuses).toBeDefined();
    expect(loaded[0]?.troops).toBeDefined();
  });

  it("should handle invalid JSON gracefully", () => {
    localStorage.setItem("ks_profiles", "invalid json");
    const profiles = loadProfiles();
    expect(profiles).toEqual([]);
  });
});

// ─── upsertProfile tests ──────────────────────────────────────────────────

describe("upsertProfile", () => {
  it("should insert a new profile", () => {
    const profile = createProfile("New Profile");
    const result = upsertProfile([], profile);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(profile.id);
  });

  it("should update an existing profile by id", () => {
    const profile = createProfile("Original Name");
    let profiles = upsertProfile([], profile);

    const updated = { ...profile, name: "Updated Name" };
    profiles = upsertProfile(profiles, updated);

    expect(profiles).toHaveLength(1);
    expect(profiles[0]?.name).toBe("Updated Name");
  });

  it("should remove oldest profile if exceeding MAX_PROFILES (10)", () => {
    let profiles: PlayerProfile[] = [];

    for (let i = 1; i <= 12; i++) {
      const profile = createProfile(`Profile ${i}`);
      profiles = upsertProfile(profiles, profile);
    }

    expect(profiles).toHaveLength(10);
    expect(profiles[0]?.name).toBe("Profile 3"); // First 2 removed (oldest first)
    expect(profiles[9]?.name).toBe("Profile 12");
  });

  it("should preserve order when updating existing profile", () => {
    const p1 = createProfile("Profile 1");
    const p2 = createProfile("Profile 2");
    const p3 = createProfile("Profile 3");

    let profiles = upsertProfile([], p1);
    profiles = upsertProfile(profiles, p2);
    profiles = upsertProfile(profiles, p3);

    const updated = { ...p2, name: "Profile 2 Updated" };
    profiles = upsertProfile(profiles, updated);

    expect(profiles[1]?.name).toBe("Profile 2 Updated");
    expect(profiles).toHaveLength(3);
  });
});

// ─── deleteProfile tests ──────────────────────────────────────────────────

describe("deleteProfile", () => {
  it("should delete a profile by id", () => {
    const p1 = createProfile("Profile 1");
    const p2 = createProfile("Profile 2");
    const p3 = createProfile("Profile 3");

    let profiles = [p1, p2, p3];

    profiles = deleteProfile(profiles, p2.id);

    expect(profiles).toHaveLength(2);
    expect(profiles.find((p) => p.id === p2.id)).toBeUndefined();
    expect(profiles.find((p) => p.id === p1.id)).toBeDefined();
    expect(profiles.find((p) => p.id === p3.id)).toBeDefined();
  });

  it("should not error when deleting non-existent profile", () => {
    const p1 = createProfile("Profile 1");
    const profiles = [p1];

    const result = deleteProfile(profiles, "non-existent-id");

    expect(result).toEqual(profiles);
  });

  it("should be a no-op if profile list is empty", () => {
    const result = deleteProfile([], "any-id");
    expect(result).toEqual([]);
  });
});

// ─── Active Profile tests ─────────────────────────────────────────────────

describe("loadActiveProfileId / saveActiveProfileId", () => {
  it("should return null when no active profile is set", () => {
    const id = loadActiveProfileId();
    expect(id).toBeNull();
  });

  it("should save and retrieve active profile id", () => {
    const testId = "test-profile-id";
    saveActiveProfileId(testId);

    const retrieved = loadActiveProfileId();
    expect(retrieved).toBe(testId);
  });

  it("should overwrite previous active profile id", () => {
    saveActiveProfileId("first-id");
    saveActiveProfileId("second-id");

    const retrieved = loadActiveProfileId();
    expect(retrieved).toBe("second-id");
  });
});

// ─── Import / Export tests ────────────────────────────────────────────────

describe("importProfileFromJson / exportProfile", () => {
  it("should return null for invalid JSON", () => {
    const result = importProfileFromJson("not json");
    expect(result).toBeNull();
  });

  it("should return null if stats or heroes missing", () => {
    const json = JSON.stringify({ name: "Test Profile" });
    const result = importProfileFromJson(json);
    expect(result).toBeNull();
  });

  it("should create a valid profile from JSON", () => {
    const original = createProfile("Original");
    const json = JSON.stringify(original);

    const imported = importProfileFromJson(json);

    expect(imported).not.toBeNull();
    expect(imported?.name).toBe("Original");
    expect(imported?.id).not.toBe(original.id); // New ID
    expect(imported?.stats).toEqual(original.stats);
  });

  it("should generate new ID on import", () => {
    const original = createProfile("Test");
    const originalId = original.id;

    const json = JSON.stringify(original);
    const imported = importProfileFromJson(json);

    expect(imported?.id).not.toBe(originalId);
  });

  it("should generate new timestamp on import", () => {
    const original = createProfile("Test");

    // Add a small delay to ensure timestamp changes
    const json = JSON.stringify(original);
    const before = new Date();
    const imported = importProfileFromJson(json);
    const after = new Date();

    // Timestamp should be between before and after
    const importedTime = new Date(imported?.createdAt as string);
    expect(importedTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(importedTime.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("should use provided name or default on import", () => {
    const original = createProfile("Custom Name");
    const json = JSON.stringify(original);

    const imported = importProfileFromJson(json);
    expect(imported?.name).toBe("Custom Name");

    // Test with no name
    const noName = {
      stats: defaultStats(),
      heroes: { inf: "None", cav: "None", arc: "None" },
    };
    const noNameImported = importProfileFromJson(JSON.stringify(noName));
    expect(noNameImported?.name).toBe("Imported Profile");
  });

  it("exportProfile should not error (side effect test)", () => {
    // exportProfile uses browser API, mock it
    const mockAnchor = document.createElement("a");
    const originalHref = Object.getOwnPropertyDescriptor(
      HTMLAnchorElement.prototype,
      "href",
    );
    const originalClick = mockAnchor.click;

    vi.spyOn(document, "createElement").mockReturnValue(mockAnchor);
    mockAnchor.click = vi.fn();
    globalThis.URL.revokeObjectURL = vi.fn();

    const profile = createProfile("Test Profile");

    // Should not throw
    expect(() => {
      exportProfile(profile);
    }).not.toThrow();

    // Restore
    if (originalHref) {
      Object.defineProperty(HTMLAnchorElement.prototype, "href", originalHref);
    }
    mockAnchor.click = originalClick;
  });
});

// ─── Default functions tests ──────────────────────────────────────────────

describe("default* functions", () => {
  it("defaultStats should return all zeros", () => {
    const stats = defaultStats();
    expect(stats.inf_atk).toBe(0);
    expect(stats.inf_let).toBe(0);
    expect(stats.cav_atk).toBe(0);
    expect(stats.cav_let).toBe(0);
    expect(stats.arc_atk).toBe(0);
    expect(stats.arc_let).toBe(0);
  });

  it("defaultWidgets should return all zeros", () => {
    const widgets = defaultWidgets();
    expect(widgets.inf_atk).toBe(0);
    expect(widgets.inf_let).toBe(0);
    expect(widgets.cav_atk).toBe(0);
    expect(widgets.cav_let).toBe(0);
    expect(widgets.arc_atk).toBe(0);
    expect(widgets.arc_let).toBe(0);
  });
});

// ─── validateProfile & migrateProfile tests ───────────────────────────────────

describe("validateProfile", () => {
  it("should return null for null or non-object inputs", () => {
    expect(validateProfile(null)).toBeNull();
    expect(validateProfile(undefined)).toBeNull();
    expect(validateProfile("string")).toBeNull();
    expect(validateProfile(42)).toBeNull();
  });

  it("should return null when stats or heroes are missing", () => {
    expect(validateProfile({ name: "Test" })).toBeNull();
    expect(validateProfile({ stats: defaultStats() })).toBeNull();
    expect(
      validateProfile({ heroes: { inf: "None", cav: "None", arc: "None" } }),
    ).toBeNull();
  });

  it("should return a valid PlayerProfile for a complete object", () => {
    const raw = {
      stats: defaultStats(),
      heroes: { inf: "None", cav: "None", arc: "None" },
      name: "Test Profile",
    };
    const result = validateProfile(raw);
    expect(result).not.toBeNull();
    expect(result?._version).toBe(CURRENT_PROFILE_VERSION);
    expect(result?.name).toBe("Test Profile");
  });

  it("should fill missing fields with defaults (migration v1 → v2)", () => {
    const v1Profile = {
      id: "old-id",
      name: "Old Profile",
      stats: defaultStats(),
      heroes: { inf: "None", cav: "None", arc: "None" },
      // Pas de widget_levels, govGear, staticBonuses, troops
    };
    const result = validateProfile(v1Profile);
    expect(result).not.toBeNull();
    expect(result?.widget_levels).toBeDefined();
    expect(result?.govGear).toBeDefined();
    expect(result?.staticBonuses).toBeDefined();
    expect(result?.troops).toBeDefined();
    expect(result?._version).toBe(CURRENT_PROFILE_VERSION);
  });
});

describe("migrateProfile", () => {
  it("should assign current version to migrated profile", () => {
    const raw = {
      stats: defaultStats(),
      heroes: { inf: "None", cav: "None", arc: "None" },
    };
    const result = migrateProfile(raw);
    expect(result._version).toBe(CURRENT_PROFILE_VERSION);
  });

  it("should generate an id if missing", () => {
    const raw = {
      stats: defaultStats(),
      heroes: { inf: "None", cav: "None", arc: "None" },
    };
    const result = migrateProfile(raw);
    expect(typeof result.id).toBe("string");
    expect(result.id.length).toBeGreaterThan(0);
  });

  it("should preserve existing id", () => {
    const raw = {
      id: "my-existing-id",
      stats: defaultStats(),
      heroes: { inf: "None", cav: "None", arc: "None" },
    };
    const result = migrateProfile(raw);
    expect(result.id).toBe("my-existing-id");
  });
});

describe("importProfileFromJson — corrupted input", () => {
  it("should return null for invalid JSON", () => {
    expect(importProfileFromJson("not json")).toBeNull();
    expect(importProfileFromJson("{broken")).toBeNull();
  });

  it("should return null for JSON primitives (not an object)", () => {
    expect(importProfileFromJson("42")).toBeNull(); // number
    expect(importProfileFromJson('"string"')).toBeNull(); // string  
    expect(importProfileFromJson("true")).toBeNull(); // boolean
    expect(importProfileFromJson("null")).toBeNull(); // null
  });

  it("should return null for JSON without required fields", () => {
    expect(importProfileFromJson(JSON.stringify({ name: "Only name" }))).toBeNull();
  });

  it("should not crash on a malformed but parseable object", () => {
    const malformed = JSON.stringify({ foo: "bar", baz: 42 });
    expect(importProfileFromJson(malformed)).toBeNull();
  });

  it("should assign a new id different from the original", () => {
    const original = createProfile("Original");
    const json = JSON.stringify(original);
    const imported = importProfileFromJson(json);
    expect(imported).not.toBeNull();
    expect(imported?.id).not.toBe(original.id);
  });
});

// ─── validateProfile — branch coverage (corrupted data) ────────────────────

describe("validateProfile - error handling (catch block)", () => {
  it("should return null for profile missing both stats and heroes", () => {
    const result = validateProfile({ name: "Invalid" });
    expect(result).toBeNull();
  });

  it("should return null when stats is null", () => {
    const result = validateProfile({ stats: null, heroes: {} });
    expect(result).toBeNull();
  });

  it("should return null when heroes is null", () => {
    const result = validateProfile({ stats: {}, heroes: null });
    expect(result).toBeNull();
  });

  it("should gracefully handle corrupted profile data", () => {
    // Profile with missing required nested fields
    const result = validateProfile({
      stats: {},  // Empty stats (will fail migration)
      heroes: {},  // Empty heroes  
      id: "test",
      name: "Corrupted",
    });
    // Should either migrate with defaults or return null
    expect(result === null || result?._version).toBeDefined();
  });
});

// ─── loadProfiles — branch coverage (corrupted localStorage) ───────────────

describe("loadProfiles - corrupted localStorage", () => {
  it("should return empty array when localStorage contains invalid JSON", () => {
    localStorage.setItem("ks_profiles", "{invalid json");
    const profiles = loadProfiles();
    expect(profiles).toEqual([]);
  });

  it("should filter out invalid profiles and keep valid ones", () => {
    const mixed = [
      createProfile("Valid 1"),
      { name: "Invalid - missing stats" },
      createProfile("Valid 2"),
      { name: "Invalid - missing heroes" },
    ];
    localStorage.setItem("ks_profiles", JSON.stringify(mixed));
    
    const profiles = loadProfiles();
    expect(profiles).toHaveLength(2);
    expect(profiles.map((p) => p.name)).toEqual(["Valid 1", "Valid 2"]);
  });

  it("should return empty array when localStorage has no profiles", () => {
    localStorage.removeItem("ks_profiles");
    const profiles = loadProfiles();
    expect(profiles).toEqual([]);
  });

  it("should handle localStorage.getItem returning null", () => {
    // This is implicit when item doesn't exist
    localStorage.removeItem("ks_profiles");
    expect(loadProfiles()).toEqual([]);
  });
});

// ─── defaultOwnedHeroData — branch coverage (default values) ───────────────

describe("defaultOwnedHeroData", () => {
  it("should return correct default owned hero data", () => {
    const data = defaultOwnedHeroData();
    expect(data.owned).toBe(false);
    expect(data.level).toBe(1);
    expect(data.stars).toBe(0);
    expect(data.starSubLevel).toBe(1);
    expect(data.widgetLevel).toBe(0);
    expect(data.gear).toBeDefined();
    expect(data.gear.helm.level).toBe(0);
    expect(data.gear.gloves.masteryLevel).toBe(0);
  });
});

// ─── migrateProfile — nullish coalescing branches ──────────────────────────────

describe("migrateProfile - nullish coalescing branches", () => {
  it("should use defaultStats when stats is undefined or null (branch: ?? defaultStats())", () => {
    const raw: Record<string, unknown> = {
      stats: undefined, // undefined triggers ??
      heroes: { inf: "None", cav: "None", arc: "None" },
      id: "test-id",
      name: "Test",
      createdAt: "2024-01-01",
    };
    const result = migrateProfile(raw);
    expect(result.stats).toBeDefined();
    expect(result.stats.inf_atk).toBe(0); // defaultStats() was used
  });

  it("should use default heroes when heroes is undefined or null (branch: ?? {...})", () => {
    const raw: Record<string, unknown> = {
      stats: { inf_atk: 0, inf_let: 0, cav_atk: 0, cav_let: 0, arc_atk: 0, arc_let: 0 },
      heroes: undefined, // undefined triggers ??
      id: "test-id",
      name: "Test",
      createdAt: "2024-01-01",
    };
    const result = migrateProfile(raw);
    expect(result.heroes).toBeDefined();
    expect(result.heroes.inf).toBe("None"); // default heroes was used
  });
});

// ─── validateProfile — object type checking (branch coverage) ──────────────────

describe("validateProfile - object type checking", () => {
  it("should accept valid objects and proceed to validation (branch: typeof data === object)", () => {
    const profile = createProfile("Test");
    const result = validateProfile(profile);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Test");
  });

  it("should reject non-objects (branch: !data || typeof data !== object)", () => {
    expect(validateProfile(null)).toBeNull();
    expect(validateProfile(undefined)).toBeNull();
    expect(validateProfile("string")).toBeNull();
    expect(validateProfile(123)).toBeNull();
    expect(validateProfile([])).toBeNull();
  });
});
