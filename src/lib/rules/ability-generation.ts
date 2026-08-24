import type { AbilityKey } from "@/lib/types/character";

export type RollDetail = {
  total: number;
  dice: number[];
  dropped: number;
};

export type ValidationResult = {
  valid: boolean;
  message: string;
};

function rollDie(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

export function rollSingleAbilityScore(rng: () => number = Math.random): RollDetail {
  const dice = Array.from({ length: 4 }, () => rollDie(rng));
  const dropped = Math.min(...dice);
  const total = dice.reduce((sum, die) => sum + die, 0) - dropped;

  return { total, dice, dropped };
}

export function rollAbilityScores(
  rng: () => number = Math.random,
): number[] {
  return Array.from({ length: 6 }, () => rollSingleAbilityScore(rng).total);
}

export function isWeakRoll(values: number[]): boolean {
  const modifierSum = values.reduce(
    (sum, value) => sum + Math.floor((value - 10) / 2),
    0,
  );
  return modifierSum <= 0 || !values.some((value) => value >= 13);
}

export function validateAssignment(
  values: number[],
  assignment: Partial<Record<AbilityKey, number>>,
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const keys: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];
  const assignedValues = keys.map((key) => assignment[key]);

  if (keys.some((key) => assignment[key] === undefined)) {
    results.push({ valid: false, message: "Todos os atributos devem ser atribuídos." });
  }

  const availableCounts = new Map<number, number>();
  values.forEach((value) => availableCounts.set(value, (availableCounts.get(value) ?? 0) + 1));
  for (const value of assignedValues) {
    if (value === undefined) continue;
    const remaining = availableCounts.get(value) ?? 0;
    if (remaining === 0) {
      results.push({ valid: false, message: "Cada valor gerado só pode ser usado uma vez." });
      break;
    }
    availableCounts.set(value, remaining - 1);
  }

  if (results.length === 0) {
    results.push({ valid: true, message: "Atribuição válida." });
  }

  return results;
}

