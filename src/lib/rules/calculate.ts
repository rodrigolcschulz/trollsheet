import type { Abilities, AbilityKey } from "@/lib/types/character";

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

export function getAbilityModifier(
  abilities: Abilities,
  key: AbilityKey,
): number {
  return calculateModifier(abilities[key]);
}

export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Calcula o dano de um spell de magia
 * Exemplo: "3d6 fogo" retorna um objeto com dados e tipo de dano
 */
export function parseSpellDamage(damageString: string): {
  dice: string;
  damageType: string;
} {
  const match = damageString.match(/^(.+?)\s+(.+)$/);
  if (!match) {
    return { dice: damageString, damageType: "dano" };
  }
  return {
    dice: match[1],
    damageType: match[2],
  };
}

/**
 * Calcula a cura de um spell
 * Exemplo: "1d4" retorna um objeto com os dados de cura
 */
export function parseSpellHealing(healingString: string): {
  dice: string;
} {
  return {
    dice: healingString,
  };
}

/**
 * Simula um lançamento de dado (matemática simples, sem gerador aleatório)
 * Retorna o valor esperado (média)
 * Exemplo: "1d4" retorna 2.5, "2d6" retorna 7
 */
export function calculateAverageDamage(diceString: string): number {
  const match = diceString.match(/^(\d+)d(\d+)(?:\s*\+\s*(\d+))?$/);
  if (!match) return 0;

  const numDice = parseInt(match[1], 10);
  const diceSize = parseInt(match[2], 10);
  const bonus = match[3] ? parseInt(match[3], 10) : 0;

  const averagePerDie = (diceSize + 1) / 2;
  return numDice * averagePerDie + bonus;
}
