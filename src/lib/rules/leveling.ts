import type { Abilities, AbilityKey } from "@/lib/types/character";
import { CLASS_SPELLCASTING, type ClassId } from "@/lib/rules/creation-data";

export const LEVEL_CAP = 20;

export const ASI_LEVELS = [4, 8, 12, 16, 19] as const;

export const ABILITY_SCORE_CAP = 20;

export function isAsiLevel(level: number): boolean {
  return (ASI_LEVELS as readonly number[]).includes(level);
}

export function rollHitDie(hitDie: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * hitDie) + 1;
}

export function calculateHpGain(
  hitDie: number,
  conModifier: number,
  rolledValue: number,
): number {
  return Math.max(1, rolledValue + conModifier);
}

export type AsiChoice =
  | { mode: "single"; ability: AbilityKey }
  | { mode: "two"; abilities: [AbilityKey, AbilityKey] };

export function validateAsiChoice(abilities: Abilities, choice: AsiChoice): string[] {
  const errors: string[] = [];

  if (choice.mode === "single") {
    if (abilities[choice.ability] >= ABILITY_SCORE_CAP) {
      errors.push(`${choice.ability} já está no máximo (${ABILITY_SCORE_CAP}).`);
    }
    return errors;
  }

  const [first, second] = choice.abilities;
  if (first === second) {
    errors.push("Escolha dois atributos diferentes.");
  }
  if (abilities[first] >= ABILITY_SCORE_CAP) {
    errors.push(`${first} já está no máximo (${ABILITY_SCORE_CAP}).`);
  }
  if (abilities[second] >= ABILITY_SCORE_CAP) {
    errors.push(`${second} já está no máximo (${ABILITY_SCORE_CAP}).`);
  }
  return errors;
}

export function applyAsiChoice(abilities: Abilities, choice: AsiChoice): Abilities {
  const next = { ...abilities };
  const increase = (key: AbilityKey, amount: number) => {
    next[key] = Math.min(ABILITY_SCORE_CAP, next[key] + amount);
  };

  if (choice.mode === "single") {
    increase(choice.ability, 2);
  } else {
    increase(choice.abilities[0], 1);
    increase(choice.abilities[1], 1);
  }

  return next;
}

export type SpellSlots = {
  slotLevel1: number;
  slotLevel2: number;
};

/**
 * Progressão homebrew: slots crescem até estabilizar por volta do nível 3-4.
 * Classes sem slot inicial (não-conjuradoras) permanecem em 0 em todos os níveis.
 */
export function getSpellSlotsForLevel(classId: ClassId, level: number): SpellSlots {
  const baseline = CLASS_SPELLCASTING[classId]?.slotLevel1 ?? 0;
  if (baseline === 0) {
    return { slotLevel1: 0, slotLevel2: 0 };
  }

  const slotLevel1 = level >= 3 ? baseline + 2 : level === 2 ? baseline + 1 : baseline;
  const slotLevel2 = level >= 4 ? 3 : level === 3 ? 2 : 0;

  return { slotLevel1, slotLevel2 };
}

/**
 * Progressão homebrew: +1 magia conhecida a cada 3 níveis, limitada às opções da classe.
 */
export function getMaxKnownSpellsForLevel(classId: ClassId, level: number): number {
  const spellcasting = CLASS_SPELLCASTING[classId];
  if (!spellcasting || spellcasting.maxKnownSpells === 0) {
    return 0;
  }

  const grown = spellcasting.maxKnownSpells + Math.floor((level - 1) / 3);
  return Math.min(grown, spellcasting.spellOptions.length);
}
