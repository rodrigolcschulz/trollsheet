"use client";

import Link from "next/link";
import { useState } from "react";

import {
  CLASS_LABELS,
  RACE_LABELS,
  type ClassId,
  type RaceId,
} from "@/lib/rules/creation-data";
import {
  deleteCharacter,
  listCharacters,
  startNewDraft,
} from "@/lib/storage/characters";
import type { Character } from "@/lib/types/character";

export function HomePage() {
  const [characters, setCharacters] = useState<Character[]>(() => {
    if (typeof window === "undefined") return [];
    return listCharacters();
  });

  function handleNewCharacter() {
    startNewDraft();
  }

  function handleDelete(id: string) {
    deleteCharacter(id);
    setCharacters(listCharacters());
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 py-8">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-red-800">
          D&amp;D 5e · SRD
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
          Character Builder
        </h1>
        <p className="mt-2 text-zinc-600">
          Crie personagens nível 1 em passos, no estilo app mobile.
        </p>
      </header>

      <Link
        href="/create"
        onClick={handleNewCharacter}
        className="mb-8 block rounded-xl bg-red-800 px-4 py-4 text-center text-sm font-medium text-white hover:bg-red-900"
      >
        + Novo personagem
      </Link>

      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-500">
          Salvos neste dispositivo
        </h2>

        {characters.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
            Nenhum personagem ainda. Toque em &quot;Novo personagem&quot; para
            começar.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {characters.map((character) => (
              <li
                key={character.id}
                className="flex items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 py-4"
              >
                <Link
                  href={`/character/${character.id}`}
                  className="min-w-0 flex-1"
                >
                  <p className="font-medium text-zinc-900 hover:text-red-700">
                    {character.name || "Sem nome"}
                  </p>
                  <p className="text-sm capitalize text-zinc-500">
                    {character.raceId
                      ? RACE_LABELS[character.raceId as RaceId]
                      : "—"}{" "}
                    ·{" "}
                    {character.classId
                      ? CLASS_LABELS[character.classId as ClassId]
                      : "—"}{" "}
                    ·
                    nv {character.level}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(character.id)}
                  className="ml-4 text-sm text-red-600 hover:text-red-700"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
