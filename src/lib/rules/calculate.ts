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

export type ArmorClassResult = {
  total: number;
  base: number;
  dexModifier: number;
  armorBonus: number;
  shieldBonus: number;
  detail: string;
};

export function calculateArmorClass(
  abilities: Abilities,
  equipmentIds: string[] = [],
  classId?: string | null
): ArmorClassResult {
  const dexMod = calculateModifier(abilities.dex);
  const conMod = calculateModifier(abilities.con);

  const hasChainMail = equipmentIds.includes("armor-chain-mail");
  const hasScaleMail = equipmentIds.includes("armor-scale-mail");
  const hasLeather = equipmentIds.includes("armor-leather");
  const hasShield = equipmentIds.includes("armor-shield");
  const shieldBonus = hasShield ? 2 : 0;

  let base = 10;
  let dexContribution = dexMod;
  let armorBonus = 0;

  const parts: string[] = [];

  if (hasChainMail) {
    base = 16;
    armorBonus = 6;
    dexContribution = 0;
    parts.push("Cota de Malha");
  } else if (hasScaleMail) {
    base = 14;
    armorBonus = 4;
    dexContribution = Math.min(2, Math.max(0, dexMod));
    parts.push(`Escamas + Des: ${formatModifier(dexContribution)}`);
  } else if (hasLeather) {
    base = 11;
    armorBonus = 1;
    dexContribution = dexMod;
    parts.push(`Couro + Des: ${formatModifier(dexMod)}`);
  } else if (classId === "barbarian") {
    base = 10 + conMod;
    dexContribution = dexMod;
    parts.push(`Bárbaro: Des ${formatModifier(dexMod)}, Con ${formatModifier(conMod)}`);
  } else {
    parts.push(`Des: ${formatModifier(dexMod)}`);
  }

  if (hasShield) {
    parts.push("Escudo: +2");
  }

  const total = base + dexContribution + shieldBonus;
  const detail = parts.length > 0 ? `(${parts.join(", ")})` : "";

  return {
    total,
    base,
    dexModifier: dexMod,
    armorBonus,
    shieldBonus,
    detail,
  };
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
