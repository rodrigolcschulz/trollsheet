import { describe, expect, it } from "vitest";

import {
  rollCheck,
  rollD20,
  validateCheckResult,
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
});