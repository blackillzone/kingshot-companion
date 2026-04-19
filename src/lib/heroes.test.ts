import { describe, it, expect } from "vitest";
import {
  HERO_DB,
  LEAD_INF_HEROES,
  LEAD_CAV_HEROES,
  LEAD_ARC_HEROES,
  JOINER_HEROES,
  getJoinerAtkAllBonus,
  getJoinerLetAllBonus,
} from "./heroes";
import type { JoinerSlot } from "../types";

// ─── HERO_DB Integrity tests ───────────────────────────────────────────────

describe("HERO_DB", () => {
  it("should contain None and Other entries", () => {
    expect(HERO_DB.None).toBeDefined();
    expect(HERO_DB.Other).toBeDefined();
  });

  it("should have all entries with required fields", () => {
    Object.values(HERO_DB).forEach((hero) => {
      expect(hero.name).toBeDefined();
      expect(hero.type).toBeDefined();
      expect(hero.atk_bonus).toBeGreaterThanOrEqual(0);
      expect(hero.let_bonus).toBeGreaterThanOrEqual(0);
      expect(hero.skill_bonuses).toHaveLength(5);
      expect(hero.bonus_type).toMatch(/atk_all|let_all|none/);
      expect(hero.widget_effect).toMatch(/rally_atk|rally_let|none/);
      expect(hero.generation).toBeDefined();
      expect(hero.skill).toBeDefined();
      expect(hero.description).toBeDefined();
    });
  });

  it("all joiner heroes should have exactly 5 skill_bonuses", () => {
    JOINER_HEROES.forEach((heroName) => {
      const hero = HERO_DB[heroName];
      expect(hero.skill_bonuses).toHaveLength(5);
    });
  });

  it("atk_all joiners should only be Amane", () => {
    const atkAllHeroes = Object.values(HERO_DB).filter(
      (h) => h.bonus_type === "atk_all",
    );
    expect(atkAllHeroes).toHaveLength(1);
    expect(atkAllHeroes[0]?.name).toBe("Amane");
  });

  it("let_all joiners should be Chenko and Yeonwoo", () => {
    const letAllHeroes = Object.values(HERO_DB)
      .filter((h) => h.bonus_type === "let_all")
      .sort((a, b) => a.name.localeCompare(b.name));
    expect(letAllHeroes).toHaveLength(3); // Chenko, Yeonwoo, and Amadeus
    expect(letAllHeroes.map((h) => h.name)).toContain("Chenko");
    expect(letAllHeroes.map((h) => h.name)).toContain("Yeonwoo");
  });

  it("Amane should have atk_all bonus", () => {
    expect(HERO_DB.Amane.bonus_type).toBe("atk_all");
    expect(HERO_DB.Amane.skill_bonuses).toEqual([5, 10, 15, 20, 25]);
  });

  it("Chenko should have let_all bonus", () => {
    expect(HERO_DB.Chenko.bonus_type).toBe("let_all");
    expect(HERO_DB.Chenko.skill_bonuses).toEqual([5, 10, 15, 20, 25]);
  });

  it("Yeonwoo should have let_all bonus", () => {
    expect(HERO_DB.Yeonwoo.bonus_type).toBe("let_all");
    expect(HERO_DB.Yeonwoo.skill_bonuses).toEqual([5, 10, 15, 20, 25]);
  });
});

// ─── Lead Hero Lists tests ────────────────────────────────────────────────

describe("Lead Hero Lists", () => {
  it("LEAD_INF_HEROES should all be infantry or universal type", () => {
    LEAD_INF_HEROES.forEach((heroName) => {
      const hero = HERO_DB[heroName];
      expect(["inf", "universal"]).toContain(hero.type);
    });
  });

  it("LEAD_CAV_HEROES should all be cavalry or universal type", () => {
    LEAD_CAV_HEROES.forEach((heroName) => {
      const hero = HERO_DB[heroName];
      expect(["cav", "universal"]).toContain(hero.type);
    });
  });

  it("LEAD_ARC_HEROES should all be archery or universal type", () => {
    LEAD_ARC_HEROES.forEach((heroName) => {
      const hero = HERO_DB[heroName];
      expect(["arc", "universal"]).toContain(hero.type);
    });
  });

  it("each lead list should contain None and Other", () => {
    expect(LEAD_INF_HEROES).toContain("None");
    expect(LEAD_INF_HEROES).toContain("Other");
    expect(LEAD_CAV_HEROES).toContain("None");
    expect(LEAD_CAV_HEROES).toContain("Other");
    expect(LEAD_ARC_HEROES).toContain("None");
    expect(LEAD_ARC_HEROES).toContain("Other");
  });

  it("each lead list should contain at least 3 heroes (plus None/Other)", () => {
    expect(LEAD_INF_HEROES.length).toBeGreaterThanOrEqual(5);
    expect(LEAD_CAV_HEROES.length).toBeGreaterThanOrEqual(5);
    expect(LEAD_ARC_HEROES.length).toBeGreaterThanOrEqual(5);
  });
});

// ─── Joiner Hero List tests ───────────────────────────────────────────────

describe("JOINER_HEROES", () => {
  it("should contain None", () => {
    expect(JOINER_HEROES).toContain("None");
  });

  it("should contain Amane", () => {
    expect(JOINER_HEROES).toContain("Amane");
  });

  it("should contain Chenko", () => {
    expect(JOINER_HEROES).toContain("Chenko");
  });

  it("should contain Yeonwoo", () => {
    expect(JOINER_HEROES).toContain("Yeonwoo");
  });

  it("should contain Amadeus", () => {
    expect(JOINER_HEROES).toContain("Amadeus");
  });

  it("should only contain heroes with modeled bonuses", () => {
    JOINER_HEROES.forEach((heroName) => {
      const hero = HERO_DB[heroName];
      const hasBonus =
        hero.bonus_type === "atk_all" ||
        hero.bonus_type === "let_all" ||
        hero.name === "None";
      expect(hasBonus).toBe(true);
    });
  });
});

// ─── getJoinerAtkAllBonus tests ──────────────────────────────────────────

describe("getJoinerAtkAllBonus", () => {
  it("should return 0 for empty joiner slots", () => {
    const bonus = getJoinerAtkAllBonus([]);
    expect(bonus).toBe(0);
  });

  it("should return 0 when no atk_all joiners", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Chenko", skillLevel: 5 }, // let_all, not atk_all
      { hero: "None", skillLevel: 1 },
    ];
    const bonus = getJoinerAtkAllBonus(joiners);
    expect(bonus).toBe(0);
  });

  it("should return correct ATK bonus for Amane at each skill level", () => {
    const skillLevelBonuses = [
      { level: 1 as const, expected: 5 },
      { level: 2 as const, expected: 10 },
      { level: 3 as const, expected: 15 },
      { level: 4 as const, expected: 20 },
      { level: 5 as const, expected: 25 },
    ];

    skillLevelBonuses.forEach(({ level, expected }) => {
      const joiners: JoinerSlot[] = [{ hero: "Amane", skillLevel: level }];
      const bonus = getJoinerAtkAllBonus(joiners);
      expect(bonus).toBe(expected);
    });
  });

  it("should sum multiple atk_all joiners (if any exist)", () => {
    // In current data, only Amane has atk_all, but test the logic
    const joiners: JoinerSlot[] = [
      { hero: "Amane", skillLevel: 5 }, // +25%
      { hero: "Amane", skillLevel: 3 }, // Would be +15% if allowed
    ];
    const bonus = getJoinerAtkAllBonus(joiners);
    expect(bonus).toBe(40); // 25 + 15
  });

  it("should ignore let_all and none joiners", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Amane", skillLevel: 5 }, // +25% atk_all
      { hero: "Chenko", skillLevel: 5 }, // +25% let_all (ignored)
      { hero: "None", skillLevel: 1 }, // none (ignored)
    ];
    const bonus = getJoinerAtkAllBonus(joiners);
    expect(bonus).toBe(25); // Only Amane's +25%
  });
});

// ─── getJoinerLetAllBonus tests ─────────────────────────────────────────

describe("getJoinerLetAllBonus", () => {
  it("should return 0 for empty joiner slots", () => {
    const bonus = getJoinerLetAllBonus([]);
    expect(bonus).toBe(0);
  });

  it("should return 0 when no let_all joiners", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Amane", skillLevel: 5 }, // atk_all, not let_all
      { hero: "None", skillLevel: 1 },
    ];
    const bonus = getJoinerLetAllBonus(joiners);
    expect(bonus).toBe(0);
  });

  it("should return correct LET bonus for Chenko at each skill level", () => {
    const skillLevelBonuses = [
      { level: 1 as const, expected: 5 },
      { level: 2 as const, expected: 10 },
      { level: 3 as const, expected: 15 },
      { level: 4 as const, expected: 20 },
      { level: 5 as const, expected: 25 },
    ];

    skillLevelBonuses.forEach(({ level, expected }) => {
      const joiners: JoinerSlot[] = [{ hero: "Chenko", skillLevel: level }];
      const bonus = getJoinerLetAllBonus(joiners);
      expect(bonus).toBe(expected);
    });
  });

  it("should return correct LET bonus for Yeonwoo at each skill level", () => {
    const skillLevelBonuses = [
      { level: 1 as const, expected: 5 },
      { level: 2 as const, expected: 10 },
      { level: 3 as const, expected: 15 },
      { level: 4 as const, expected: 20 },
      { level: 5 as const, expected: 25 },
    ];

    skillLevelBonuses.forEach(({ level, expected }) => {
      const joiners: JoinerSlot[] = [{ hero: "Yeonwoo", skillLevel: level }];
      const bonus = getJoinerLetAllBonus(joiners);
      expect(bonus).toBe(expected);
    });
  });

  it("should sum multiple let_all joiners", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Chenko", skillLevel: 5 }, // +25%
      { hero: "Yeonwoo", skillLevel: 4 }, // +20%
    ];
    const bonus = getJoinerLetAllBonus(joiners);
    expect(bonus).toBe(45); // 25 + 20
  });

  it("should ignore atk_all and none joiners", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Chenko", skillLevel: 5 }, // +25% let_all
      { hero: "Amane", skillLevel: 5 }, // +25% atk_all (ignored)
      { hero: "None", skillLevel: 1 }, // none (ignored)
    ];
    const bonus = getJoinerLetAllBonus(joiners);
    expect(bonus).toBe(25); // Only Chenko's +25%
  });

  it("should handle Amadeus as let_all joiner", () => {
    const joiners: JoinerSlot[] = [{ hero: "Amadeus", skillLevel: 5 }];
    const bonus = getJoinerLetAllBonus(joiners);
    expect(bonus).toBe(25); // Amadeus has +25% let_all at lv5
  });

  it("should handle invalid hero key gracefully (branch: !hero)", () => {
    const joiners: JoinerSlot[] = [
      { hero: "InvalidHero" as HeroName, skillLevel: 5 },
      { hero: "Chenko", skillLevel: 3 },
    ];
    const bonus = getJoinerLetAllBonus(joiners);
    expect(bonus).toBe(15); // Only valid Chenko bonus
  });
});

// ─── getJoinerAtkAllBonus - invalid hero branch coverage ────────────────

describe("getJoinerAtkAllBonus - edge cases", () => {
  it("should handle invalid hero key gracefully (branch: !hero)", () => {
    const joiners: JoinerSlot[] = [
      { hero: "InvalidHero" as HeroName, skillLevel: 5 },
      { hero: "Amane", skillLevel: 2 },
    ];
    const bonus = getJoinerAtkAllBonus(joiners);
    expect(bonus).toBe(10); // Only valid Amane bonus
  });

  it("should handle skillLevel out of bounds with nullish coalescing", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Amane", skillLevel: 99 }, // Out of bounds
    ];
    const bonus = getJoinerAtkAllBonus(joiners);
    expect(bonus).toBe(0); // No bonus for invalid level
  });

  it("should skip atk_all heroes when calculating let_all (branch: bonus_type !== let_all)", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Amane", skillLevel: 5 }, // atk_all bonus - should be skipped for let_all
      { hero: "Chenko", skillLevel: 3 },  // let_all bonus - should be counted
    ];
    const letBonus = getJoinerLetAllBonus(joiners);
    expect(letBonus).toBe(15); // Only Chenko's +15%, Amane skipped
  });

  it("should skip let_all heroes when calculating atk_all (branch: bonus_type !== atk_all)", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Chenko", skillLevel: 5 }, // let_all bonus - should be skipped for atk_all
      { hero: "Amane", skillLevel: 3 },  // atk_all bonus - should be counted
    ];
    const atkBonus = getJoinerAtkAllBonus(joiners);
    expect(atkBonus).toBe(15); // Only Amane's +15%, Chenko skipped
  });

  it("should handle out-of-bounds skillLevel for let_all hero (branch: ?? 0)", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Chenko", skillLevel: 99 }, // Out of bounds - nullish coalescing should return 0
    ];
    const bonus = getJoinerLetAllBonus(joiners);
    expect(bonus).toBe(0); // No bonus for invalid level
  });

  it("should handle out-of-bounds skillLevel for atk_all hero (branch: ?? 0)", () => {
    const joiners: JoinerSlot[] = [
      { hero: "Amane", skillLevel: 99 }, // Out of bounds - nullish coalescing should return 0
    ];
    const bonus = getJoinerAtkAllBonus(joiners);
    expect(bonus).toBe(0); // No bonus for invalid level
  });
});
