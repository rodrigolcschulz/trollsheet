import { Abilities, AbilityKey } from "@/lib/types/character";

export const POINT_BUY_BUDGET = 27;

export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getPointsSpent(
  abilities: Abilities
): number {
  return Object.values(abilities).reduce(
    (sum, value) => sum + POINT_BUY_COST[value],
    0
  );
}

export function getRemainingPoints(
  abilities: Abilities
): number {
  return POINT_BUY_BUDGET - getPointsSpent(abilities);
}

export function canIncreaseAbility(
  abilities: Abilities,
  key: AbilityKey
) {
  const current = abilities[key];

  if (current >= 15) {
    return false;
  }

  const currentCost = POINT_BUY_COST[current];
  const nextCost = POINT_BUY_COST[current + 1];

  return (
    getRemainingPoints(abilities) >=
    nextCost - currentCost
  );
}

export function canDecreaseAbility(
  abilities: Abilities,
  key: AbilityKey
) {
  return abilities[key] > 8;
}