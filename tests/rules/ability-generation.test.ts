import { describe, expect, it } from "vitest";

import {
  isWeakRoll,
  rollAbilityScores,
  rollSingleAbilityScore,
  validateAssignment,
} from "@/lib/rules/ability-generation";

function rngFromDice(dice: number[]) {
  let index = 0;
  return () => (dice[index++] - 1) / 6;
}

describe("ability generation", () => {
  it("sums the three highest dice and drops the lowest", () => {
    expect(rollSingleAbilityScore(rngFromDice([1, 6, 3, 4]))).toEqual({
      total: 13,
      dice: [1, 6, 3, 4],
      dropped: 1,
    });
  });

  it("drops one die when the lowest value is tied", () => {
    expect(rollSingleAbilityScore(rngFromDice([2, 2, 3, 4])).dropped).toBe(2);
    expect(rollSingleAbilityScore(rngFromDice([2, 2, 3, 4])).total).toBe(9);
  });

  it("returns six scores in the 3 to 18 range", () => {
    const values = rollAbilityScores(() => 0.999);
    expect(values).toHaveLength(6);
    expect(values.every((value) => value >= 3 && value <= 18)).toBe(true);
  });

  it("flags a weak set when modifiers total zero or no score reaches 13", () => {
    expect(isWeakRoll([10, 10, 10, 10, 10, 10])).toBe(true);
    expect(isWeakRoll([12, 12, 12, 12, 12, 12])).toBe(true);
    expect(isWeakRoll([13, 13, 10, 10, 10, 10])).toBe(false);
  });

  it("rejects incomplete and overused assignments", () => {
    expect(validateAssignment([15, 14, 13, 12, 10, 8], { str: 15 })).toContainEqual(
      expect.objectContaining({ valid: false }),
    );
    expect(validateAssignment([15, 14, 13, 12, 10, 8], {
      str: 15,
      dex: 15,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    })).toContainEqual(expect.objectContaining({ valid: false }));
  });
});
