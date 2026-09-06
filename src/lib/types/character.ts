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

export type AbilityGenerationMethod =
  | "roll-4d6"
  | "pointBuy";

export type AbilityGeneration = {
  method: AbilityGenerationMethod;
  rolledValues?: number[];
  rolledDetail?: { dice: number[]; dropped: number }[];
  assignment: Abilities;
};

export type PactMagic = {
  slotLevel: 1 | 2 | 3 | 4 | 5;
  maxSlots: number;
  currentSlots: number;
};

export type CharacterDraft = {
  id: string;
  step: number;
  updatedAt: string;

  name: string;
  bio?: string;
  avatarDataUrl?: string;

  raceId: string | null;
  classId: string | null;
  backgroundId: string | null;

  abilityGenerationMethod: AbilityGenerationMethod;
  abilityGeneration: AbilityGeneration;

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
  currentSpellSlotsLevel1: number;
  currentSpellSlotsLevel2: number;
  spellSlotsLevel4?: number;
  currentSpellSlotsLevel4?: number;
  pactMagic?: PactMagic;
  subclassId?: string;
  pactBoon?: string;
  invocations?: string[];
  classFeatures?: string[];
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
    bio: "",
    raceId: null,
    classId: null,
    backgroundId: null,
    abilityGenerationMethod: "roll-4d6",
    abilityGeneration: {
      method: "roll-4d6",
      assignment: { ...DEFAULT_ABILITIES },
    },
    abilities: { ...DEFAULT_ABILITIES },
    skillProficiencies: [],
    equipmentIds: [],
    knownSpellIds: [],
    spellSlotsLevel1: 0,
    spellSlotsLevel2: 0,
  };
}

