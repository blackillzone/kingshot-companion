// ─── Troop Types ─────────────────────────────────────────────────────────────
export type TroopType = 'inf' | 'cav' | 'arc';

export type TroopTier = 'T1-T6' | 'T7-T9' | 'T10' | 'T11';

export type TGLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// ─── Hero Types ───────────────────────────────────────────────────────────────
export type HeroName =
  | 'None'
  | 'Other'
  // Infantry lead heroes
  | 'Amadeus'
  | 'Zoe'
  | 'Hilde'
  | 'Eric'
  | 'Alcar'
  | 'Margot'
  | 'Rosa'
  | 'Howard'
  | 'Longfei'
  | 'Thrud'
  // Cavalry lead heroes
  | 'Jabel'
  | 'Petra'
  | 'Saul'
  | 'Gordon'
  | 'Helga'
  | 'Edwin'
  | 'Jaeger'
  | 'Fahd'
  // Archery lead heroes
  | 'Marlin'
  | 'Quinn'
  | 'Vivian'
  // Joiner / universal heroes
  | 'Amane'
  | 'Chenko'
  | 'Yeonwoo'
  | 'Diana'
  | 'Forrest'
  | 'Seth'
  | 'Olive';

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Global stats per troop type (ATK% and LET% as entered by the player) */
export interface TroopStats {
  inf_atk: number;
  inf_let: number;
  cav_atk: number;
  cav_let: number;
  arc_atk: number;
  arc_let: number;
}

/** Widget bonus per troop type (optional, added on top of global stats) */
export interface WidgetStats {
  inf_atk: number;
  inf_let: number;
  cav_atk: number;
  cav_let: number;
  arc_atk: number;
  arc_let: number;
}

/** Widget gear level per troop type (0 = not owned, 1–10) */
export interface WidgetLevels {
  inf: number;
  cav: number;
  arc: number;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface PlayerProfile {
  id: string;
  name: string;
  createdAt: string;
  stats: TroopStats;
  widgets: WidgetStats;
  heroes: {
    inf: HeroName;
    cav: HeroName;
    arc: HeroName;
  };
  troop_tier: TroopTier;
  tg_level: TGLevel;
  /** Rally capacity saved per profile (default: 2 000 000) */
  rally_capacity: number;
  /** Exclusive gear widget level per troop type (0 = not owned, 1–10) */
  widget_levels: WidgetLevels;
}

// ─── Joiner Slot ─────────────────────────────────────────────────────────────
export type SkillLevel = 1 | 2 | 3 | 4 | 5;

/** One joiner participant: which hero they bring and at what skill level */
export interface JoinerSlot {
  hero: HeroName;
  skillLevel: SkillLevel;
}

// ─── Rally Config ─────────────────────────────────────────────────────────────
export interface RallyConfig {
  /** Total troop capacity of the rally */
  capacity: number;
  /** Number of participants (1–15), equal split */
  participants: number;
  /** Bear Trap level (0–5). Default: 5 */
  bearLevel: 0 | 1 | 2 | 3 | 4 | 5;
  /** Up to 4 joiner heroes with their skill level */
  joiners: [JoinerSlot, JoinerSlot, JoinerSlot, JoinerSlot];
}

// ─── Calculation Results ──────────────────────────────────────────────────────
export interface OptimalRatio {
  inf: number; // 0–1
  cav: number; // 0–1
  arc: number; // 0–1
}

export interface TroopDistribution {
  troopsPerParticipant: number;
  inf: number;
  cav: number;
  arc: number;
  totalInf: number;
  totalCav: number;
  totalArc: number;
  total: number;
}

export interface FormationResult {
  ratio: OptimalRatio;
  distribution: TroopDistribution;
  damageScore: number;
  naiveScore: number;    // equal 33/33/33 for comparison
  maxScore: number;      // theoretical max (same as damageScore at optimal)
}

// ─── Participant Optimizer ───────────────────────────────────────────────────
export interface ParticipantDataPoint {
  participants: number;
  damageScore: number;
  troopsPerParticipant: number;
  fillRate: number; // 0–1, how well the rally is filled
}
