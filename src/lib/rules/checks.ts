import { calculateModifier } from "./calculate";
import type { AbilityKey } from "@/lib/types/character";

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

export type ParsedDiceFormula = {
  multiplier: number;
  diceCount: number;
  diceSides: number;
  modifier: number;
  type?: string; // e.g. "perfurante", "fogo", "cura"
};

export type DiceRollResult = {
  formula: string; // formatted formula string (e.g. "1d8 + 3")
  rolls: {
    set: number[];
    total: number;
  }[];
  total: number;
  breakdown: string;
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

export function parseDiceFormula(formulaStr: string): ParsedDiceFormula | null {
  const clean = formulaStr.trim().toLowerCase();
  
  // Match patterns like: (multiplier x)? (+)? (diceCount)d(diceSides) (+ modifier)?
  const regex = /^(?:(\d+)\s*x\s*)?\+?(\d+)d(\d+)(?:\s*\+\s*(\d+))?/;
  const match = clean.match(regex);
  if (!match) return null;

  const multiplier = match[1] ? parseInt(match[1], 10) : 1;
  const diceCount = parseInt(match[2], 10);
  const diceSides = parseInt(match[3], 10);
  const modifier = match[4] ? parseInt(match[4], 10) : 0;

  const matchLength = match[0].length;
  const remaining = clean.slice(matchLength).trim();

  let type: string | undefined = undefined;
  if (remaining) {
    type = remaining;
  }

  return {
    multiplier,
    diceCount,
    diceSides,
    modifier,
    type,
  };
}

export function rollFormula(
  parsed: ParsedDiceFormula,
  additionalModifier: number = 0,
  rng: () => number = Math.random
): DiceRollResult {
  const rolls: { set: number[]; total: number }[] = [];
  let total = 0;

  for (let m = 0; m < parsed.multiplier; m++) {
    const setRolls: number[] = [];
    let setSum = 0;
    for (let c = 0; c < parsed.diceCount; c++) {
      const roll = Math.floor(rng() * parsed.diceSides) + 1;
      setRolls.push(roll);
      setSum += roll;
    }
    const setTotal = setSum + parsed.modifier + additionalModifier;
    rolls.push({ set: setRolls, total: setTotal });
    total += setTotal;
  }

  const totalMod = parsed.modifier + additionalModifier;
  const modStr = totalMod > 0 ? ` + ${totalMod}` : totalMod < 0 ? ` - ${Math.abs(totalMod)}` : "";

  let breakdown = "";
  if (parsed.multiplier > 1) {
    const setsText = rolls
      .map((r) => `(${r.set.join("+")}${totalMod > 0 ? ` + ${totalMod}` : totalMod < 0 ? ` - ${Math.abs(totalMod)}` : ""})`)
      .join(" + ");
    breakdown = `Rolado ${parsed.multiplier}x (${parsed.diceCount}d${parsed.diceSides}${modStr}): ${setsText} = ${total}`;
  } else {
    breakdown = `Rolado ${parsed.diceCount}d${parsed.diceSides}${modStr}: (${rolls[0].set.join("+")})${modStr} = ${total}`;
  }

  const formula = parsed.multiplier > 1
    ? `${parsed.multiplier}x (${parsed.diceCount}d${parsed.diceSides}${modStr})`
    : `${parsed.diceCount}d${parsed.diceSides}${modStr}`;

  return {
    formula,
    rolls,
    total,
    breakdown,
  };
}

export function getWeaponAbility(
  equipmentId: string,
  abilities: { str: number; dex: number }
): "str" | "dex" {
  if (equipmentId === "weapon-light-crossbow" || equipmentId === "weapon-longbow") return "dex";
  const strMod = calculateModifier(abilities.str);
  const dexMod = calculateModifier(abilities.dex);
  const isFinesse = ["weapon-dagger", "weapon-scimitar", "weapon-rapier"].includes(equipmentId);
  if (isFinesse) {
    return dexMod > strMod ? "dex" : "str";
  }
  return "str";
}

export function getSpellcastingAbility(classId: string | null): AbilityKey {
  if (!classId) return "cha";
  switch (classId) {
    case "wizard":
      return "int";
    case "cleric":
    case "druid":
    case "ranger":
      return "wis";
    case "sorcerer":
    case "warlock":
    case "bard":
    case "paladin":
      return "cha";
    default:
      return "cha";
  }
}