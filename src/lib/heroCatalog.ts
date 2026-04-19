/**
 * heroCatalog.ts — Source de vérité pour les métadonnées UI des héros.
 *
 * Centralise les chemins d'images, noms de widgets, groupes d'affichage
 * et helpers de tri / filtrage utilisés dans toute l'application.
 *
 * Les données métier (HERO_DB, listes de leads/joiners) restent dans heroes.ts.
 */

import { HERO_DB } from "./heroes";
import type { HeroName } from "../types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ─── Images héros ─────────────────────────────────────────────────────────────

export const HERO_IMG: Partial<Record<HeroName, string>> = {
  Amadeus: `${BASE}/heroes/amadeus.webp`,
  Helga: `${BASE}/heroes/helga.webp`,
  Zoe: `${BASE}/heroes/zoe.webp`,
  Eric: `${BASE}/heroes/eric.webp`,
  Alcar: `${BASE}/heroes/alcar.webp`,
  Howard: `${BASE}/heroes/howard.webp`,
  Seth: `${BASE}/heroes/seth.webp`,
  Forrest: `${BASE}/heroes/forrest.webp`,
  Longfei: `${BASE}/heroes/longfei.webp`,
  Jabel: `${BASE}/heroes/jabel.webp`,
  Hilde: `${BASE}/heroes/hilde.webp`,
  Petra: `${BASE}/heroes/petra.webp`,
  Margot: `${BASE}/heroes/margot.webp`,
  Gordon: `${BASE}/heroes/gordon.webp`,
  Chenko: `${BASE}/heroes/chenko.webp`,
  Fahd: `${BASE}/heroes/fahd.webp`,
  Edwin: `${BASE}/heroes/edwin.webp`,
  Thrud: `${BASE}/heroes/thrud.webp`,
  Saul: `${BASE}/heroes/saul.webp`,
  Marlin: `${BASE}/heroes/marlin.webp`,
  Jaeger: `${BASE}/heroes/jaeger.webp`,
  Rosa: `${BASE}/heroes/rosa.webp`,
  Vivian: `${BASE}/heroes/vivian.webp`,
  Quinn: `${BASE}/heroes/quinn.webp`,
  Amane: `${BASE}/heroes/amane.webp`,
  Yeonwoo: `${BASE}/heroes/yeonwoo.webp`,
  Diana: `${BASE}/heroes/diana.webp`,
  Olive: `${BASE}/heroes/olive.webp`,
};

// ─── Widgets (Exclusive Gear) ─────────────────────────────────────────────────

/** Héros disposant d'un widget (Exclusive Gear) avec effet de raid */
export const GX_HEROES: HeroName[] = [
  "Amadeus",
  "Helga",
  "Jabel",
  "Saul",
  "Hilde",
  "Zoe",
  "Marlin",
  "Eric",
  "Petra",
  "Jaeger",
  "Alcar",
  "Margot",
  "Rosa",
  "Thrud",
  "Longfei",
  "Vivian",
];

export const WIDGET_IMG: Partial<Record<HeroName, string>> = Object.fromEntries(
  GX_HEROES.map((h) => [h, `${BASE}/widgets/${h.toLowerCase()}.webp`]),
);

export const WIDGET_NAME: Partial<Record<HeroName, string>> = {
  Amadeus: "Aegis of Fate",
  Helga: "Bands of Tyre",
  Jabel: "Greaves of Faith",
  Saul: "Rabbitgear Cannon",
  Hilde: "Revelation",
  Zoe: "The Unrighteous",
  Marlin: "Mistweaver",
  Eric: "Anvil of Truth",
  Petra: "Fate's Writ",
  Jaeger: "Wanderwail",
  Alcar: "Praetorian Guard",
  Margot: "Revel Fang",
};

// ─── Groupes d'affichage ──────────────────────────────────────────────────────

export const HERO_GROUPS: {
  label: string;
  accent: string;
  heroes: HeroName[];
}[] = [
  {
    label: "Infantry",
    accent: "text-red-400",
    heroes: [
      "Amadeus",
      "Helga",
      "Zoe",
      "Eric",
      "Alcar",
      "Longfei",
      "Howard",
      "Seth",
      "Forrest",
    ],
  },
  {
    label: "Cavalry",
    accent: "text-yellow-400",
    heroes: [
      "Jabel",
      "Hilde",
      "Petra",
      "Margot",
      "Thrud",
      "Gordon",
      "Chenko",
      "Fahd",
      "Edwin",
    ],
  },
  {
    label: "Archers",
    accent: "text-blue-400",
    heroes: [
      "Saul",
      "Marlin",
      "Jaeger",
      "Rosa",
      "Vivian",
      "Quinn",
      "Amane",
      "Yeonwoo",
      "Diana",
      "Olive",
    ],
  },
];

// ─── Ordre de tri par génération ──────────────────────────────────────────────

/** Convertit une génération héros en ordre numérique pour le tri. */
export function heroGenOrder(gen: string | number | null): number {
  if (gen === "rare") return 0;
  if (gen === "epic") return 1;
  if (gen === null) return 99;
  const n = Number(gen);
  return Number.isNaN(n) ? 99 : n + 1; // S1→2, S2→3, …, S5→6
}

/** Tous les héros triés : Rare → Epic → S1 → S2 → S3 → S4 → S5, puis alpha */
export const ALL_HEROES_SORTED: HeroName[] = (
  Object.keys(HERO_DB) as HeroName[]
)
  .filter((n) => n !== "None" && n !== "Other")
  .sort((a, b) => {
    const ga = heroGenOrder(HERO_DB[a].generation);
    const gb = heroGenOrder(HERO_DB[b].generation);
    if (ga !== gb) return ga - gb;
    return a.localeCompare(b);
  });

// ─── Badges de génération ─────────────────────────────────────────────────────

export const GEN_BADGE: Record<string, { label: string; bg: string }> = {
  "1": { label: "S1", bg: "bg-orange-500" },
  "2": { label: "S2", bg: "bg-orange-500" },
  "3": { label: "S3", bg: "bg-orange-500" },
  "4": { label: "S4", bg: "bg-orange-500" },
  "5": { label: "S5", bg: "bg-orange-500" },
  "6": { label: "S6", bg: "bg-orange-500" },
  epic: { label: "Epic", bg: "bg-purple-600" },
  rare: { label: "Rare", bg: "bg-sky-700" },
};
