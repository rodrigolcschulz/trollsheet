import { describe, expect, it } from "vitest";

import {
  rollCheck,
  rollD20,
  validateCheckResult,
  parseDiceFormula,
  rollFormula,
  getWeaponAbility,
  getSpellcastingAbility,
} from "@/lib/rules/checks";

function rngFromRolls(rolls: number[]) {
  let index = 0;
  return () => (rolls[index++] - 1) / 20;
}

describe("checks", () => {
  it("rolls a d20 in the 1 to 20 range", () => {
    expect(rollD20(() => 0)).toBe(1);
    expect(rollD20(() => 0.999)).toBe(20);
  });

  it("adds modifiers to a normal roll and exposes the breakdown", () => {
    const result = rollCheck({
      abilityModifier: 1,
      proficiencyBonus: 2,
      rng: rngFromRolls([14]),
    });
    expect(result.rolls).toEqual([14]);
    expect(result.total).toBe(17);
    expect(result.breakdown.map((part) => part.value)).toEqual([14, 1, 2]);
  });

  it("chooses the highest roll with advantage", () => {
    const result = rollCheck({
      abilityModifier: 0,
      advantage: "advantage",
      rng: rngFromRolls([7, 14]),
    });
    expect(result.rolls).toEqual([7, 14]);
    expect(result.chosenRoll).toBe(14);
  });

  it("chooses the lowest roll with disadvantage", () => {
    const result = rollCheck({
      abilityModifier: 0,
      advantage: "disadvantage",
      rng: rngFromRolls([7, 14]),
    });
    expect(result.chosenRoll).toBe(7);
  });

  it("validates optional DC results", () => {
    expect(validateCheckResult(15, 15)).toBe("success");
    expect(validateCheckResult(14, 15)).toBe("failure");
    expect(validateCheckResult(15)).toBeNull();
  });

  describe("weapon and spell rolling", () => {
    it("parses various dice formulas", () => {
      const parsed1 = parseDiceFormula("1d8 perfurante");
      expect(parsed1).toEqual({
        multiplier: 1,
        diceCount: 1,
        diceSides: 8,
        modifier: 0,
        type: "perfurante",
      });

      const parsed2 = parseDiceFormula("3x 1d4 + 1");
      expect(parsed2).toEqual({
        multiplier: 3,
        diceCount: 1,
        diceSides: 4,
        modifier: 1,
        type: undefined,
      });

      const parsed3 = parseDiceFormula("+1d6 nos acertos");
      expect(parsed3).toEqual({
        multiplier: 1,
        diceCount: 1,
        diceSides: 6,
        modifier: 0,
        type: "nos acertos",
      });

      const parsed4 = parseDiceFormula("invalid formula");
      expect(parsed4).toBeNull();
    });

    it("rolls formula and formats breakdown and total", () => {
      const parsed = parseDiceFormula("1d8 perfurante");
      expect(parsed).not.toBeNull();
      if (parsed) {
        const result = rollFormula(parsed, 3, () => 0.5); // Math.floor(0.5 * 8) + 1 = 5
        expect(result.total).toBe(8); // 5 + 3
        expect(result.breakdown).toBe("Rolado 1d8 + 3: (5) + 3 = 8");
        expect(result.formula).toBe("1d8 + 3");
      }
    });

    it("rolls multi-missile formulas correctly", () => {
      const parsed = parseDiceFormula("3x 1d4 + 1");
      expect(parsed).not.toBeNull();
      if (parsed) {
        let rngCalls = 0;
        const rolls = [1, 2, 3];
        const rng = () => (rolls[rngCalls++] - 1) / 4;
        const result = rollFormula(parsed, 0, rng);
        expect(result.total).toBe(9);
        expect(result.breakdown).toBe("Rolado 3x (1d4 + 1): (1 + 1) + (2 + 1) + (3 + 1) = 9");
      }
    });

    it("correctly identifies weapon ability", () => {
      const abilities = { str: 10, dex: 16 };
      expect(getWeaponAbility("weapon-light-crossbow", abilities)).toBe("dex");
      expect(getWeaponAbility("weapon-longbow", abilities)).toBe("dex");
      expect(getWeaponAbility("weapon-rapier", abilities)).toBe("dex");
      expect(getWeaponAbility("weapon-longsword", abilities)).toBe("str");
    });

    it("correctly identifies spellcasting ability", () => {
      expect(getSpellcastingAbility("wizard")).toBe("int");
      expect(getSpellcastingAbility("cleric")).toBe("wis");
      expect(getSpellcastingAbility("ranger")).toBe("wis");
      expect(getSpellcastingAbility("warlock")).toBe("cha");
      expect(getSpellcastingAbility("barbarian")).toBe("cha");
    });
  });
});