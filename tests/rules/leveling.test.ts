import { describe, expect, it } from "vitest";

import {
  ASI_LEVELS,
  applyAsiChoice,
  calculateHpGain,
  getMaxKnownSpellsForLevel,
  getSpellSlotsForLevel,
  isAsiLevel,
  rollHitDie,
  validateAsiChoice,
} from "@/lib/rules/leveling";
import { DEFAULT_ABILITIES } from "@/lib/types/character";

function rngFromDie(rolls: number[], hitDie: number) {
  let index = 0;
  return () => (rolls[index++] - 1) / hitDie;
}

describe("leveling", () => {
  it("rolls a hit die in the 1 to hitDie range", () => {
    expect(rollHitDie(10, () => 0)).toBe(1);
    expect(rollHitDie(10, () => 0.999)).toBe(10);
    expect(rollHitDie(10, rngFromDie([7], 10))).toBe(7);
  });

  it("calculates hp gain with a minimum of 1", () => {
    expect(calculateHpGain(10, 2, 5)).toBe(7);
    expect(calculateHpGain(6, -2, 1)).toBe(1);
  });

  it("flags the standard ASI levels only", () => {
    for (const level of ASI_LEVELS) {
      expect(isAsiLevel(level)).toBe(true);
    }
    expect(isAsiLevel(1)).toBe(false);
    expect(isAsiLevel(5)).toBe(false);
    expect(isAsiLevel(20)).toBe(false);
  });

  it("applies a +2 single ability increase", () => {
    const result = applyAsiChoice(DEFAULT_ABILITIES, { mode: "single", ability: "str" });
    expect(result.str).toBe(DEFAULT_ABILITIES.str + 2);
  });

  it("applies a +1/+1 two ability increase", () => {
    const result = applyAsiChoice(DEFAULT_ABILITIES, {
      mode: "two",
      abilities: ["str", "dex"],
    });
    expect(result.str).toBe(DEFAULT_ABILITIES.str + 1);
    expect(result.dex).toBe(DEFAULT_ABILITIES.dex + 1);
  });

  it("clamps ability increases at the score cap", () => {
    const maxed = { ...DEFAULT_ABILITIES, str: 19 };
    const result = applyAsiChoice(maxed, { mode: "single", ability: "str" });
    expect(result.str).toBe(20);
  });

  it("rejects increasing an ability already at the cap", () => {
    const maxed = { ...DEFAULT_ABILITIES, str: 20 };
    const errors = validateAsiChoice(maxed, { mode: "single", ability: "str" });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects picking the same ability twice", () => {
    const errors = validateAsiChoice(DEFAULT_ABILITIES, {
      mode: "two",
      abilities: ["str", "str"],
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  it("grows spell slots for casters and keeps non-casters at zero", () => {
    expect(getSpellSlotsForLevel("wizard", 1)).toEqual({ slotLevel1: 2, slotLevel2: 0 });
    expect(getSpellSlotsForLevel("wizard", 2)).toEqual({ slotLevel1: 3, slotLevel2: 0 });
    expect(getSpellSlotsForLevel("wizard", 3)).toEqual({ slotLevel1: 4, slotLevel2: 2 });
    expect(getSpellSlotsForLevel("wizard", 10)).toEqual({ slotLevel1: 4, slotLevel2: 3 });
    expect(getSpellSlotsForLevel("fighter", 10)).toEqual({ slotLevel1: 0, slotLevel2: 0 });
    expect(getSpellSlotsForLevel("paladin", 10)).toEqual({ slotLevel1: 0, slotLevel2: 0 });
  });

  it("grows known spells for casters and caps at the class spell pool", () => {
    expect(getMaxKnownSpellsForLevel("wizard", 1)).toBe(3);
    expect(getMaxKnownSpellsForLevel("wizard", 4)).toBe(4);
    expect(getMaxKnownSpellsForLevel("wizard", 20)).toBe(5);
    expect(getMaxKnownSpellsForLevel("fighter", 20)).toBe(0);
  });
});
