"use client";

import { useMemo, useState } from "react";

import {
  ABILITY_LABELS,
  CLASS_RULES,
  CLASS_SPELLCASTING,
  SPELL_LABELS,
  type ClassId,
  type SpellId,
} from "@/lib/rules/creation-data";
import { calculateArmorClass, calculateModifier, calculateProficiencyBonus } from "@/lib/rules/calculate";
import {
  applyAsiChoice,
  calculateHpGain,
  getMaxKnownSpellsForLevel,
  getSpellSlotsForLevel,
  isAsiLevel,
  rollHitDie,
  validateAsiChoice,
  type AsiChoice,
} from "@/lib/rules/leveling";
import type { AbilityKey, Character } from "@/lib/types/character";

type LevelUpFlowProps = {
  character: Character;
  onClose: () => void;
  onComplete: (updated: Character) => void;
};

type StepId = "hp" | "asi" | "spells" | "summary";

export function LevelUpFlow({ character, onClose, onComplete }: LevelUpFlowProps) {
  const nextLevel = character.level + 1;
  const classId = character.classId as ClassId | null;
  const hitDie = classId ? CLASS_RULES[classId].hitDie : 8;
  const conModifier = calculateModifier(character.abilities.con);
  const spellcasting = classId ? CLASS_SPELLCASTING[classId] : undefined;

  const nextMaxKnownSpells = classId ? getMaxKnownSpellsForLevel(classId, nextLevel) : 0;
  const availableSpellOptions = useMemo(
    () =>
      (spellcasting?.spellOptions ?? []).filter(
        (spellId) => !character.knownSpellIds.includes(spellId),
      ),
    [spellcasting, character.knownSpellIds],
  );
  const spellsToChoose = Math.max(
    0,
    Math.min(
      nextMaxKnownSpells - character.knownSpellIds.length,
      availableSpellOptions.length,
    ),
  );

  const steps: StepId[] = [
    "hp",
    ...(isAsiLevel(nextLevel) ? (["asi"] as const) : []),
    ...(spellsToChoose > 0 ? (["spells"] as const) : []),
    "summary",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [asiChoice, setAsiChoice] = useState<AsiChoice | null>(null);
  const [chosenSpellIds, setChosenSpellIds] = useState<SpellId[]>([]);

  const currentStep = steps[stepIndex];
  const hpGain = hpRoll !== null ? calculateHpGain(hitDie, conModifier, hpRoll) : null;
  const nextAbilities = asiChoice ? applyAsiChoice(character.abilities, asiChoice) : character.abilities;
  const asiErrors = asiChoice ? validateAsiChoice(character.abilities, asiChoice) : [];

  const canAdvance =
    (currentStep === "hp" && hpRoll !== null) ||
    (currentStep === "asi" && asiChoice !== null && asiErrors.length === 0) ||
    (currentStep === "spells" && chosenSpellIds.length === spellsToChoose) ||
    currentStep === "summary";

  function goNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  }

  function toggleSpell(spellId: SpellId) {
    setChosenSpellIds((current) => {
      if (current.includes(spellId)) {
        return current.filter((id) => id !== spellId);
      }
      if (current.length >= spellsToChoose) {
        return current;
      }
      return [...current, spellId];
    });
  }

  function confirmLevelUp() {
    if (hpGain === null) return;

    const slots = classId
      ? getSpellSlotsForLevel(classId, nextLevel)
      : { slotLevel1: character.spellSlotsLevel1, slotLevel2: character.spellSlotsLevel2 };

    const updated: Character = {
      ...character,
      level: nextLevel,
      proficiencyBonus: calculateProficiencyBonus(nextLevel),
      maxHp: character.maxHp + hpGain,
      currentHp: character.currentHp + hpGain,
      abilities: nextAbilities,
      ac: calculateArmorClass(nextAbilities, character.equipmentIds, character.classId).total,
      spellSlotsLevel1: slots.slotLevel1,
      spellSlotsLevel2: slots.slotLevel2,
      currentSpellSlotsLevel1: slots.slotLevel1,
      currentSpellSlotsLevel2: slots.slotLevel2,
      knownSpellIds: [...character.knownSpellIds, ...chosenSpellIds],
    };

    onComplete(updated);
  }

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-title"
        className="w-full max-w-md rounded-xl border border-zinc-300 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="level-up-title" className="text-lg font-semibold text-zinc-900">
            Subir para nível {nextLevel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-xl text-zinc-500 hover:text-zinc-900"
          >
            ×
          </button>
        </div>

        <p className="mt-1 text-xs text-zinc-500">
          Passo {stepIndex + 1} de {steps.length}
        </p>

        <div className="mt-4">
          {currentStep === "hp" ? (
            <HpStep hitDie={hitDie} conModifier={conModifier} hpRoll={hpRoll} hpGain={hpGain} onRoll={() => setHpRoll(rollHitDie(hitDie))} />
          ) : null}

          {currentStep === "asi" ? (
            <AsiStep abilities={character.abilities} choice={asiChoice} errors={asiErrors} onChange={setAsiChoice} />
          ) : null}

          {currentStep === "spells" ? (
            <SpellsStep
              options={availableSpellOptions}
              chosen={chosenSpellIds}
              limit={spellsToChoose}
              onToggle={toggleSpell}
            />
          ) : null}

          {currentStep === "summary" ? (
            <SummaryStep
              nextLevel={nextLevel}
              hpGain={hpGain ?? 0}
              abilities={character.abilities}
              nextAbilities={nextAbilities}
              chosenSpellIds={chosenSpellIds}
            />
          ) : null}
        </div>

        <div className="mt-5 flex gap-2">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Voltar
            </button>
          ) : null}

          {currentStep === "summary" ? (
            <button
              type="button"
              onClick={confirmLevelUp}
              className="flex-1 rounded-lg bg-red-800 px-4 py-3 font-medium text-white hover:bg-red-900"
            >
              Confirmar
            </button>
          ) : (
            <button
              type="button"
              disabled={!canAdvance}
              onClick={goNext}
              className="flex-1 rounded-lg bg-red-800 px-4 py-3 font-medium text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function HpStep({
  hitDie,
  conModifier,
  hpRoll,
  hpGain,
  onRoll,
}: {
  hitDie: number;
  conModifier: number;
  hpRoll: number | null;
  hpGain: number | null;
  onRoll: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-zinc-700">
      <p>Role o dado de vida (d{hitDie}) para descobrir quanto HP você ganha.</p>
      <button
        type="button"
        onClick={onRoll}
        className="rounded-lg border border-zinc-300 px-4 py-3 font-medium hover:border-red-700 hover:bg-red-50"
      >
        🎲 Rolar d{hitDie}
      </button>
      {hpRoll !== null ? (
        <div className="rounded-lg bg-zinc-100 p-3">
          <p>Rolado: {hpRoll} + mod. CON ({conModifier})</p>
          <p className="mt-1 font-medium">Ganho de HP: +{hpGain}</p>
        </div>
      ) : null}
    </div>
  );
}

function AsiStep({
  abilities,
  choice,
  errors,
  onChange,
}: {
  abilities: Character["abilities"];
  choice: AsiChoice | null;
  errors: string[];
  onChange: (choice: AsiChoice) => void;
}) {
  const abilityKeys = Object.keys(ABILITY_LABELS) as AbilityKey[];

  return (
    <div className="flex flex-col gap-3 text-sm text-zinc-700">
      <p>Melhoria de atributo: +2 em um atributo, ou +1 em dois atributos.</p>

      <div>
        <p className="mb-1 font-medium">+2 em um atributo</p>
        <div className="grid grid-cols-3 gap-2">
          {abilityKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ mode: "single", ability: key })}
              className={`rounded-lg border px-2 py-2 text-xs ${
                choice?.mode === "single" && choice.ability === key
                  ? "border-red-800 bg-red-800 text-white"
                  : "border-zinc-300 bg-white"
              }`}
            >
              {ABILITY_LABELS[key]} ({abilities[key]})
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 font-medium">+1 em dois atributos</p>
        <div className="grid grid-cols-3 gap-2">
          {abilityKeys.map((key) => {
            const selected = choice?.mode === "two" && choice.abilities.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const current: AbilityKey[] = choice?.mode === "two" ? choice.abilities : [];
                  const nextAbilities = current.includes(key)
                    ? current.filter((item) => item !== key)
                    : [...current, key].slice(-2);
                  if (nextAbilities.length === 2) {
                    onChange({
                      mode: "two",
                      abilities: nextAbilities as [AbilityKey, AbilityKey],
                    });
                  }
                }}
                className={`rounded-lg border px-2 py-2 text-xs ${
                  selected ? "border-red-800 bg-red-800 text-white" : "border-zinc-300 bg-white"
                }`}
              >
                {ABILITY_LABELS[key]} ({abilities[key]})
              </button>
            );
          })}
        </div>
      </div>

      {errors.length > 0 ? (
        <p className="text-xs text-red-700">{errors.join(" ")}</p>
      ) : null}
    </div>
  );
}

function SpellsStep({
  options,
  chosen,
  limit,
  onToggle,
}: {
  options: SpellId[];
  chosen: SpellId[];
  limit: number;
  onToggle: (spellId: SpellId) => void;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-zinc-700">
      <p>
        Escolha {limit} nova{limit > 1 ? "s" : ""} magia{limit > 1 ? "s" : ""} ({chosen.length}/{limit}).
      </p>
      <div className="flex flex-col gap-2">
        {options.map((spellId) => {
          const selected = chosen.includes(spellId);
          return (
            <button
              key={spellId}
              type="button"
              onClick={() => onToggle(spellId)}
              className={`rounded-lg border px-3 py-2 text-left ${
                selected ? "border-red-800 bg-red-50" : "border-zinc-300 bg-white"
              }`}
            >
              {SPELL_LABELS[spellId]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStep({
  nextLevel,
  hpGain,
  abilities,
  nextAbilities,
  chosenSpellIds,
}: {
  nextLevel: number;
  hpGain: number;
  abilities: Character["abilities"];
  nextAbilities: Character["abilities"];
  chosenSpellIds: SpellId[];
}) {
  const abilityKeys = Object.keys(ABILITY_LABELS) as AbilityKey[];
  const changedAbilities = abilityKeys.filter((key) => abilities[key] !== nextAbilities[key]);

  return (
    <div className="flex flex-col gap-3 text-sm text-zinc-700">
      <p className="font-medium text-zinc-900">Resumo do nível {nextLevel}</p>
      <p>+{hpGain} HP máximo e atual.</p>
      {changedAbilities.length > 0 ? (
        <p>
          Atributos:{" "}
          {changedAbilities
            .map((key) => `${ABILITY_LABELS[key]} ${abilities[key]} → ${nextAbilities[key]}`)
            .join(", ")}
        </p>
      ) : null}
      {chosenSpellIds.length > 0 ? (
        <p>Novas magias: {chosenSpellIds.map((id) => SPELL_LABELS[id]).join(", ")}</p>
      ) : null}
    </div>
  );
}
