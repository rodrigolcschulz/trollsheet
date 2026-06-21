export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type Abilities = Record<AbilityKey, number>;

export type SkillKey =
  | "acrobatics"
  | "animalHandling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleightOfHand"
  | "stealth"
  | "survival";

export type AbilityGenerationMethod = "pointBuy";

export type CharacterDraft = {
  id: string;
  step: number;
  updatedAt: string;

  name: string;

  raceId: string | null;
  classId: string | null;
  backgroundId: string | null;

  abilityGenerationMethod: AbilityGenerationMethod;

  abilities: Abilities;

  skillProficiencies: SkillKey[];

  equipmentIds: string[];
  knownSpellIds: string[];
  spellSlotsLevel1: number;
  spellSlotsLevel2: number;
};

export type Character = CharacterDraft & {
  createdAt: string;
  level: number;
  proficiencyBonus: number;
  maxHp: number;
  currentHp: number;
  ac: number;
  speed: number;
};

export const DEFAULT_ABILITIES: Abilities = {
  str: 8,
  dex: 8,
  con: 8,
  int: 8,
  wis: 8,
  cha: 8,
};

export function createEmptyDraft(id: string): CharacterDraft {
  return {
    id,
    step: 0,
    updatedAt: new Date().toISOString(),
    name: "",
    raceId: null,
    classId: null,
    backgroundId: null,
    abilityGenerationMethod: "pointBuy",
    abilities: { ...DEFAULT_ABILITIES },
    skillProficiencies: [],
    equipmentIds: [],
    knownSpellIds: [],
    spellSlotsLevel1: 0,
    spellSlotsLevel2: 0,
  };
}
