import { beforeAll, describe, expect, it } from "vitest";
import { importCharacter, listCharacters } from "@/lib/storage/characters";
import type { Character } from "@/lib/types/character";

beforeAll(() => {
  const store: Record<string, string> = {};
  global.window = {
    localStorage: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
      length: 0,
      key: () => null,
    },
  } as unknown as Window & typeof globalThis;
});

describe("storage and validation", () => {
  const validCharacter: Character = {
    id: "test-id-123",
    step: 5,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    name: "Troll Champion",
    bio: "Um guerreiro feroz das terras do norte.",
    raceId: "orc",
    classId: "barbarian",
    backgroundId: "outlander",
    abilityGenerationMethod: "pointBuy",
    abilityGeneration: {
      method: "pointBuy",
      assignment: { str: 15, dex: 14, con: 13, int: 10, wis: 10, cha: 8 },
    },
    abilities: { str: 15, dex: 14, con: 13, int: 10, wis: 10, cha: 8 },
    skillProficiencies: ["athletics", "survival"],
    equipmentIds: ["greataxe", "javelin"],
    knownSpellIds: [],
    spellSlotsLevel1: 0,
    spellSlotsLevel2: 0,
    level: 1,
    proficiencyBonus: 2,
    maxHp: 13,
    currentHp: 13,
    ac: 14,
    speed: 30,
    currentSpellSlotsLevel1: 0,
    currentSpellSlotsLevel2: 0,
  };

  it("successfully imports a valid character and saves it", () => {
    const jsonString = JSON.stringify(validCharacter);
    const imported = importCharacter(jsonString);

    expect(imported).not.toBeNull();
    expect(imported?.id).toBe("test-id-123");
    expect(imported?.name).toBe("Troll Champion");
    expect(imported?.bio).toBe("Um guerreiro feroz das terras do norte.");
    expect(imported?.level).toBe(1);

    const saved = listCharacters();
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Troll Champion");
    expect(saved[0].bio).toBe("Um guerreiro feroz das terras do norte.");
  });

  it("fails to import an invalid character JSON", () => {
    const invalidJson = JSON.stringify({
      id: "another-id",
      name: 123, // should be string
      level: 1,
    });

    const imported = importCharacter(invalidJson);
    expect(imported).toBeNull();
  });

  it("fails to import completely non-json content", () => {
    const imported = importCharacter("not a json string");
    expect(imported).toBeNull();
  });
});
