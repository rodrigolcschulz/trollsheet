"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { StepProgress } from "@/components/creation-flow/StepProgress";
import { CREATION_STEPS } from "@/lib/constants/creation-steps";
import {
  ABILITY_LABELS,
  BACKGROUND_LABELS,
  BACKGROUND_OPTIONS,
  BACKGROUND_RULES,
  BACKGROUND_SUMMARIES,
  CLASS_SPELLCASTING,
  CLASS_STARTER_EQUIPMENT,
  CLASS_LABELS,
  CLASS_OPTIONS,
  CLASS_RULES,
  EQUIPMENT_DAMAGE,
  EQUIPMENT_LABELS,
  RACE_OPTIONS,
  RACE_LABELS,
  RACE_RULES,
  SPELL_DESCRIPTIONS,
  SPELL_DAMAGE,
  SPELL_HEALING,
  SPELL_LABELS,
  SPELL_LEVELS,
  SKILL_ABILITY_MAP,
  SKILL_DESCRIPTIONS,
  SKILL_LABELS,
  applyRacialAbilityBonuses,
  getFinalSkillProficiencies,
  type BackgroundId,
  type ClassId,
  type RaceId,
  type SpellId,
} from "@/lib/rules/creation-data";
import {
  clearDraft,
  saveDraft,
  saveCharacter,
} from "@/lib/storage/characters";
import type {
  AbilityKey,
  Character,
  CharacterDraft,
} from "@/lib/types/character";
import { calculateProficiencyBonus } from "@/lib/rules/calculate";
import {
  getAbilityModifier,
  getRemainingPoints,
  canIncreaseAbility,
  canDecreaseAbility,
} from "@/lib/rules/abilities";

type CreationShellProps = {
  initialDraft: CharacterDraft;
};

export function CreationShell({ initialDraft }: CreationShellProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CharacterDraft>(initialDraft);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const step = CREATION_STEPS[draft.step];
  const isFirstStep = draft.step === 0;
  const isLastStep = draft.step === CREATION_STEPS.length - 1;

  const selectedClassRules =
    draft.classId && draft.classId in CLASS_RULES
      ? CLASS_RULES[draft.classId as ClassId]
      : null;

  const validClassSkills = selectedClassRules
    ? draft.skillProficiencies.filter((skill) =>
        selectedClassRules.skillPool.includes(skill),
      )
    : [];

  const selectedSpellcasting =
    draft.classId && draft.classId in CLASS_SPELLCASTING
      ? CLASS_SPELLCASTING[draft.classId as ClassId] ?? null
      : null;

  const validKnownSpells = selectedSpellcasting
    ? draft.knownSpellIds.filter((spellId) =>
        selectedSpellcasting.spellOptions.includes(spellId as SpellId),
      )
    : [];
  
  const canProceed = (() => {
    switch (step.id) {
      case "race":
        return draft.raceId !== null;
  
      case "class":
        return draft.classId !== null;
  
      case "abilities":
        return getRemainingPoints(draft.abilities) === 0;

      case "skills":
        return (
          selectedClassRules !== null &&
          validClassSkills.length === selectedClassRules.skillChoices
        );

      case "background":
        return draft.backgroundId !== null;

      case "equipment":
        return draft.equipmentIds.length > 0;

      case "magic":
        if (selectedSpellcasting === null || selectedSpellcasting.maxKnownSpells === 0) {
          return true;
        }
        return validKnownSpells.length > 0;

      case "review":
        return draft.name.trim().length > 0;
  
      default:
        return true;
    }
  })();

  function goBack() {
    if (isFirstStep) return;
    setDraft((current) => ({ ...current, step: current.step - 1 }));
  }

  function goNext() {
    if (!canProceed) {
      return;
    }

    if (isLastStep) {
      const classRules =
        draft.classId && draft.classId in CLASS_RULES
          ? CLASS_RULES[draft.classId as ClassId]
          : null;
      const finalAbilities = applyRacialAbilityBonuses(draft.abilities, draft.raceId);
      const conMod = getAbilityModifier(finalAbilities.con);
      const dexMod = getAbilityModifier(finalAbilities.dex);
      const finalSkills = getFinalSkillProficiencies(
        validClassSkills,
        draft.backgroundId,
      );

      const character: Character = {
        ...draft,
        name: draft.name.trim(),
        abilities: finalAbilities,
        skillProficiencies: finalSkills,
        createdAt: new Date().toISOString(),
        level: 1,
        proficiencyBonus: calculateProficiencyBonus(1),
        maxHp: Math.max(1, (classRules?.hitDie ?? 8) + conMod),
        currentHp: Math.max(1, (classRules?.hitDie ?? 8) + conMod),
        ac: 10 + dexMod,
        speed:
          draft.raceId && draft.raceId in RACE_RULES
            ? RACE_RULES[draft.raceId as RaceId].speed
            : 30,
      };

      saveCharacter(character);
      clearDraft();
      router.push("/");
      return;
    }

    setDraft((current) => ({ ...current, step: current.step + 1 }));
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
          ← Início
        </Link>
        <span className="truncate text-sm text-zinc-600">
          {draft.raceId ? RACE_LABELS[draft.raceId as RaceId] : "Raça"} · {draft.classId ? CLASS_LABELS[draft.classId as ClassId] : "Classe"}
        </span>
      </div>

      <StepProgress currentStep={draft.step} />

      <section className="mt-8 flex flex-1 flex-col">
        <h1 className="text-2xl font-semibold text-zinc-900">{step.title}</h1>
        <p className="mt-2 text-zinc-600">{step.description}</p>

        <div className="mt-8 flex flex-1 flex-col gap-3">
          <PlaceholderStep stepId={step.id} draft={draft} setDraft={setDraft} />
        </div>
      </section>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={isFirstStep}
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed}
          className="flex-1 rounded-xl bg-red-800 px-4 py-3 text-sm font-medium text-white hover:bg-red-900"
        >
          {isLastStep ? "Concluir" : "Próximo"}
        </button>
      </div>
    </div>
  );
}

type PlaceholderStepProps = {
  stepId: string;
  draft: CharacterDraft;
  setDraft: React.Dispatch<React.SetStateAction<CharacterDraft>>;
};

function optionButtonClass(selected: boolean): string {
  return [
    "rounded-xl border px-4 py-4 text-left capitalize transition-colors",
    selected
      ? "border-red-900 bg-red-800 font-medium text-white shadow-sm"
      : "border-zinc-300 bg-white text-zinc-900 hover:border-red-400 hover:bg-red-50",
  ].join(" ");
}

function PlaceholderStep({ stepId, draft, setDraft }: PlaceholderStepProps) {
  if (stepId === "race") {
    return (
      <>
        {RACE_OPTIONS.map((raceId) => (
          <button
            key={raceId}
            type="button"
            onClick={() => setDraft((current) => ({ ...current, raceId }))}
            className={optionButtonClass(draft.raceId === raceId)}
          >
            {RACE_LABELS[raceId]}
          </button>
        ))}
      </>
    );
  }

  if (stepId === "class") {
    return (
      <>
        {CLASS_OPTIONS.map((classId) => (
          <button
            key={classId}
            type="button"
            onClick={() =>
              setDraft((current) => {
                const rules = CLASS_RULES[classId];
                const spellcasting = CLASS_SPELLCASTING[classId] ?? null;
                const filteredSkills = current.skillProficiencies.filter((skill) =>
                  rules.skillPool.includes(skill),
                );
                const filteredSpells = spellcasting
                  ? current.knownSpellIds.filter((spellId) =>
                      spellcasting.spellOptions.includes(spellId as SpellId),
                    )
                  : [];

                return {
                  ...current,
                  classId,
                  skillProficiencies: filteredSkills.slice(0, rules.skillChoices),
                  equipmentIds: [...CLASS_STARTER_EQUIPMENT[classId]],
                  knownSpellIds: spellcasting
                    ? filteredSpells.slice(0, spellcasting.maxKnownSpells)
                    : [],
                  spellSlotsLevel1: spellcasting?.slotLevel1 ?? 0,
                  spellSlotsLevel2: spellcasting?.slotLevel2 ?? 0,
                };
              })
            }
            className={optionButtonClass(draft.classId === classId)}
          >
            {CLASS_LABELS[classId]}
          </button>
        ))}
      </>
    );
  }

  if (stepId === "abilities") {
    const abilities = draft.abilities;

    return (
      <>
        <div className="mb-4 rounded-xl bg-zinc-100 p-4">
          <div className="text-sm text-zinc-600">Pontos restantes</div>
          <div className="text-2xl font-bold">
            {getRemainingPoints(abilities)}
          </div>
        </div>

        {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map((key) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-zinc-300 bg-white p-4"
          >
            <div>
              <div className="font-medium">{ABILITY_LABELS[key]}</div>
              <div className="text-sm text-zinc-500">
                Modificador {getAbilityModifier(abilities[key]) >= 0 ? "+" : ""}
                {getAbilityModifier(abilities[key])}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!canDecreaseAbility(abilities, key)}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    abilities: {
                      ...current.abilities,
                      [key]: current.abilities[key] - 1,
                    },
                  }))
                }
                className="h-9 w-9 rounded-lg border"
              >
                -
              </button>

              <span className="w-8 text-center font-semibold">
                {abilities[key]}
              </span>

              <button
                type="button"
                disabled={!canIncreaseAbility(abilities, key)}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    abilities: {
                      ...current.abilities,
                      [key]: current.abilities[key] + 1,
                    },
                  }))
                }
                className="h-9 w-9 rounded-lg border"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (stepId === "skills") {
    if (!draft.classId || !(draft.classId in CLASS_RULES)) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          Escolha uma classe antes de selecionar perícias.
        </div>
      );
    }

    const classRules = CLASS_RULES[draft.classId as keyof typeof CLASS_RULES];
    const selectedSkills = draft.skillProficiencies.filter((skill) =>
      classRules.skillPool.includes(skill),
    );
    const canAddMore = selectedSkills.length < classRules.skillChoices;

    return (
      <>
        <div className="mb-4 rounded-xl bg-zinc-100 p-4">
          <div className="text-sm text-zinc-600">Pericias selecionadas</div>
          <div className="text-2xl font-bold">
            {selectedSkills.length}/{classRules.skillChoices}
          </div>
        </div>

        {classRules.skillPool.map((skill) => {
          const selected = selectedSkills.includes(skill);

          return (
            <button
              key={skill}
              type="button"
              onClick={() =>
                setDraft((current) => {
                  const alreadySelected = current.skillProficiencies.includes(skill);

                  if (alreadySelected) {
                    return {
                      ...current,
                      skillProficiencies: current.skillProficiencies.filter(
                        (item) => item !== skill,
                      ),
                    };
                  }

                  const currentSelectedCount = current.skillProficiencies.filter((item) =>
                    classRules.skillPool.includes(item),
                  ).length;

                  if (currentSelectedCount >= classRules.skillChoices) {
                    return current;
                  }

                  return {
                    ...current,
                    skillProficiencies: [...current.skillProficiencies, skill],
                  };
                })
              }
              disabled={!selected && !canAddMore}
              className={optionButtonClass(selected)}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{SKILL_LABELS[skill]}</span>
                <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs uppercase tracking-wide text-zinc-500">
                  {ABILITY_LABELS[SKILL_ABILITY_MAP[skill]]}
                </span>
              </div>
              <p
                className={`mt-1 text-sm normal-case ${selected ? "text-red-100" : "text-zinc-600"}`}
              >
                {SKILL_DESCRIPTIONS[skill]}
              </p>
            </button>
          );
        })}
      </>
    );
  }

  if (stepId === "background") {
    return (
      <>
        {BACKGROUND_OPTIONS.map((backgroundId) => (
          <button
            key={backgroundId}
            type="button"
            onClick={() => setDraft((current) => ({ ...current, backgroundId }))}
            className={optionButtonClass(draft.backgroundId === backgroundId)}
          >
            <div className="flex flex-col gap-1 normal-case">
              <span className="capitalize">{BACKGROUND_LABELS[backgroundId]}</span>
              <p className="text-sm text-inherit/80">
                {BACKGROUND_SUMMARIES[backgroundId]}
              </p>
              <p className="text-xs uppercase tracking-wide text-inherit/70">
                Perícias: {BACKGROUND_RULES[backgroundId].grantedSkills
                  .map((skill) => SKILL_LABELS[skill].split(" (")[0])
                  .join(" · ")}
              </p>
            </div>
          </button>
        ))}
      </>
    );
  }

  if (stepId === "equipment") {
    if (!draft.classId || !(draft.classId in CLASS_STARTER_EQUIPMENT)) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          Escolha uma classe antes de selecionar equipamento.
        </div>
      );
    }

    const classEquipment = CLASS_STARTER_EQUIPMENT[draft.classId as ClassId];

    return (
      <>
        <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-700">
          Kit inicial sugerido para {CLASS_LABELS[draft.classId as ClassId]}.
        </div>

        {classEquipment.map((equipmentId) => {
          const selected = draft.equipmentIds.includes(equipmentId);

          return (
            <button
              key={equipmentId}
              type="button"
              onClick={() =>
                setDraft((current) => {
                  const alreadySelected = current.equipmentIds.includes(equipmentId);

                  if (alreadySelected) {
                    return {
                      ...current,
                      equipmentIds: current.equipmentIds.filter((item) => item !== equipmentId),
                    };
                  }

                  return {
                    ...current,
                    equipmentIds: [...current.equipmentIds, equipmentId],
                  };
                })
              }
              className={optionButtonClass(selected)}
            >
              <div className="flex flex-col gap-1 normal-case">
                <span>{EQUIPMENT_LABELS[equipmentId] ?? equipmentId}</span>
                {EQUIPMENT_DAMAGE[equipmentId] ? (
                  <p
                    className={`text-sm ${selected ? "text-white/90" : "text-zinc-600"}`}
                  >
                    Dano: {EQUIPMENT_DAMAGE[equipmentId]}
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() =>
            setDraft((current) => ({
              ...current,
              equipmentIds: [...classEquipment],
            }))
          }
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          Restaurar kit padrão
        </button>
      </>
    );
  }

  if (stepId === "magic") {
    if (!draft.classId) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          Escolha uma classe antes de selecionar magias.
        </div>
      );
    }

    const spellcasting = CLASS_SPELLCASTING[draft.classId as ClassId] ?? null;

    if (!spellcasting || spellcasting.maxKnownSpells === 0) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          Esta classe nao possui magia no nivel 1 nesta versao simplificada.
        </div>
      );
    }

    const selectedSpells = draft.knownSpellIds.filter((spellId) =>
      spellcasting.spellOptions.includes(spellId as SpellId),
    );
    const canAddMoreSpells = selectedSpells.length < spellcasting.maxKnownSpells;

    return (
      <>
        <div className="rounded-xl bg-zinc-100 p-4 text-sm text-zinc-700">
          <p>Slots de magia: nivel 1 = {draft.spellSlotsLevel1} · nivel 2 = {draft.spellSlotsLevel2}</p>
          <p className="mt-1">Magias conhecidas: {selectedSpells.length}/{spellcasting.maxKnownSpells}</p>
        </div>

        {spellcasting.spellOptions.map((spellId) => {
          const selected = selectedSpells.includes(spellId);

          return (
            <button
              key={spellId}
              type="button"
              onClick={() =>
                setDraft((current) => {
                  const alreadySelected = current.knownSpellIds.includes(spellId);

                  if (alreadySelected) {
                    return {
                      ...current,
                      knownSpellIds: current.knownSpellIds.filter((item) => item !== spellId),
                    };
                  }

                  const currentSelectedCount = current.knownSpellIds.filter((item) =>
                    spellcasting.spellOptions.includes(item as SpellId),
                  ).length;

                  if (currentSelectedCount >= spellcasting.maxKnownSpells) {
                    return current;
                  }

                  return {
                    ...current,
                    knownSpellIds: [...current.knownSpellIds, spellId],
                  };
                })
              }
              disabled={!selected && !canAddMoreSpells}
              className={optionButtonClass(selected)}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{SPELL_LABELS[spellId]}</span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-xs uppercase tracking-wide ${selected ? "border-red-200 text-red-50" : "border-zinc-300 text-zinc-500"}`}
                >
                  Nv {SPELL_LEVELS[spellId]}
                </span>
              </div>
              <p
                className={`mt-1 text-sm normal-case ${selected ? "text-red-50" : "text-zinc-600"}`}
              >
                {SPELL_DESCRIPTIONS[spellId]}
              </p>
              {SPELL_DAMAGE[spellId] ? (
                <p
                  className={`mt-1 text-xs uppercase tracking-wide ${selected ? "text-white/90" : "text-zinc-500"}`}
                >
                  Dano: {SPELL_DAMAGE[spellId]}
                </p>
              ) : null}
              {SPELL_HEALING[spellId] ? (
                <p
                  className={`mt-1 text-xs uppercase tracking-wide ${selected ? "text-white/90" : "text-green-600"}`}
                >
                  Cura: {SPELL_HEALING[spellId]}
                </p>
              ) : null}
            </button>
          );
        })}
      </>
    );
  }

  if (stepId === "review") {
    if (!draft.classId || !(draft.classId in CLASS_RULES)) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
          Escolha uma classe antes de revisar o personagem.
        </div>
      );
    }

    const reviewClassSkills =
      draft.skillProficiencies.filter((skill) =>
        CLASS_RULES[draft.classId as ClassId].skillPool.includes(skill),
      );
    const finalAbilities = applyRacialAbilityBonuses(draft.abilities, draft.raceId);
    const finalSkills = getFinalSkillProficiencies(
      reviewClassSkills,
      draft.backgroundId,
    );

    return (
      <>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">Nome do personagem</span>
          <input
            type="text"
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Ex.: Alaric"
            className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none ring-red-300 focus:ring-2"
          />
        </label>

        <div className="rounded-xl border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
          <p>
            <strong>Raca:</strong>{" "}
            {draft.raceId ? RACE_LABELS[draft.raceId as RaceId] : "-"}
          </p>
          <p>
            <strong>Classe:</strong>{" "}
            {draft.classId ? CLASS_LABELS[draft.classId as ClassId] : "-"}
          </p>
          <p>
            <strong>Background:</strong>{" "}
            {draft.backgroundId
              ? BACKGROUND_LABELS[draft.backgroundId as BackgroundId]
              : "-"}
          </p>
          <p>
            <strong>Pericias:</strong>{" "}
            {finalSkills.length > 0
              ? finalSkills.map((skill) => SKILL_LABELS[skill]).join(", ")
              : "-"}
          </p>
          <p>
            <strong>Equipamento:</strong>{" "}
            {draft.equipmentIds.length > 0
              ? draft.equipmentIds
                  .map((equipmentId) => EQUIPMENT_LABELS[equipmentId] ?? equipmentId)
                  .join(", ")
              : "-"}
          </p>
          <p>
            <strong>Slots:</strong>{" "}
            nv1 {draft.spellSlotsLevel1} · nv2 {draft.spellSlotsLevel2}
          </p>
          <p>
            <strong>Magias:</strong>{" "}
            {draft.knownSpellIds.length > 0
              ? draft.knownSpellIds.map((spellId) => SPELL_LABELS[spellId as SpellId]).join(", ")
              : "-"}
          </p>
          <p>
            <strong>Atributos finais:</strong>{" "}
            {(Object.keys(ABILITY_LABELS) as AbilityKey[])
              .map(
                (ability) =>
                  `${ABILITY_LABELS[ability]} ${finalAbilities[ability]}`,
              )
              .join(" · ")}
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-600">
      Conteúdo do passo &quot;{stepId}&quot; será implementado com os dados SRD.
    </div>
  );
}
