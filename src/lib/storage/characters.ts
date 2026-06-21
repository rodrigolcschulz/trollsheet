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
  return {
    ...input,
    knownSpellIds: input.knownSpellIds ?? [],
    spellSlotsLevel1: input.spellSlotsLevel1 ?? 0,
    spellSlotsLevel2: input.spellSlotsLevel2 ?? 0,
  };
}

function normalizeCharacter(input: Character): Character {
  return {
    ...input,
    knownSpellIds: input.knownSpellIds ?? [],
    spellSlotsLevel1: input.spellSlotsLevel1 ?? 0,
    spellSlotsLevel2: input.spellSlotsLevel2 ?? 0,
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
