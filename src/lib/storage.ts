import type {
  PlayerProfile,
  TroopStats,
  WidgetStats,
  WidgetLevels,
  OwnedHeroData,
  HeroGearSlot,
  GovGearData,
  StaticBonuses,
  TroopInventory,
  TroopLevel,
} from "../types";
import { TROOP_LEVELS } from "../types";

const PROFILES_KEY = "ks_profiles";
const ACTIVE_KEY = "ks_active_profile";
const MAX_PROFILES = 10;

/** Version courante du format de profil. Incrémenter à chaque changement de schéma. */
export const CURRENT_PROFILE_VERSION = 2;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultWidgetLevels(): WidgetLevels {
  return { inf: 0, cav: 0, arc: 0 };
}

function defaultHeroGear(): Record<
  HeroGearSlot,
  { level: number; masteryLevel: number }
> {
  return {
    helm: { level: 0, masteryLevel: 0 },
    gloves: { level: 0, masteryLevel: 0 },
    shroud: { level: 0, masteryLevel: 0 },
    greaves: { level: 0, masteryLevel: 0 },
  };
}

function defaultGovGear(): GovGearData {
  return { helm: 0, gloves: 0, shroud: 0, greaves: 0 };
}

function defaultStaticBonuses(): StaticBonuses {
  return {
    squad_atk: 0,
    squad_def: 0,
    squad_let: 0,
    squad_hp: 0,
    inf_atk: 0,
    inf_def: 0,
    inf_let: 0,
    inf_hp: 0,
    cav_atk: 0,
    cav_def: 0,
    cav_let: 0,
    cav_hp: 0,
    arc_atk: 0,
    arc_def: 0,
    arc_let: 0,
    arc_hp: 0,
  };
}

function defaultTroops(): TroopInventory {
  const emptyTierRecord = () =>
    Object.fromEntries(TROOP_LEVELS.map((l) => [l, 0])) as Record<
      TroopLevel,
      number
    >;
  return {
    inf: emptyTierRecord(),
    cav: emptyTierRecord(),
    arc: emptyTierRecord(),
  };
}

// ─── Profile CRUD ─────────────────────────────────────────────────────────────

// ─── Migration & Validation ──────────────────────────────────────────────────

/**
 * Migre un profil brut (version inconnue) vers la version courante.
 * Chaque migration est appliquée séquentiellement.
 */
export function migrateProfile(raw: Record<string, unknown>): PlayerProfile {
  // v1 → v2 : ajout de widget_levels, ownedHeroes, govGear, govCharmLevel, staticBonuses, troops
  const v2: PlayerProfile = {
    _version: CURRENT_PROFILE_VERSION,
    id: typeof raw.id === "string" ? raw.id : generateId(),
    name: typeof raw.name === "string" ? raw.name : "My Profile",
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : new Date().toISOString(),
    stats: (raw.stats as PlayerProfile["stats"]) ?? defaultStats(),
    widgets: (raw.widgets as PlayerProfile["widgets"]) ?? defaultWidgets(),
    widget_levels:
      (raw.widget_levels as PlayerProfile["widget_levels"]) ??
      defaultWidgetLevels(),
    heroes: (raw.heroes as PlayerProfile["heroes"]) ?? {
      inf: "None",
      cav: "None",
      arc: "None",
    },
    troop_tier: (raw.troop_tier as PlayerProfile["troop_tier"]) ?? "T10",
    tg_level: (raw.tg_level as PlayerProfile["tg_level"]) ?? 0,
    rally_capacity:
      typeof raw.rally_capacity === "number" ? raw.rally_capacity : 2_000_000,
    ownedHeroes: (raw.ownedHeroes as PlayerProfile["ownedHeroes"]) ?? {},
    govGear: (raw.govGear as PlayerProfile["govGear"]) ?? defaultGovGear(),
    govCharmLevel:
      typeof raw.govCharmLevel === "number" ? raw.govCharmLevel : 0,
    staticBonuses:
      (raw.staticBonuses as PlayerProfile["staticBonuses"]) ??
      defaultStaticBonuses(),
    troops: (raw.troops as PlayerProfile["troops"]) ?? defaultTroops(),
  };
  return v2;
}

/**
 * Valide et migre un objet inconnu en PlayerProfile.
 * Retourne null si l'objet ne ressemble pas à un profil valide.
 */
export function validateProfile(data: unknown): PlayerProfile | null {
  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  // Champs minimaux obligatoires
  if (!raw.stats || !raw.heroes) return null;
  try {
    return migrateProfile(raw);
  } catch {
    return null;
  }
}

export function loadProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const profiles = raw ? (JSON.parse(raw) as unknown[]) : [];
    return profiles
      .map((p) => validateProfile(p))
      .filter((p): p is PlayerProfile => p !== null);
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: PlayerProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function createProfile(name: string): PlayerProfile {
  return {
    _version: CURRENT_PROFILE_VERSION,
    id: generateId(),
    name: name || "My Profile",
    createdAt: new Date().toISOString(),
    stats: defaultStats(),
    widgets: defaultWidgets(),
    widget_levels: defaultWidgetLevels(),
    heroes: { inf: "None", cav: "None", arc: "None" },
    troop_tier: "T10",
    tg_level: 0,
    rally_capacity: 2_000_000,
    ownedHeroes: {},
    govGear: defaultGovGear(),
    govCharmLevel: 0,
    staticBonuses: defaultStaticBonuses(),
    troops: defaultTroops(),
  };
}

export function upsertProfile(
  profiles: PlayerProfile[],
  profile: PlayerProfile,
): PlayerProfile[] {
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    const next = [...profiles];
    next[idx] = profile;
    return next;
  }
  if (profiles.length >= MAX_PROFILES) {
    // Remove the oldest if at limit
    return [...profiles.slice(1), profile];
  }
  return [...profiles, profile];
}

export function deleteProfile(
  profiles: PlayerProfile[],
  id: string,
): PlayerProfile[] {
  return profiles.filter((p) => p.id !== id);
}

// ─── Active Profile ───────────────────────────────────────────────────────────

export function loadActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportProfile(profile: PlayerProfile): void {
  const json = JSON.stringify(profile, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kingshot-profile-${profile.name.replace(/\s+/g, "_")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importProfileFromJson(json: string): PlayerProfile | null {
  try {
    const obj = JSON.parse(json) as unknown;
    if (!obj || typeof obj !== "object") return null;
    const raw = obj as Record<string, unknown>;
    const profile = validateProfile(obj);
    if (!profile) return null;
    return {
      ...profile,
      // Utiliser "Imported Profile" si aucun nom n'était fourni dans le JSON source
      name:
        typeof raw.name === "string" && raw.name
          ? raw.name
          : "Imported Profile",
      id: generateId(), // toujours un nouvel ID à l'import
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export function defaultStats(): TroopStats {
  return {
    inf_atk: 0,
    inf_let: 0,
    cav_atk: 0,
    cav_let: 0,
    arc_atk: 0,
    arc_let: 0,
  };
}

export function defaultWidgets(): WidgetStats {
  return {
    inf_atk: 0,
    inf_let: 0,
    cav_atk: 0,
    cav_let: 0,
    arc_atk: 0,
    arc_let: 0,
  };
}

export function defaultOwnedHeroData(): OwnedHeroData {
  return {
    owned: false,
    level: 1,
    stars: 0,
    starSubLevel: 1,
    widgetLevel: 0,
    gear: defaultHeroGear(),
  };
}
