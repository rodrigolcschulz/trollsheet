export type CheckAdvantage = "none" | "advantage" | "disadvantage";

export type CheckBreakdown = {
  label: string;
  value: number;
};

export type CheckResult = {
  rolls: number[];
  chosenRoll: number;
  total: number;
  breakdown: CheckBreakdown[];
};

export function rollD20(rng: () => number = Math.random): number {
  return Math.floor(rng() * 20) + 1;
}

export function rollCheck({
  abilityModifier,
  proficiencyBonus = 0,
  advantage = "none",
  rng = Math.random,
}: {
  abilityModifier: number;
  proficiencyBonus?: number;
  advantage?: CheckAdvantage;
  rng?: () => number;
}): CheckResult {
  const rolls = advantage === "none"
    ? [rollD20(rng)]
    : [rollD20(rng), rollD20(rng)];
  const chosenRoll = advantage === "advantage"
    ? Math.max(...rolls)
    : advantage === "disadvantage"
      ? Math.min(...rolls)
      : rolls[0];

  return {
    rolls,
    chosenRoll,
    total: chosenRoll + abilityModifier + proficiencyBonus,
    breakdown: [
      { label: "d20", value: chosenRoll },
      { label: "atributo", value: abilityModifier },
      ...(proficiencyBonus !== 0
        ? [{ label: "proficiência", value: proficiencyBonus }]
        : []),
    ],
  };
}

export function validateCheckResult(
  total: number,
  dc?: number,
): "success" | "failure" | null {
  if (dc === undefined || Number.isNaN(dc)) return null;
  return total >= dc ? "success" : "failure";
}