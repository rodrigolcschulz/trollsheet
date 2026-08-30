import {
  createEmptyDraft,
  type Character,
  type CharacterDraft,
} from "@/lib/types/character";

const DRAFT_KEY = "rpg_character_draft";
const CHARACTERS_KEY = "rpg_characters";

function generateUUID(): string {
  // Fallback para navegadores que não suportam crypto.randomUUID()
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Implementação compatível baseada em Math.random()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeDraft(input: CharacterDraft): CharacterDraft {
  const method = input.abilityGenerationMethod ?? "pointBuy";

  return {
    ...input,
    abilityGenerationMethod: method,
    abilityGeneration: input.abilityGeneration ?? {
      method,
      assignment: { ...input.abilities },
    },
    knownSpellIds: input.knownSpellIds ?? [],
    spellSlotsLevel1: input.spellSlotsLevel1 ?? 0,
    spellSlotsLevel2: input.spellSlotsLevel2 ?? 0,
  };
}

function normalizeCharacter(input: Character): Character {
  const spellSlotsLevel1 = input.spellSlotsLevel1 ?? 0;
  const spellSlotsLevel2 = input.spellSlotsLevel2 ?? 0;

  return {
    ...input,
    knownSpellIds: input.knownSpellIds ?? [],
    spellSlotsLevel1,
    spellSlotsLevel2,
    currentSpellSlotsLevel1: input.currentSpellSlotsLevel1 ?? spellSlotsLevel1,
    currentSpellSlotsLevel2: input.currentSpellSlotsLevel2 ?? spellSlotsLevel2,
  };
}

export function loadDraft(): CharacterDraft | null {
  const draft = readJson<CharacterDraft | null>(DRAFT_KEY, null);
  return draft ? normalizeDraft(draft) : null;
}

export function saveDraft(draft: CharacterDraft): void {
  writeJson(DRAFT_KEY, {
    ...normalizeDraft(draft),
    updatedAt: new Date().toISOString(),
  });
}

export function clearDraft(): void {
  window.localStorage.removeItem(DRAFT_KEY);
}

export function startNewDraft(): CharacterDraft {
  const draft = createEmptyDraft(generateUUID());
  saveDraft(draft);
  return draft;
}

export function listCharacters(): Character[] {
  return readJson<Character[]>(CHARACTERS_KEY, []).map((character) =>
    normalizeCharacter(character),
  );
}

export function getCharacterById(id: string): Character | null {
  return listCharacters().find((character) => character.id === id) ?? null;
}

export function saveCharacter(character: Character): void {
  const characters = listCharacters();
  const index = characters.findIndex((item) => item.id === character.id);

  if (index >= 0) {
    characters[index] = character;
  } else {
    characters.unshift(character);
  }

  writeJson(CHARACTERS_KEY, characters);
}

export function deleteCharacter(id: string): void {
  writeJson(
    CHARACTERS_KEY,
    listCharacters().filter((character) => character.id !== id),
  );
}

export function exportCharacterJson(character: Character): string {
  return JSON.stringify(character, null, 2);
}

export function downloadCharacterFile(character: Character): void {
  if (typeof window === "undefined") return;
  const jsonString = JSON.stringify(character, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Normaliza o nome para o arquivo de download
  const cleanName = character.name
    ? character.name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
    : "personagem";

  link.download = `trollsheet-${cleanName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importCharacter(jsonString: string): Character | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== "object") return null;

    // Validação básica estrutural para garantir tipo mínimo compatível
    if (typeof parsed.id !== "string" || !parsed.id) return null;
    if (typeof parsed.name !== "string") return null;
    if (typeof parsed.level !== "number") return null;
    if (!parsed.abilities || typeof parsed.abilities !== "object") return null;

    const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"] as const;
    for (const key of abilityKeys) {
      if (typeof parsed.abilities[key] !== "number") return null;
    }

    const character = normalizeCharacter(parsed as Character);
    saveCharacter(character);
    return character;
  } catch {
    return null;
  }
}
