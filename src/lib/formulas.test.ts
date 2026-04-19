import { describe, it, expect } from "vitest";
import {
  computeOptimalRatio,
  computeDamageScore,
  computeFormation,
  computeParticipantCurve,
} from "./formulas";
import type {
  TroopStats,
  WidgetStats,
  JoinerSlot,
  OptimalRatio,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────

const defaultStats: TroopStats = {
  inf_atk: 100,
  inf_let: 100,
  cav_atk: 100,
  cav_let: 100,
  arc_atk: 100,
  arc_let: 100,
};

const defaultWidgets: WidgetStats = {
  inf_atk: 0,
  inf_let: 0,
  cav_atk: 0,
  cav_let: 0,
  arc_atk: 0,
  arc_let: 0,
};

const noJoiners: JoinerSlot[] = [];

// ─── computeOptimalRatio tests ────────────────────────────────────────────

describe("computeOptimalRatio", () => {
  it("should return a valid ratio (all values > 0, sum = 1)", () => {
    const ratio = computeOptimalRatio(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      noJoiners,
    );

    expect(ratio.inf).toBeGreaterThan(0);
    expect(ratio.cav).toBeGreaterThan(0);
    expect(ratio.arc).toBeGreaterThan(0);

    const sum = ratio.inf + ratio.cav + ratio.arc;
    expect(sum).toBeCloseTo(1, 5);
  });

  it("should favor archers for symmetric stats (due to multipliers)", () => {
    const ratio = computeOptimalRatio(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      noJoiners,
    );

    // With symmetric stats, the formula's multipliers cause archers to be heavily favored
    // α = A_inf/3, β = A_cav, γ = (4.4/3)×A_arc×1.1
    // So f_arc >> f_cav >> f_inf
    expect(ratio.arc).toBeGreaterThan(ratio.cav);
    expect(ratio.cav).toBeGreaterThan(ratio.inf);
  });

  it("should favor archer when archer ATK is higher", () => {
    const asymmetricStats: TroopStats = {
      inf_atk: 100,
      inf_let: 100,
      cav_atk: 100,
      cav_let: 100,
      arc_atk: 300, // High archer ATK
      arc_let: 100,
    };

    const ratio = computeOptimalRatio(
      asymmetricStats,
      defaultWidgets,
      "T10",
      0,
      noJoiners,
    );

    expect(ratio.arc).toBeGreaterThan(ratio.inf);
    expect(ratio.arc).toBeGreaterThan(ratio.cav);
  });

  it("should apply archer multiplier for T7+ with TG3+", () => {
    // Without the multiplier (T1-T6)
    const ratioLow = computeOptimalRatio(
      defaultStats,
      defaultWidgets,
      "T1-T6",
      0,
      noJoiners,
    );

    // With the multiplier (T7+ and TG3+)
    const ratioHigh = computeOptimalRatio(
      defaultStats,
      defaultWidgets,
      "T7-T9",
      3,
      noJoiners,
    );

    // Higher archer multiplier should increase archer ratio
    expect(ratioHigh.arc).toBeGreaterThan(ratioLow.arc);
  });
});

// ─── computeDamageScore tests ─────────────────────────────────────────────

describe("computeDamageScore", () => {
  it("should return a positive score", () => {
    const ratio: OptimalRatio = { inf: 1 / 3, cav: 1 / 3, arc: 1 / 3 };
    const score = computeDamageScore(
      defaultStats,
      defaultWidgets,
      ratio,
      "T10",
      0,
      noJoiners,
    );

    expect(score).toBeGreaterThan(0);
  });

  it("should increase with higher stats", () => {
    const ratio: OptimalRatio = { inf: 1 / 3, cav: 1 / 3, arc: 1 / 3 };

    const baseStat = {
      inf_atk: 100,
      inf_let: 100,
      cav_atk: 100,
      cav_let: 100,
      arc_atk: 100,
      arc_let: 100,
    };

    const baseScore = computeDamageScore(
      baseStat,
      defaultWidgets,
      ratio,
      "T10",
      0,
      noJoiners,
    );

    const highStat = {
      inf_atk: 200,
      inf_let: 200,
      cav_atk: 200,
      cav_let: 200,
      arc_atk: 200,
      arc_let: 200,
    };

    const highScore = computeDamageScore(
      highStat,
      defaultWidgets,
      ratio,
      "T10",
      0,
      noJoiners,
    );

    expect(highScore).toBeGreaterThan(baseScore);
  });

  it("optimal ratio should give higher score than 33/33/33 for asymmetric stats", () => {
    const asymmetricStats: TroopStats = {
      inf_atk: 100,
      inf_let: 100,
      cav_atk: 200,
      cav_let: 200,
      arc_atk: 50,
      arc_let: 50,
    };

    const optimalRatio = computeOptimalRatio(
      asymmetricStats,
      defaultWidgets,
      "T10",
      0,
      noJoiners,
    );

    const naiveRatio: OptimalRatio = { inf: 1 / 3, cav: 1 / 3, arc: 1 / 3 };

    const optimalScore = computeDamageScore(
      asymmetricStats,
      defaultWidgets,
      optimalRatio,
      "T10",
      0,
      noJoiners,
    );

    const naiveScore = computeDamageScore(
      asymmetricStats,
      defaultWidgets,
      naiveRatio,
      "T10",
      0,
      noJoiners,
    );

    expect(optimalScore).toBeGreaterThan(naiveScore);
  });
});

// ─── computeFormation tests ───────────────────────────────────────────────

describe("computeFormation", () => {
  it("should return a valid FormationResult object", () => {
    const result = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      1,
      noJoiners,
    );

    expect(result).toHaveProperty("ratio");
    expect(result).toHaveProperty("distribution");
    expect(result).toHaveProperty("damageScore");
    expect(result).toHaveProperty("naiveScore");
    expect(result).toHaveProperty("maxScore");
  });

  it("ratio should sum to 1", () => {
    const result = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      1,
      noJoiners,
    );

    const sum = result.ratio.inf + result.ratio.cav + result.ratio.arc;
    expect(sum).toBeCloseTo(1, 5);
  });

  it("distribution total should equal capacity", () => {
    const capacity = 2_000_000;
    const result = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      capacity,
      1,
      noJoiners,
    );

    expect(result.distribution.total).toBe(capacity);
  });

  it("per-participant troops should scale with participants", () => {
    const capacity = 2_000_000;

    const result1 = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      capacity,
      1,
      noJoiners,
    );

    const result5 = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      capacity,
      5,
      noJoiners,
    );

    // Per-participant should decrease with more participants
    expect(result1.distribution.troopsPerParticipant).toBeGreaterThan(
      result5.distribution.troopsPerParticipant,
    );
  });

  it("damageScore should be >= naiveScore (optimal >= naive)", () => {
    const result = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      1,
      noJoiners,
    );

    expect(result.damageScore).toBeGreaterThanOrEqual(result.naiveScore);
  });

  it("maxScore should equal damageScore (analytical optimum)", () => {
    const result = computeFormation(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      1,
      noJoiners,
    );

    expect(result.maxScore).toBe(result.damageScore);
  });
});

// ─── computeParticipantCurve tests ────────────────────────────────────────

describe("computeParticipantCurve", () => {
  it("should return exactly 15 data points", () => {
    const curve = computeParticipantCurve(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      noJoiners,
    );

    expect(curve).toHaveLength(15);
  });

  it("should have participant count from 1 to 15", () => {
    const curve = computeParticipantCurve(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      noJoiners,
    );

    curve.forEach((point, idx) => {
      expect(point.participants).toBe(idx + 1);
    });
  });

  it("damage score should increase with more participants (≥0 fillRate)", () => {
    const curve = computeParticipantCurve(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      noJoiners,
    );

    // Damage should generally increase as we can fill more of the capacity
    expect(curve[14].damageScore).toBeGreaterThan(curve[0].damageScore);
  });

  it("fillRate should be <= 1", () => {
    const curve = computeParticipantCurve(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      noJoiners,
    );

    curve.forEach((point) => {
      expect(point.fillRate).toBeLessThanOrEqual(1);
      expect(point.fillRate).toBeGreaterThan(0);
    });
  });

  it("troopsPerParticipant should decrease with more participants", () => {
    const curve = computeParticipantCurve(
      defaultStats,
      defaultWidgets,
      "T10",
      0,
      2_000_000,
      noJoiners,
    );

    for (let i = 0; i < curve.length - 1; i++) {
      expect(curve[i].troopsPerParticipant).toBeGreaterThan(
        curve[i + 1].troopsPerParticipant,
      );
    }
  });
});
