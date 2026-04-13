import type { TroopStats, WidgetStats, OptimalRatio, FormationResult, TroopDistribution, ParticipantDataPoint, TroopTier, TGLevel, JoinerSlot } from '../types';
import { getJoinerAtkAllBonus, getJoinerLetAllBonus } from './heroes';

// ─── Attack Factor ────────────────────────────────────────────────────────────

/**
 * Compute the combined "Attack Factor" A for a troop type.
 * A = (1 + atk/100) × (1 + let/100)
 */
export function attackFactor(atk: number, let_: number): number {
  return (1 + atk / 100) * (1 + let_ / 100);
}

// ─── Tier Multiplier ──────────────────────────────────────────────────────────

/**
 * Extra archer multiplier for T>6 and TG3+ troops (additional 1.1 on top of base 1.1).
 * Ref: Frakinator documentation.
 */
export function archerTierMultiplier(tier: TroopTier, tg: TGLevel): number {
  const baseMult = 1.1; // archers always do +10% vs infantry (bear troops)
  const isTierHighEnough = tier === 'T7-T9' || tier === 'T10' || tier === 'T11';
  const isTGHighEnough = tg >= 3;
  return isTierHighEnough && isTGHighEnough ? baseMult * 1.1 : baseMult;
}

// ─── Optimal Ratio ────────────────────────────────────────────────────────────

/**
 * Compute the optimal troop fractions using Lagrange multipliers.
 *
 * The damage function to maximize is:
 *   D ∝ (1/3)×A_inf×√f_inf + A_cav×√f_cav + (4.4/3)×A_arc×√f_arc×arcMult
 *
 * The analytical solution:
 *   α = A_inf/3,  β = A_cav,  γ = (4.4/3)×A_arc×arcMult
 *   f_inf = α² / (α²+β²+γ²)
 *   f_cav = β² / (α²+β²+γ²)
 *   f_arc = γ² / (α²+β²+γ²)
 */
export function computeOptimalRatio(
  stats: TroopStats,
  widgets: WidgetStats,
  tier: TroopTier,
  tg: TGLevel,
  joiners: JoinerSlot[] = []
): OptimalRatio {
  // Merge widget bonuses into global stats
  // Joiner atk_all adds flat % to every troop type's ATK; let_all adds to every troop type's LET
  const atkAll = getJoinerAtkAllBonus(joiners);
  const letAll = getJoinerLetAllBonus(joiners);
  const A_inf = attackFactor(stats.inf_atk + widgets.inf_atk + atkAll, stats.inf_let + widgets.inf_let + letAll);
  const A_cav = attackFactor(stats.cav_atk + widgets.cav_atk + atkAll, stats.cav_let + widgets.cav_let + letAll);
  const A_arc = attackFactor(stats.arc_atk + widgets.arc_atk + atkAll, stats.arc_let + widgets.arc_let + letAll);

  const arcMult = archerTierMultiplier(tier, tg);

  const alpha = A_inf / 3;
  const beta = A_cav;
  const gamma = (4.4 / 3) * A_arc * arcMult;

  const sumSq = alpha ** 2 + beta ** 2 + gamma ** 2;

  if (sumSq === 0) {
    return { inf: 1 / 3, cav: 1 / 3, arc: 1 / 3 };
  }

  return {
    inf: alpha ** 2 / sumSq,
    cav: beta ** 2 / sumSq,
    arc: gamma ** 2 / sumSq,
  };
}

// ─── Damage Score ─────────────────────────────────────────────────────────────

/**
 * Compute the relative damage score for a given troop distribution.
 * Proportional to the actual formula, L factor omitted (constant for a given leader).
 *
 * D ∝ (1/3)×A_inf×√f_inf + A_cav×√f_cav + (4.4/3)×A_arc×√f_arc×arcMult
 */
export function computeDamageScore(
  stats: TroopStats,
  widgets: WidgetStats,
  ratio: OptimalRatio,
  tier: TroopTier,
  tg: TGLevel,
  joiners: JoinerSlot[] = []
): number {
  const atkAll = getJoinerAtkAllBonus(joiners);
  const letAll = getJoinerLetAllBonus(joiners);
  const A_inf = attackFactor(stats.inf_atk + widgets.inf_atk + atkAll, stats.inf_let + widgets.inf_let + letAll);
  const A_cav = attackFactor(stats.cav_atk + widgets.cav_atk + atkAll, stats.cav_let + widgets.cav_let + letAll);
  const A_arc = attackFactor(stats.arc_atk + widgets.arc_atk + atkAll, stats.arc_let + widgets.arc_let + letAll);

  const arcMult = archerTierMultiplier(tier, tg);

  return (
    (A_inf / 3) * Math.sqrt(ratio.inf) +
    A_cav * Math.sqrt(ratio.cav) +
    ((4.4 / 3) * A_arc * arcMult) * Math.sqrt(ratio.arc)
  );
}

// ─── Troop Distribution ───────────────────────────────────────────────────────

/**
 * Given a rally capacity, number of participants, and optimal ratio,
 * compute exact troop counts per participant and totals.
 * Rounding to nearest 100.
 */
export function computeDistribution(
  capacity: number,
  participants: number,
  ratio: OptimalRatio
): TroopDistribution {
  const perParticipant = Math.floor(capacity / participants);

  const roundTo = (n: number) => Math.round(n / 100) * 100;

  const inf = roundTo(perParticipant * ratio.inf);
  const cav = roundTo(perParticipant * ratio.cav);
  // arc gets the remainder to avoid rounding drift
  const arc = perParticipant - inf - cav;

  return {
    troopsPerParticipant: perParticipant,
    inf,
    cav,
    arc,
    totalInf: inf * participants,
    totalCav: cav * participants,
    totalArc: arc * participants,
    total: perParticipant * participants,
  };
}

// ─── Full Formation Result ───────────────────────────────────────────────────

export function computeFormation(
  stats: TroopStats,
  widgets: WidgetStats,
  tier: TroopTier,
  tg: TGLevel,
  capacity: number,
  participants: number,
  joiners: JoinerSlot[] = []
): FormationResult {
  const ratio = computeOptimalRatio(stats, widgets, tier, tg, joiners);
  const distribution = computeDistribution(capacity, participants, ratio);

  const damageScore = computeDamageScore(stats, widgets, ratio, tier, tg, joiners);

  // Naive equal split for comparison
  const naiveRatio: OptimalRatio = { inf: 1 / 3, cav: 1 / 3, arc: 1 / 3 };
  const naiveScore = computeDamageScore(stats, widgets, naiveRatio, tier, tg, joiners);

  return {
    ratio,
    distribution,
    damageScore,
    naiveScore,
    maxScore: damageScore, // analytical optimal = max
  };
}

// ─── Participant Optimizer ───────────────────────────────────────────────────

/**
 * Generate damage score data for each participant count from 1 to 15.
 */
export function computeParticipantCurve(
  stats: TroopStats,
  widgets: WidgetStats,
  tier: TroopTier,
  tg: TGLevel,
  capacity: number,
  joiners: JoinerSlot[] = []
): ParticipantDataPoint[] {
  const ratio = computeOptimalRatio(stats, widgets, tier, tg, joiners);
  const baseScore = computeDamageScore(stats, widgets, ratio, tier, tg, joiners);

  return Array.from({ length: 15 }, (_, i) => {
    const participants = i + 1;
    const perParticipant = Math.floor(capacity / participants);
    const fillRate = (perParticipant * participants) / capacity;

    return {
      participants,
      // More participants = higher rally fill = more total damage (√N scaling)
      damageScore: baseScore * Math.sqrt(perParticipant) * participants,
      troopsPerParticipant: perParticipant,
      fillRate,
    };
  });
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

export function formatTroops(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
