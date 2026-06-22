import type { AbilityKey, CharacterDraft, SkillKey } from "@/lib/types/character";

export const RACE_OPTIONS = [
  "human",
  "elf",
  "dwarf",
  "halfling",
  "dragonborn",
  "tiefling",
  "halfElf",
  "halfOrc",
  "gnome",
] as const;
export const CLASS_OPTIONS = [
  "barbarian",
  "fighter",
  "rogue",
  "wizard",
  "sorcerer",
  "warlock",
  "cleric",
  "druid",
  "bard",
  "paladin",
] as const;
export const BACKGROUND_OPTIONS = [
  "acolyte",
  "criminal",
  "soldier",
  "sage",
  "entertainer",
  "folkHero",
  "noble",
  "hermit",
  "outlander",
  "urchin",
] as const;

export type RaceId = (typeof RACE_OPTIONS)[number];
export type ClassId = (typeof CLASS_OPTIONS)[number];
export type BackgroundId = (typeof BACKGROUND_OPTIONS)[number];

export const CLASS_RULES: Record<
  ClassId,
  {
    hitDie: number;
    skillChoices: number;
    skillPool: SkillKey[];
  }
> = {
  barbarian: {
    hitDie: 12,
    skillChoices: 2,
    skillPool: [
      "animalHandling",
      "athletics",
      "intimidation",
      "nature",
      "perception",
      "survival",
    ],
  },
  fighter: {
    hitDie: 10,
    skillChoices: 2,
    skillPool: [
      "acrobatics",
      "animalHandling",
      "athletics",
      "history",
      "insight",
      "intimidation",
      "perception",
      "survival",
    ],
  },
  rogue: {
    hitDie: 8,
    skillChoices: 4,
    skillPool: [
      "acrobatics",
      "athletics",
      "deception",
      "insight",
      "intimidation",
      "investigation",
      "perception",
      "performance",
      "persuasion",
      "sleightOfHand",
      "stealth",
    ],
  },
  wizard: {
    hitDie: 6,
    skillChoices: 2,
    skillPool: [
      "arcana",
      "history",
      "insight",
      "investigation",
      "medicine",
      "religion",
    ],
  },
  sorcerer: {
    hitDie: 6,
    skillChoices: 2,
    skillPool: [
      "arcana",
      "deception",
      "insight",
      "intimidation",
      "persuasion",
      "religion",
    ],
  },
  warlock: {
    hitDie: 8,
    skillChoices: 2,
    skillPool: [
      "arcana",
      "deception",
      "history",
      "intimidation",
      "investigation",
      "nature",
      "religion",
    ],
  },
  cleric: {
    hitDie: 8,
    skillChoices: 2,
    skillPool: [
      "history",
      "insight",
      "medicine",
      "persuasion",
      "religion",
    ],
  },
  druid: {
    hitDie: 8,
    skillChoices: 2,
    skillPool: [
      "arcana",
      "animalHandling",
      "insight",
      "medicine",
      "nature",
      "perception",
      "religion",
      "survival",
    ],
  },
  bard: {
    hitDie: 8,
    skillChoices: 3,
    skillPool: [
      "acrobatics",
      "animalHandling",
      "arcana",
      "athletics",
      "deception",
      "history",
      "insight",
      "intimidation",
      "investigation",
      "medicine",
      "nature",
      "perception",
      "performance",
      "persuasion",
      "religion",
      "sleightOfHand",
      "stealth",
      "survival",
    ],
  },
  paladin: {
    hitDie: 10,
    skillChoices: 2,
    skillPool: [
      "athletics",
      "insight",
      "intimidation",
      "medicine",
      "persuasion",
      "religion",
    ],
  },
};

export const RACE_RULES: Record<
  RaceId,
  {
    speed: number;
    abilityBonuses: Partial<Record<AbilityKey, number>>;
  }
> = {
  human: {
    speed: 30,
    abilityBonuses: {
      str: 1,
      dex: 1,
      con: 1,
      int: 1,
      wis: 1,
      cha: 1,
    },
  },
  elf: {
    speed: 30,
    abilityBonuses: {
      dex: 2,
    },
  },
  dwarf: {
    speed: 25,
    abilityBonuses: {
      con: 2,
    },
  },
  halfling: {
    speed: 25,
    abilityBonuses: {
      dex: 2,
    },
  },
  dragonborn: {
    speed: 30,
    abilityBonuses: {
      str: 2,
      cha: 1,
    },
  },
  tiefling: {
    speed: 30,
    abilityBonuses: {
      int: 1,
      cha: 2,
    },
  },
  halfElf: {
    speed: 30,
    abilityBonuses: {
      cha: 2,
      dex: 1,
      con: 1,
    },
  },
  halfOrc: {
    speed: 30,
    abilityBonuses: {
      str: 2,
      con: 1,
    },
  },
  gnome: {
    speed: 25,
    abilityBonuses: {
      int: 2,
    },
  },
};

export const BACKGROUND_RULES: Record<
  BackgroundId,
  { grantedSkills: [SkillKey, SkillKey] }
> = {
  acolyte: {
    grantedSkills: ["insight", "religion"],
  },
  criminal: {
    grantedSkills: ["deception", "stealth"],
  },
  soldier: {
    grantedSkills: ["athletics", "intimidation"],
  },
  sage: {
    grantedSkills: ["arcana", "history"],
  },
  entertainer: {
    grantedSkills: ["acrobatics", "performance"],
  },
  folkHero: {
    grantedSkills: ["animalHandling", "survival"],
  },
  noble: {
    grantedSkills: ["history", "persuasion"],
  },
  hermit: {
    grantedSkills: ["medicine", "religion"],
  },
  outlander: {
    grantedSkills: ["athletics", "survival"],
  },
  urchin: {
    grantedSkills: ["sleightOfHand", "stealth"],
  },
};

export const BACKGROUND_SUMMARIES: Record<BackgroundId, string> = {
  acolyte: "Vida dedicada a um templo, fé e serviço espiritual.",
  criminal: "Passado ligado ao submundo, trapaças e contatos suspeitos.",
  soldier: "Treinamento militar, disciplina e experiência de combate.",
  sage: "Anos de estudo, pesquisa e conhecimento arcano ou histórico.",
  entertainer: "Palco, público e talento para encantar uma multidão.",
  folkHero: "Alguém comum que virou referência por feitos locais.",
  noble: "Origem privilegiada, etiqueta e responsabilidades sociais.",
  hermit: "Solitude, contemplação e uma descoberta pessoal importante.",
  outlander: "Vida longe da civilização, sobrevivência e exploração.",
  urchin: "Crescimento nas ruas, improviso e sobrevivência diária.",
};

export const RACE_LABELS: Record<RaceId, string> = {
  human: "human",
  elf: "elf",
  dwarf: "dwarf",
  halfling: "halfling",
  dragonborn: "dragonborn",
  tiefling: "tiefling",
  halfElf: "half-elf",
  halfOrc: "half-orc",
  gnome: "gnome",
};

export const CLASS_LABELS: Record<ClassId, string> = {
  barbarian: "barbarian",
  fighter: "fighter",
  rogue: "rogue",
  wizard: "wizard",
  sorcerer: "sorcerer",
  warlock: "warlock",
  cleric: "cleric",
  druid: "druid",
  bard: "bard",
  paladin: "paladin",
};

export const BACKGROUND_LABELS: Record<BackgroundId, string> = {
  acolyte: "acolyte",
  criminal: "criminal",
  soldier: "soldier",
  sage: "sage",
  entertainer: "entertainer",
  folkHero: "folk hero",
  noble: "noble",
  hermit: "hermit",
  outlander: "outlander",
  urchin: "urchin",
};

export const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

export const SKILL_LABELS: Record<SkillKey, string> = {
  acrobatics: "Acrobatics (Acrobacia)",
  animalHandling: "Animal Handling (Adestrar Animais)",
  arcana: "Arcana",
  athletics: "Athletics (Atletismo)",
  deception: "Deception (Enganacao)",
  history: "History (Historia)",
  insight: "Insight (Intuicao)",
  intimidation: "Intimidation (Intimidacao)",
  investigation: "Investigation (Investigacao)",
  medicine: "Medicine (Medicina)",
  nature: "Nature (Natureza)",
  perception: "Perception (Percepcao)",
  performance: "Performance (Atuacao)",
  persuasion: "Persuasion (Persuasao)",
  religion: "Religion (Religiao)",
  sleightOfHand: "Sleight of Hand (Prestidigitacao)",
  stealth: "Stealth (Furtividade)",
  survival: "Survival (Sobrevivencia)",
};

export const SKILL_ABILITY_MAP: Record<SkillKey, AbilityKey> = {
  athletics: "str",
  acrobatics: "dex",
  sleightOfHand: "dex",
  stealth: "dex",
  arcana: "int",
  history: "int",
  investigation: "int",
  nature: "int",
  religion: "int",
  animalHandling: "wis",
  insight: "wis",
  medicine: "wis",
  perception: "wis",
  survival: "wis",
  deception: "cha",
  intimidation: "cha",
  performance: "cha",
  persuasion: "cha",
};

export const SKILL_DESCRIPTIONS: Record<SkillKey, string> = {
  athletics: "Escalar, nadar, arremessar e usar forca bruta.",
  acrobatics: "Equilibrio, saltos e controle corporal.",
  sleightOfHand: "Furtar, esconder objetos e truques manuais.",
  stealth: "Se esconder e se mover sem ser visto.",
  arcana: "Conhecimento sobre magia e fenomenos arcanos.",
  history: "Eventos, civilizacoes e fatos historicos.",
  investigation: "Deduzir pistas e resolver misterios.",
  nature: "Mundo natural, plantas, animais e terrenos.",
  religion: "Deuses, cultos, ritos e mitologia.",
  animalHandling: "Lidar, acalmar e conduzir animais.",
  insight: "Perceber intencoes e mentiras.",
  medicine: "Primeiros socorros e cuidados basicos.",
  perception: "Notar detalhes, ameaças e coisas ocultas.",
  survival: "Rastrear, orientar-se e viver na natureza.",
  deception: "Mentir, blefar e enganar.",
  intimidation: "Ameacar e impor respeito.",
  performance: "Apresentacoes artisticas e encenacao.",
  persuasion: "Convencer e negociar com diplomacia.",
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  "weapon-quarterstaff": "Quarterstaff",
  "weapon-dagger": "Dagger",
  "weapon-mace": "Mace",
  "weapon-spear": "Spear",
  "weapon-scimitar": "Scimitar",
  "weapon-longsword": "Longsword",
  "weapon-rapier": "Rapier",
  "weapon-warhammer": "Warhammer",
  "weapon-light-crossbow": "Light Crossbow",
  "armor-leather": "Leather Armor",
  "armor-chain-mail": "Chain Mail",
  "armor-scale-mail": "Scale Mail",
  "armor-shield": "Shield",
  "focus-holy-symbol": "Holy Symbol",
  "focus-druidic": "Druidic Focus",
  "focus-arcane": "Arcane Focus",
  "pack-priest": "Priest Pack",
  "pack-scholar": "Scholar Pack",
  "pack-explorer": "Explorer's Pack",
  "pack-dungeoneer": "Dungeoneer's Pack",
  "instrument-lute": "Lute",
  "tools-thieves-tools": "Thieves' Tools",
};

export const EQUIPMENT_DAMAGE: Record<string, string> = {
  "weapon-quarterstaff": "1d6 contundente",
  "weapon-dagger": "1d4 perfurante",
  "weapon-mace": "1d6 contundente",
  "weapon-spear": "1d6 perfurante",
  "weapon-scimitar": "1d6 cortante",
  "weapon-longsword": "1d8 cortante",
  "weapon-rapier": "1d8 perfurante",
  "weapon-warhammer": "1d8 contundente",
  "weapon-light-crossbow": "1d8 perfurante",
};

export const CLASS_STARTER_EQUIPMENT: Record<ClassId, string[]> = {
  barbarian: ["weapon-spear", "armor-shield", "pack-explorer"],
  fighter: ["weapon-longsword", "armor-chain-mail", "armor-shield", "pack-explorer"],
  rogue: [
    "weapon-rapier",
    "weapon-dagger",
    "armor-leather",
    "tools-thieves-tools",
    "pack-dungeoneer",
  ],
  wizard: ["weapon-quarterstaff", "weapon-dagger", "focus-arcane", "pack-scholar"],
  sorcerer: ["weapon-light-crossbow", "weapon-dagger", "focus-arcane", "pack-dungeoneer"],
  warlock: ["weapon-light-crossbow", "armor-leather", "focus-arcane", "pack-scholar"],
  cleric: ["weapon-mace", "armor-scale-mail", "armor-shield", "focus-holy-symbol", "pack-priest"],
  druid: ["weapon-scimitar", "armor-leather", "armor-shield", "focus-druidic", "pack-explorer"],
  bard: ["weapon-rapier", "armor-leather", "instrument-lute", "pack-explorer", "weapon-dagger"],
  paladin: ["weapon-longsword", "armor-chain-mail", "armor-shield", "focus-holy-symbol", "pack-explorer"],
};

export type SpellId =
  | "magicMissile"
  | "burningHands"
  | "shield"
  | "healingWord"
  | "cureWounds"
  | "guidingBolt"
  | "charmPerson"
  | "dissonantWhispers"
  | "thunderwave"
  | "hex"
  | "witchBolt"
  | "faerieFire"
  | "entangle"
  | "thunderousSmite";

export const SPELL_LABELS: Record<SpellId, string> = {
  magicMissile: "Magic Missile",
  burningHands: "Burning Hands",
  shield: "Shield",
  healingWord: "Healing Word",
  cureWounds: "Cure Wounds",
  guidingBolt: "Guiding Bolt",
  charmPerson: "Charm Person",
  dissonantWhispers: "Dissonant Whispers",
  thunderwave: "Thunderwave",
  hex: "Hex",
  witchBolt: "Witch Bolt",
  faerieFire: "Faerie Fire",
  entangle: "Entangle",
  thunderousSmite: "Thunderous Smite",
};

export const SPELL_DESCRIPTIONS: Record<SpellId, string> = {
  magicMissile: "Dardos arcanos que acertam automaticamente.",
  burningHands: "Cone de fogo em curta distancia.",
  shield: "Reacao defensiva que aumenta sua CA temporariamente.",
  healingWord: "Cura rapida a distancia com palavra divina.",
  cureWounds: "Cura por toque para um aliado.",
  guidingBolt: "Raio radiante que marca o alvo.",
  charmPerson: "Encanta um humanoide e melhora interacoes sociais.",
  dissonantWhispers: "Sussurros mentais que causam dano psiquico.",
  thunderwave: "Onda trovejante que empurra inimigos.",
  hex: "Maldicao que aumenta seu dano contra o alvo.",
  witchBolt: "Raio eletrico sustentado em um alvo.",
  faerieFire: "Luz feerica que revela alvos e concede vantagem.",
  entangle: "Vinhas prendem criaturas em uma area.",
  thunderousSmite: "Golpe energizado com trovão para paladinos.",
};

export const SPELL_DAMAGE: Partial<Record<SpellId, string>> = {
  magicMissile: "3x 1d4 + 1",
  burningHands: "3d6 fogo",
  guidingBolt: "4d6 radiante",
  dissonantWhispers: "3d6 psíquico",
  thunderwave: "2d8 trovão",
  hex: "+1d6 nos acertos",
  witchBolt: "1d12 raio",
  thunderousSmite: "2d6 trovão",
};

export const SPELL_HEALING: Partial<Record<SpellId, string>> = {
  healingWord: "1d4",
  cureWounds: "1d8",
};

/**
 * Dano de arma - tipo e quantidade
 * Usado para calcular dano em combate corpo a corpo
 */

export const SPELL_LEVELS: Record<SpellId, 1> = {
  magicMissile: 1,
  burningHands: 1,
  shield: 1,
  healingWord: 1,
  cureWounds: 1,
  guidingBolt: 1,
  charmPerson: 1,
  dissonantWhispers: 1,
  thunderwave: 1,
  hex: 1,
  witchBolt: 1,
  faerieFire: 1,
  entangle: 1,
  thunderousSmite: 1,
};

export const CLASS_SPELLCASTING: Partial<
  Record<
    ClassId,
    {
      slotLevel1: number;
      slotLevel2: number;
      maxKnownSpells: number;
      spellOptions: SpellId[];
    }
  >
> = {
  wizard: {
    slotLevel1: 2,
    slotLevel2: 0,
    maxKnownSpells: 3,
    spellOptions: ["magicMissile", "burningHands", "shield", "charmPerson", "thunderwave"],
  },
  sorcerer: {
    slotLevel1: 2,
    slotLevel2: 0,
    maxKnownSpells: 2,
    spellOptions: ["magicMissile", "burningHands", "shield", "witchBolt", "charmPerson"],
  },
  warlock: {
    slotLevel1: 1,
    slotLevel2: 0,
    maxKnownSpells: 2,
    spellOptions: ["hex", "charmPerson", "witchBolt", "burningHands"],
  },
  cleric: {
    slotLevel1: 2,
    slotLevel2: 0,
    maxKnownSpells: 3,
    spellOptions: ["healingWord", "cureWounds", "guidingBolt", "shield"],
  },
  druid: {
    slotLevel1: 2,
    slotLevel2: 0,
    maxKnownSpells: 3,
    spellOptions: ["cureWounds", "faerieFire", "entangle", "thunderwave"],
  },
  bard: {
    slotLevel1: 2,
    slotLevel2: 0,
    maxKnownSpells: 2,
    spellOptions: ["charmPerson", "dissonantWhispers", "healingWord", "thunderwave"],
  },
  paladin: {
    slotLevel1: 0,
    slotLevel2: 0,
    maxKnownSpells: 0,
    spellOptions: ["thunderousSmite"],
  },
};

const ALL_SKILLS: SkillKey[] = [
  "acrobatics",
  "animalHandling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleightOfHand",
  "stealth",
  "survival",
];

export function applyRacialAbilityBonuses(
  abilities: CharacterDraft["abilities"],
  raceId: string | null,
): CharacterDraft["abilities"] {
  if (!raceId || !(raceId in RACE_RULES)) {
    return abilities;
  }

  const bonuses = RACE_RULES[raceId as RaceId].abilityBonuses;
  const finalAbilities = { ...abilities };

  for (const key of Object.keys(finalAbilities) as AbilityKey[]) {
    finalAbilities[key] += bonuses[key] ?? 0;
  }

  return finalAbilities;
}

export function getFinalSkillProficiencies(
  classSkills: SkillKey[],
  backgroundId: string | null,
): SkillKey[] {
  if (!backgroundId || !(backgroundId in BACKGROUND_RULES)) {
    return classSkills;
  }

  const grantedSkills = BACKGROUND_RULES[backgroundId as BackgroundId].grantedSkills;
  const expectedSize = classSkills.length + grantedSkills.length;
  const uniqueSkills = [...new Set<SkillKey>([...classSkills, ...grantedSkills])];

  if (uniqueSkills.length >= expectedSize) {
    return uniqueSkills;
  }

  const replacements = ALL_SKILLS.filter((skill) => !uniqueSkills.includes(skill));
  const missingCount = expectedSize - uniqueSkills.length;

  return [...uniqueSkills, ...replacements.slice(0, missingCount)];
}
