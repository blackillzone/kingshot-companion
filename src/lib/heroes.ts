import type { HeroName, TroopType, JoinerSlot } from '../types';

/**
 * Widget exclusive gear expedition skill effect relevant to rally:
 * 'rally_atk' – increases Rally troops' ATK%
 * 'rally_let' – increases Rally troops' LET%
 * 'none'      – no rally-relevant widget (defender/health/defense type or no gear)
 */
export type HeroWidgetEffect = 'rally_atk' | 'rally_let' | 'none';

/**
 * 'atk_all'  – adds X% Attack to ALL troop types (Amane "Tri Phalanx")
 * 'let_all'  – adds X% Lethality to ALL troop types (Chenko, Yeonwoo, Amadeus)
 * 'none'     – no modeled combat effect
 */
export type JoinerBonusType = 'atk_all' | 'let_all' | 'none';

export interface HeroData {
  name: HeroName;
  type: TroopType | 'universal';
  /** ATK% bonus contributed to troops of this hero's type (lead hero, level-5 value) */
  atk_bonus: number;
  /** LET% bonus contributed to troops of this hero's type (lead hero, level-5 value) */
  let_bonus: number;
  /**
   * For joiner heroes: bonus at each skill level [lv1, lv2, lv3, lv4, lv5].
   * Interpretation depends on bonus_type.
   */
  skill_bonuses: [number, number, number, number, number];
  /** How the joiner bonus is applied in calculations */
  bonus_type: JoinerBonusType;
  /**
   * Exclusive gear expedition skill – what the widget adds to rally troops.
   * Used to pre-fill/constrain the widget input in the stats form.
   */
  widget_effect: HeroWidgetEffect;
  /** Hero generation: 1–6 = Mythic generation, 'epic' = Epic tier, 'rare' = Rare tier, null = placeholder */
  generation: number | 'epic' | 'rare' | null;
  /** Hero's key skill name */
  skill: string;
  /** Short description */
  description: string;
}

/**
 * Hero database sourced from Frakinator + Kingshot Simulator references.
 * ATK/LET bonuses for lead heroes are skill-level-5 values.
 * skill_bonuses for joiner heroes are [lv1, lv2, lv3, lv4, lv5] values sourced from game data.
 *
 * For v1: bonuses are additive to the global stats the player enters.
 *
 * NOTE: "None" and "Other" represent absent or uncoded heroes.
 * "Other" means the hero has a contribution not modeled, so no bonus is applied.
 */
export const HERO_DB: Record<HeroName, HeroData> = {
  None: {
    name: 'None', type: 'universal',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: null,
    skill: '—', description: 'No hero selected',
  },
  Other: {
    name: 'Other', type: 'universal',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: null,
    skill: '—', description: 'Hero not in database — enter stats manually',
  },

  // ─── Infantry Lead Heroes ─────────────────────────────────────────────────
  Amadeus: {
    name: 'Amadeus', type: 'inf',
    atk_bonus: 165.3, let_bonus: 131.1,
    skill_bonuses: [5, 10, 15, 20, 25], bonus_type: 'let_all',
    widget_effect: 'rally_atk', // "Discernment" – Rally Attack +15%
    generation: 1,
    skill: 'Way of the Blade', description: '+ATK & +LET to infantry (lead) · +LET% all troops (joiner)',
  },
  Zoe: {
    name: 'Zoe', type: 'inf',
    atk_bonus: 0, let_bonus: 150,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Defender Attack" – not rally-relevant
    generation: 2,
    skill: 'Unbreakable', description: '+LET to infantry troops',
  },
  Hilde: {
    name: 'Hilde', type: 'cav',
    atk_bonus: 120, let_bonus: 120,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Fortitude" – Defender Health
    generation: 2,
    skill: 'Shield Maiden', description: '+ATK & +LET to cavalry troops',
  },
  Eric: {
    name: 'Eric', type: 'inf',
    atk_bonus: 100, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // Defender Defense
    generation: 3,
    skill: 'Battle Surge', description: '+ATK to infantry troops',
  },
  Alcar: {
    name: 'Alcar', type: 'inf',
    atk_bonus: 0, let_bonus: 180,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Vow of Honor" – Defender Health
    generation: 4,
    skill: 'Troop Bane', description: '+LET to infantry troops',
  },
  Margot: {
    name: 'Margot', type: 'cav',
    atk_bonus: 0, let_bonus: 160,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Pugilist" – Defender Lethality (not rally)
    generation: 4,
    skill: 'Lethal Edge', description: '+LET to cavalry troops',
  },
  Rosa: {
    name: 'Rosa', type: 'arc',
    atk_bonus: 140, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'rally_let', // "Perihelion" – Rally Lethality +15%
    generation: 4,
    skill: "War's Embrace", description: '+ATK to archery troops',
  },
  Howard: {
    name: 'Howard', type: 'inf',
    atk_bonus: 80, let_bonus: 80,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // Epic hero – no exclusive gear
    generation: 'epic',
    skill: 'Iron Resolve', description: '+ATK & +LET to infantry troops',
  },
  Longfei: {
    name: 'Longfei', type: 'inf',
    atk_bonus: 100, let_bonus: 100,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Strategic Strike" – Defender Attack (not rally)
    generation: 5,
    skill: 'Dragon Strike', description: '+ATK & +LET to infantry troops',
  },
  Thrud: {
    name: 'Thrud', type: 'cav',
    atk_bonus: 90, let_bonus: 110,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'rally_let', // "Wolf-Kissed" – Rally Lethality +15%
    generation: 5,
    skill: "Thunder's Call", description: '+ATK & +LET to cavalry troops',
  },

  // ─── Cavalry Lead Heroes ──────────────────────────────────────────────────
  Jabel: {
    name: 'Jabel', type: 'cav',
    atk_bonus: 200.16, let_bonus: 125,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Divine Strength" – Defender Lethality (not rally)
    generation: 1,
    skill: "Hero's Domain", description: '+ATK & +LET to cavalry troops',
  },
  Petra: {
    name: 'Petra', type: 'cav',
    atk_bonus: 0, let_bonus: 200,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'rally_atk', // "Cosmic Eye" – Rally Attack +15%
    generation: 3,
    skill: 'Lancer Mastery', description: '+LET to cavalry troops',
  },
  Saul: {
    name: 'Saul', type: 'arc',
    atk_bonus: 150, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Defend to Attack" – Defender Attack (not rally)
    generation: 1,
    skill: 'Charge', description: '+ATK to archery troops',
  },
  Gordon: {
    name: 'Gordon', type: 'cav',
    atk_bonus: 120, let_bonus: 120,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // Epic hero – no exclusive gear
    generation: 'epic',
    skill: 'War Charge', description: '+ATK & +LET to cavalry troops',
  },
  Helga: {
    name: 'Helga', type: 'inf',
    atk_bonus: 0, let_bonus: 160,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'rally_let', // "Zeal" – Rally Lethality +15%
    generation: 1,
    skill: 'Zeal', description: '+LET to infantry troops',
  },
  Edwin: {
    name: 'Edwin', type: 'cav',
    atk_bonus: 130, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // Rare hero – no exclusive gear
    generation: 'rare',
    skill: "Knight's Will", description: '+ATK to cavalry troops',
  },
  Jaeger: {
    name: 'Jaeger', type: 'arc',
    atk_bonus: 100, let_bonus: 100,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // "Hymn to Survival" – Defender Health
    generation: 3,
    skill: 'Hunter Charge', description: '+ATK & +LET to archery troops',
  },
  Fahd: {
    name: 'Fahd', type: 'cav',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: 'epic',
    skill: 'Desert Eclipse', description: 'No modeled joiner effect',
  },

  // ─── Archery Lead Heroes ──────────────────────────────────────────────────
  Marlin: {
    name: 'Marlin', type: 'arc',
    atk_bonus: 199.02, let_bonus: 159,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'rally_let', // "Admiral of the Line" – Rally Lethality +15%
    generation: 2,
    skill: 'Dynamo', description: '+ATK & +LET to archery troops',
  },
  Quinn: {
    name: 'Quinn', type: 'arc',
    atk_bonus: 150, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // Epic hero – no exclusive gear
    generation: 'epic',
    skill: 'Marksman', description: '+ATK to archery troops',
  },
  Vivian: {
    name: 'Vivian', type: 'arc',
    atk_bonus: 100, let_bonus: 150,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none', // Defender Defense widget (not rally)
    generation: 5,
    skill: 'Crouching Tiger', description: '+ATK & +LET to archery troops',
  },

  // ─── Joiner / Universal Heroes ────────────────────────────────────────────
  // Amane "Tri Phalanx": +ATK% to ALL troop types — game data
  Amane: {
    name: 'Amane', type: 'arc',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [5, 10, 15, 20, 25], bonus_type: 'atk_all',
    widget_effect: 'none',
    generation: 'epic',
    skill: 'Tri Phalanx', description: '+ATK% to ALL troop types (lv5: +25%)',
  },
  // Chenko "Stand of Arms": +LET% to ALL troop types — game data
  Chenko: {
    name: 'Chenko', type: 'cav',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [5, 10, 15, 20, 25], bonus_type: 'let_all',
    widget_effect: 'none',
    generation: 'epic',
    skill: 'Stand of Arms', description: '+LET% to ALL troop types (lv5: +25%)',
  },
  // Yeonwoo "On Guard": +LET% to ALL troop types — game data
  Yeonwoo: {
    name: 'Yeonwoo', type: 'arc',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [5, 10, 15, 20, 25], bonus_type: 'let_all',
    widget_effect: 'none',
    generation: 'epic',
    skill: 'On Guard', description: '+LET% to ALL troop types (lv5: +25%)',
  },
  Diana: {
    name: 'Diana', type: 'arc',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: 'epic',
    skill: 'Lunar Grace', description: 'No modeled joiner effect',
  },
  Forrest: {
    name: 'Forrest', type: 'inf',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: 'rare',
    skill: '—', description: 'Joiner — effect not modeled',
  },
  Seth: {
    name: 'Seth', type: 'inf',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: 'rare',
    skill: '—', description: 'Joiner — effect not modeled',
  },
  Olive: {
    name: 'Olive', type: 'arc',
    atk_bonus: 0, let_bonus: 0,
    skill_bonuses: [0, 0, 0, 0, 0], bonus_type: 'none',
    widget_effect: 'none',
    generation: 'rare',
    skill: '—', description: 'Joiner — effect not modeled',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const LEAD_INF_HEROES: HeroName[] = [
  // G1 → G5, then Epic, then None/Other
  'Amadeus', 'Helga',             // G1
  'Zoe',                          // G2
  'Eric',                         // G3
  'Alcar',                        // G4
  'Longfei',                      // G5
  'Howard',                       // Epic
  'None', 'Other',
];

export const LEAD_CAV_HEROES: HeroName[] = [
  // G1 → G5, then Epic, then None/Other
  'Jabel',                        // G1
  'Hilde',                        // G2
  'Petra',                        // G3
  'Margot',                       // G4
  'Thrud',                        // G5
  'Gordon', 'Chenko', 'Fahd',     // Epic
  'None', 'Other',
];

export const LEAD_ARC_HEROES: HeroName[] = [
  // G1 → G5, then Epic, then None/Other
  'Saul',                         // G1
  'Marlin',                       // G2
  'Jaeger',                       // G3
  'Rosa',                         // G4
  'Vivian',                       // G5
  'Quinn', 'Amane', 'Yeonwoo', 'Diana', // Epic
  'None', 'Other',
];

export const JOINER_HEROES: HeroName[] = [
  'None', 'Amane', 'Chenko', 'Yeonwoo', 'Amadeus',
];

/**
 * Get the effective bonus value for a joiner hero at a given skill level.
 * Returns a percentage value (e.g. 20 for 20%).
 */
export function getJoinerBonus(slot: JoinerSlot): number {
  const hero = HERO_DB[slot.hero];
  if (!hero) return 0;
  return hero.skill_bonuses[slot.skillLevel - 1];
}

/**
 * Compute the total ATK% bonus added to all troop types (from atk_all joiners).
 * Returned as a percentage value (e.g. 20 for +20%).
 */
export function getJoinerAtkAllBonus(joiners: JoinerSlot[]): number {
  return joiners.reduce((sum, slot) => {
    const hero = HERO_DB[slot.hero];
    if (!hero || hero.bonus_type !== 'atk_all') return sum;
    return sum + hero.skill_bonuses[slot.skillLevel - 1];
  }, 0);
}

/**
 * Compute the total LET% bonus added to all troop types (from let_all joiners).
 * Returned as a percentage value (e.g. 25 for +25%).
 */
export function getJoinerLetAllBonus(joiners: JoinerSlot[]): number {
  return joiners.reduce((sum, slot) => {
    const hero = HERO_DB[slot.hero];
    if (!hero || hero.bonus_type !== 'let_all') return sum;
    return sum + hero.skill_bonuses[slot.skillLevel - 1];
  }, 0);
}
