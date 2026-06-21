"use client";

import Link from "next/link";

import {
  ABILITY_LABELS,
  BACKGROUND_LABELS,
  CLASS_LABELS,
  EQUIPMENT_LABELS,
  RACE_LABELS,
  SPELL_LABELS,
  SKILL_LABELS,
  type BackgroundId,
  type ClassId,
  type RaceId,
  type SpellId,
} from "@/lib/rules/creation-data";
import { getCharacterById } from "@/lib/storage/characters";
import type { AbilityKey, Character } from "@/lib/types/character";

type CharacterDetailPageProps = {
  characterId: string;
};

export function CharacterDetailPage({ characterId }: CharacterDetailPageProps) {
  const character = getCharacterById(characterId);

  if (!character) {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 py-8">
        <Link href="/" className="mb-6 text-sm text-zinc-600 hover:text-zinc-900">
          ← Início
        </Link>
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          Personagem não encontrado neste dispositivo.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 py-8">
      <Link href="/" className="mb-6 text-sm text-zinc-600 hover:text-zinc-900">
        ← Início
      </Link>

      <header className="mb-6 rounded-xl border border-zinc-300 bg-white p-4">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {character.name || "Sem nome"}
        </h1>
        <p className="mt-2 text-sm capitalize text-zinc-600">
          {character.raceId ? RACE_LABELS[character.raceId as RaceId] : "—"} · {" "}
          {character.classId ? CLASS_LABELS[character.classId as ClassId] : "—"} · {" "}
          nv {character.level}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {character.backgroundId
            ? BACKGROUND_LABELS[character.backgroundId as BackgroundId]
            : "Sem background"}
        </p>
      </header>

      <Section title="Atributos">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map((ability) => (
            <div
              key={ability}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
            >
              <span className="font-medium text-zinc-700">{ABILITY_LABELS[ability]}</span>{" "}
              <span className="text-zinc-900">{character.abilities[ability]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Perícias">
        {character.skillProficiencies.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhuma perícia registrada.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {character.skillProficiencies.map((skill) => (
              <li
                key={skill}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-700"
              >
                {SKILL_LABELS[skill]}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Equipamento">
        {character.equipmentIds.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhum equipamento registrado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {character.equipmentIds.map((equipmentId) => (
              <li
                key={equipmentId}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                {EQUIPMENT_LABELS[equipmentId] ?? equipmentId}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Magia">
        {character.knownSpellIds.length === 0 ? (
          <p className="text-sm text-zinc-600">Sem magias registradas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {character.knownSpellIds.map((spellId) => (
              <li
                key={spellId}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                {SPELL_LABELS[spellId as SpellId] ?? spellId}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 text-sm text-zinc-600">
          Slots: nv1 {character.spellSlotsLevel1} · nv2 {character.spellSlotsLevel2}
        </div>
      </Section>

      <Section title="Combate">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="HP Máximo" value={character.maxHp} />
          <Stat label="HP Atual" value={character.currentHp} />
          <Stat label="CA" value={character.ac} />
          <Stat label="Deslocamento" value={character.speed} />
          <Stat label="Proficiência" value={character.proficiencyBonus} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-300 bg-white px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
