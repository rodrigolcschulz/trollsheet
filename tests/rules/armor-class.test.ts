import { describe, expect, it } from "vitest";
import { calculateArmorClass } from "@/lib/rules/calculate";
import { DEFAULT_ABILITIES } from "@/lib/types/character";

describe("calculateArmorClass", () => {
  it("calculates unarmored AC based on Dexterity (10 + dexMod)", () => {
    // 14 DEX -> +2 mod -> 10 + 2 = 12
    const abilities = { ...DEFAULT_ABILITIES, dex: 14 };
    const result = calculateArmorClass(abilities);
    expect(result.total).toBe(12);
    expect(result.detail).toBe("(Des: +2)");

    // 10 DEX -> 0 mod -> 10 + 0 = 10
    const abilities10 = { ...DEFAULT_ABILITIES, dex: 10 };
    const result10 = calculateArmorClass(abilities10);
    expect(result10.total).toBe(10);
    expect(result10.detail).toBe("(Des: +0)");

    // 8 DEX -> -1 mod -> 10 - 1 = 9
    const abilities8 = { ...DEFAULT_ABILITIES, dex: 8 };
    const result8 = calculateArmorClass(abilities8);
    expect(result8.total).toBe(9);
    expect(result8.detail).toBe("(Des: -1)");
  });

  it("calculates leather armor AC (11 + dexMod)", () => {
    const abilities = { ...DEFAULT_ABILITIES, dex: 16 }; // +3
    const result = calculateArmorClass(abilities, ["armor-leather"]);
    expect(result.total).toBe(14); // 11 + 3
    expect(result.detail).toBe("(Couro + Des: +3)");
  });

  it("calculates scale mail AC with Dexterity capped at +2", () => {
    const abilities = { ...DEFAULT_ABILITIES, dex: 18 }; // +4, capped at +2
    const result = calculateArmorClass(abilities, ["armor-scale-mail"]);
    expect(result.total).toBe(16); // 14 + 2
    expect(result.detail).toBe("(Escamas + Des: +2)");
  });

  it("calculates chain mail AC (fixed 16, no Dex)", () => {
    const abilities = { ...DEFAULT_ABILITIES, dex: 18 }; // Dex does not add to heavy armor
    const result = calculateArmorClass(abilities, ["armor-chain-mail"]);
    expect(result.total).toBe(16);
    expect(result.detail).toBe("(Cota de Malha)");
  });

  it("adds +2 for shield", () => {
    const abilities = { ...DEFAULT_ABILITIES, dex: 14 }; // +2
    const result = calculateArmorClass(abilities, ["armor-chain-mail", "armor-shield"]);
    expect(result.total).toBe(18); // 16 + 2
    expect(result.detail).toBe("(Cota de Malha, Escudo: +2)");
  });

  it("calculates Barbarian unarmored defense (10 + Dex + Con)", () => {
    const abilities = { ...DEFAULT_ABILITIES, dex: 14, con: 16 }; // +2 Dex, +3 Con
    const result = calculateArmorClass(abilities, [], "barbarian");
    expect(result.total).toBe(15); // 10 + 2 + 3
    expect(result.detail).toBe("(Bárbaro: Des +2, Con +3)");
  });
});
