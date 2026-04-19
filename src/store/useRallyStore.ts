import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  PlayerProfile,
  RallyConfig,
  FormationResult,
  JoinerSlot,
} from "../types";
import {
  loadProfiles,
  saveProfiles,
  loadActiveProfileId,
  saveActiveProfileId,
  createProfile,
  upsertProfile,
  deleteProfile,
  defaultStats,
  defaultWidgets,
} from "../lib/storage";
import { computeFormation } from "../lib/formulas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RallyStore {
  // ── Profiles ──────────────────────────────────────────────────────────────
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  activeProfile: PlayerProfile | null;

  // ── Rally Configuration ───────────────────────────────────────────────────
  rallyConfig: RallyConfig;

  // ── Computed Result ───────────────────────────────────────────────────────
  result: FormationResult | null;

  // ── UI ────────────────────────────────────────────────────────────────────
  activeView: "profiles" | "bear-trap" | "user-data";
  activeTab: "formation" | "participants" | "guide";
  userDataTab: "heroes" | "gov-gear" | "static-stats" | "troops";

  // ── Profile Actions ───────────────────────────────────────────────────────
  newProfile: (name: string) => void;
  selectProfile: (id: string) => void;
  /** Mettre à jour le profil actif. Ne pas utiliser pour l'import externe — utiliser importProfile à la place. */
  updateProfile: (partial: Partial<PlayerProfile>) => void;
  /** Importer un profil depuis l'extérieur (JSON). L'ajoute à la liste et le sélectionne. */
  importProfile: (profile: PlayerProfile) => void;
  removeProfile: (id: string) => void;

  // ── Rally Actions ─────────────────────────────────────────────────────────
  setRallyConfig: (partial: Partial<RallyConfig>) => void;
  setJoiner: (slot: 0 | 1 | 2 | 3, update: Partial<JoinerSlot>) => void;

  // ── UI Actions ────────────────────────────────────────────────────────────
  setActiveView: (view: RallyStore["activeView"]) => void;
  setActiveTab: (tab: RallyStore["activeTab"]) => void;
  setUserDataTab: (tab: RallyStore["userDataTab"]) => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const DEFAULT_RALLY: RallyConfig = {
  capacity: 2_000_000,
  participants: 15,
  bearLevel: 5,
  joiners: [
    { hero: "Amane", skillLevel: 5 },
    { hero: "Chenko", skillLevel: 5 },
    { hero: "Yeonwoo", skillLevel: 5 },
    { hero: "None", skillLevel: 5 },
  ],
};

function computeResult(
  profile: PlayerProfile | null,
  config: RallyConfig,
): FormationResult | null {
  if (!profile) return null;
  return computeFormation(
    profile.stats,
    profile.widgets,
    profile.troop_tier,
    profile.tg_level,
    config.capacity,
    config.participants,
    config.joiners,
  );
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useRallyStore = create<RallyStore>()(
  subscribeWithSelector((set, get) => {
    // Load persisted data
    const profiles = loadProfiles();
    const savedActiveId = loadActiveProfileId();

    // Bootstrap: if no profiles exist, create a default one
    const initialProfiles =
      profiles.length > 0 ? profiles : [createProfile("My Profile")];

    if (profiles.length === 0) {
      saveProfiles(initialProfiles);
    }

    const activeId =
      savedActiveId && initialProfiles.find((p) => p.id === savedActiveId)
        ? savedActiveId
        : initialProfiles.at(0)?.id;

    if (!activeId) {
      throw new Error("Unable to set active profile ID");
    }

    const activeProfile =
      initialProfiles.find((p) => p.id === activeId) ?? initialProfiles.at(0);
    if (!activeProfile) throw new Error("Unable to find active profile");

    return {
      profiles: initialProfiles,
      activeProfileId: activeId,
      activeProfile,
      // Load capacity from the persisted profile (fallback to default)
      rallyConfig: {
        ...DEFAULT_RALLY,
        capacity: activeProfile.rally_capacity ?? DEFAULT_RALLY.capacity,
      },
      result: computeResult(activeProfile, {
        ...DEFAULT_RALLY,
        capacity: activeProfile.rally_capacity ?? DEFAULT_RALLY.capacity,
      }),
      activeView: "user-data" as const,
      activeTab: "formation" as const,
      userDataTab: "heroes" as const,

      // ── Profile Actions ─────────────────────────────────────────────────
      newProfile: (name: string) => {
        const profile = createProfile(name);
        const profiles = upsertProfile(get().profiles, profile);
        saveProfiles(profiles);
        saveActiveProfileId(profile.id);
        set({
          profiles,
          activeProfileId: profile.id,
          activeProfile: profile,
          result: computeResult(profile, get().rallyConfig),
        });
      },

      selectProfile: (id: string) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (!profile) return;
        saveActiveProfileId(id);
        // Restore the capacity saved in this profile
        const config = {
          ...get().rallyConfig,
          capacity: profile.rally_capacity ?? get().rallyConfig.capacity,
        };
        set({
          activeProfileId: id,
          activeProfile: profile,
          rallyConfig: config,
          result: computeResult(profile, config),
        });
      },

      updateProfile: (partial: Partial<PlayerProfile>) => {
        const current = get().activeProfile;
        if (!current) return;
        const updated: PlayerProfile = { ...current, ...partial };
        const profiles = upsertProfile(get().profiles, updated);
        saveProfiles(profiles);
        set({
          profiles,
          activeProfile: updated,
          result: computeResult(updated, get().rallyConfig),
        });
      },

      importProfile: (profile: PlayerProfile) => {
        const profiles = upsertProfile(get().profiles, profile);
        saveProfiles(profiles);
        saveActiveProfileId(profile.id);
        const config = {
          ...get().rallyConfig,
          capacity: profile.rally_capacity ?? get().rallyConfig.capacity,
        };
        set({
          profiles,
          activeProfileId: profile.id,
          activeProfile: profile,
          rallyConfig: config,
          result: computeResult(profile, config),
        });
      },

      removeProfile: (id: string) => {
        const profiles = deleteProfile(get().profiles, id);
        // Ensure at least one profile exists
        const finalProfiles =
          profiles.length > 0 ? profiles : [createProfile("My Profile")];
        if (profiles.length === 0) saveProfiles(finalProfiles);
        else saveProfiles(finalProfiles);

        const newActive = finalProfiles.at(0);
        if (!newActive) throw new Error("Unable to create profile");
        saveActiveProfileId(newActive.id);
        set({
          profiles: finalProfiles,
          activeProfileId: newActive.id,
          activeProfile: newActive,
          result: computeResult(newActive, get().rallyConfig),
        });
      },

      // ── Rally Actions ───────────────────────────────────────────────────
      setRallyConfig: (partial: Partial<RallyConfig>) => {
        const config = { ...get().rallyConfig, ...partial };
        // If capacity changed, persist it in the active profile
        const current = get().activeProfile;
        let activeProfile = current;
        if (partial.capacity !== undefined && current) {
          const updated: PlayerProfile = {
            ...current,
            rally_capacity: partial.capacity,
          };
          const profiles = upsertProfile(get().profiles, updated);
          saveProfiles(profiles);
          activeProfile = updated;
        }
        set({
          rallyConfig: config,
          activeProfile,
          result: computeResult(activeProfile, config),
        });
      },

      setJoiner: (slot: 0 | 1 | 2 | 3, update: Partial<JoinerSlot>) => {
        const joiners = [
          ...get().rallyConfig.joiners,
        ] as RallyConfig["joiners"];
        joiners[slot] = { ...joiners[slot], ...update };
        const config = { ...get().rallyConfig, joiners };
        set({
          rallyConfig: config,
          result: computeResult(get().activeProfile, config),
        });
      },

      // ── UI Actions ──────────────────────────────────────────────────────
      setActiveView: (view) => set({ activeView: view }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setUserDataTab: (tab) => set({ userDataTab: tab }),
    };
  }),
);

// ─── Derived Selectors ────────────────────────────────────────────────────────

export const selectStats = (s: RallyStore) =>
  s.activeProfile?.stats ?? defaultStats();
export const selectWidgets = (s: RallyStore) =>
  s.activeProfile?.widgets ?? defaultWidgets();
export const selectTier = (s: RallyStore) =>
  s.activeProfile?.troop_tier ?? "T10";
export const selectTG = (s: RallyStore) => s.activeProfile?.tg_level ?? 0;
