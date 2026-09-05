"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ABILITY_LABELS,
  BACKGROUND_LABELS,
  CLASS_LABELS,
  EQUIPMENT_DAMAGE,
  EQUIPMENT_LABELS,
  RACE_LABELS,
  SPELL_DAMAGE,
  SPELL_HEALING,
  SPELL_LABELS,
  SKILL_LABELS,
  SKILL_ABILITY_MAP,
  type BackgroundId,
  type ClassId,
  type RaceId,
  type SpellId,
} from "@/lib/rules/creation-data";
import { getCharacterById, saveCharacter, downloadCharacterFile } from "@/lib/storage/characters";
import { calculateArmorClass, calculateModifier, formatModifier } from "@/lib/rules/calculate";
import {
  rollCheck,
  validateCheckResult,
  type CheckAdvantage,
  type CheckResult,
  parseDiceFormula,
  rollFormula,
  getWeaponAbility,
  getSpellcastingAbility,
  type DiceRollResult,
} from "@/lib/rules/checks";
import { LEVEL_CAP } from "@/lib/rules/leveling";
import { LevelUpFlow } from "@/components/level-up/LevelUpFlow";
import type { AbilityKey, Character } from "@/lib/types/character";

type CharacterDetailPageProps = {
  characterId: string;
};

export function CharacterDetailPage({ characterId }: CharacterDetailPageProps) {
  const [character, setCharacter] = useState<Character | null>(() =>
    getCharacterById(characterId),
  );
  const [activeCheck, setActiveCheck] = useState<CheckTarget | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [advantage, setAdvantage] = useState<CheckAdvantage>("none");
  const [dc, setDc] = useState("");
  const [history, setHistory] = useState<CheckHistoryEntry[]>([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // States for weapon and spell rolling
  const [activeCombatRoll, setActiveCombatRoll] = useState<CombatRollTarget | null>(null);
  const [combatRollResult, setCombatRollResult] = useState<{
    attack?: CheckResult;
    damage?: DiceRollResult;
  } | null>(null);
  const [combatAdvantage, setCombatAdvantage] = useState<CheckAdvantage>("none");
  const [combatDc, setCombatDc] = useState("");

  // States for bio editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");

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

  function openCheck(target: CheckTarget) {
    setActiveCheck(target);
    setCheckResult(null);
    setAdvantage("none");
    setDc("");
  }

  function closeCheck() {
    setActiveCheck(null);
  }

  function completeLevelUp(updated: Character) {
    saveCharacter(updated);
    setCharacter(updated);
    setIsLevelingUp(false);
  }

  function startEditingBio() {
    setBioText(character?.bio ?? "");
    setIsEditingBio(true);
  }

  function handleSaveBio() {
    if (!character) return;
    const updated = { ...character, bio: bioText.trim() };
    saveCharacter(updated);
    setCharacter(updated);
    setIsEditingBio(false);
  }

  function adjustCurrentHp(delta: number) {
    if (!character) return;
    const nextHp = Math.min(character.maxHp, Math.max(0, character.currentHp + delta));
    const updated = { ...character, currentHp: nextHp };
    saveCharacter(updated);
    setCharacter(updated);
  }

  function adjustSpellSlot(level: 1 | 2, delta: number) {
    if (!character) return;
    const key = level === 1 ? "currentSpellSlotsLevel1" : "currentSpellSlotsLevel2";
    const max = level === 1 ? character.spellSlotsLevel1 : character.spellSlotsLevel2;
    const nextValue = Math.min(max, Math.max(0, character[key] + delta));
    const updated = { ...character, [key]: nextValue };
    saveCharacter(updated);
    setCharacter(updated);
  }

  function performCheck() {
    if (!activeCheck) return;
    const result = rollCheck({
      abilityModifier: activeCheck.abilityModifier,
      proficiencyBonus: activeCheck.proficiencyBonus,
      advantage,
    });
    const parsedValue = Number(dc);
    const parsedDc = dc.trim() === "" || !Number.isFinite(parsedValue)
      ? undefined
      : parsedValue;
    setCheckResult(result);

    const d20Text = result.rolls.length > 1
      ? `d20: ${result.rolls.join(" e ")} → ${result.chosenRoll}`
      : `d20: ${result.chosenRoll}`;
    const dcText = parsedDc !== undefined
      ? ` · DC ${parsedDc} · ${validateCheckResult(result.total, parsedDc) === "success" ? "Sucesso" : "Falha"}`
      : "";
    const detail = `${d20Text}${dcText}`;

    setHistory((current) => [
      { title: activeCheck.title, total: result.total, detail },
      ...current,
    ].slice(0, 5));
  }

  function openWeaponRoll(equipmentId: string) {
    if (!character) return;
    const formulaStr = EQUIPMENT_DAMAGE[equipmentId] || "1d4";
    const parsed = parseDiceFormula(formulaStr);
    if (!parsed) return;

    const weaponAbility = getWeaponAbility(equipmentId, character.abilities);
    const abilityModifier = calculateModifier(character.abilities[weaponAbility]);
    const name = EQUIPMENT_LABELS[equipmentId] ?? equipmentId;

    setActiveCombatRoll({
      name,
      formula: formulaStr,
      isSpell: false,
      abilityModifier,
      proficiencyBonus: character.proficiencyBonus,
      diceFormula: `${parsed.diceCount}d${parsed.diceSides}`,
      damageModifier: abilityModifier,
      damageType: parsed.type,
      isHealing: false,
      multiplier: parsed.multiplier,
    });
    setCombatRollResult(null);
    setCombatAdvantage("none");
    setCombatDc("");
  }

  function openSpellRoll(spellId: SpellId) {
    if (!character) return;
    const damageFormula = SPELL_DAMAGE[spellId];
    const healingFormula = SPELL_HEALING[spellId];
    const formulaStr = damageFormula || healingFormula || "1d20";
    const parsed = parseDiceFormula(formulaStr) || {
      multiplier: 1,
      diceCount: 0,
      diceSides: 0,
      modifier: 0,
      type: undefined,
    };

    const spellcastingAbility = getSpellcastingAbility(character.classId);
    const abilityModifier = calculateModifier(character.abilities[spellcastingAbility]);

    const isHealing = !!healingFormula;
    const damageModifier = isHealing ? abilityModifier : 0;
    const name = SPELL_LABELS[spellId] ?? spellId;

    setActiveCombatRoll({
      name,
      formula: formulaStr,
      isSpell: true,
      abilityModifier,
      proficiencyBonus: character.proficiencyBonus,
      diceFormula: parsed.diceCount > 0 ? `${parsed.diceCount}d${parsed.diceSides}` : "",
      damageModifier,
      damageType: isHealing ? "cura" : parsed.type,
      isHealing,
      multiplier: parsed.multiplier,
    });
    setCombatRollResult(null);
    setCombatAdvantage("none");
    setCombatDc("");
  }

  function closeCombatRoll() {
    setActiveCombatRoll(null);
  }

  function performCombatAttack() {
    if (!activeCombatRoll) return;
    const result = rollCheck({
      abilityModifier: activeCombatRoll.abilityModifier,
      proficiencyBonus: activeCombatRoll.proficiencyBonus,
      advantage: combatAdvantage,
    });
    const parsedValue = Number(combatDc);
    const parsedDc = combatDc.trim() === "" || !Number.isFinite(parsedValue)
      ? undefined
      : parsedValue;

    setCombatRollResult((curr) => ({
      ...curr,
      attack: result,
    }));

    const d20Text = result.rolls.length > 1
      ? `d20: ${result.rolls.join(" e ")} → ${result.chosenRoll}`
      : `d20: ${result.chosenRoll}`;
    const dcText = parsedDc !== undefined
      ? ` · CA ${parsedDc} · ${result.total >= parsedDc ? "Acertou" : "Errou"}`
      : "";
    const detail = `${d20Text}${dcText} (Mod: ${formatModifier(activeCombatRoll.abilityModifier)} + Prof: ${activeCombatRoll.proficiencyBonus})`;

    setHistory((current) => [
      { title: `Ataque: ${activeCombatRoll.name}`, total: result.total, detail },
      ...current,
    ].slice(0, 5));
  }

  function performCombatDamage() {
    if (!activeCombatRoll) return;
    const formulaStr = activeCombatRoll.formula;
    const parsed = parseDiceFormula(formulaStr);
    if (!parsed) return;

    const result = rollFormula(parsed, activeCombatRoll.damageModifier);
    setCombatRollResult((curr) => ({
      ...curr,
      damage: result,
    }));

    const typeSuffix = activeCombatRoll.damageType ? ` de ${activeCombatRoll.damageType}` : "";
    const titlePrefix = activeCombatRoll.isHealing ? "Cura" : "Dano";
    const detail = `${result.breakdown}${typeSuffix}`;

    setHistory((current) => [
      { title: `${titlePrefix}: ${activeCombatRoll.name}`, total: result.total, detail },
      ...current,
    ].slice(0, 5));
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
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={character.level >= LEVEL_CAP}
            onClick={() => setIsLevelingUp(true)}
            className="flex-1 rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {character.level >= LEVEL_CAP ? "Nível máximo" : "Subir de Nível"}
          </button>
          <button
            type="button"
            onClick={() => downloadCharacterFile(character)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Exportar
          </button>
        </div>
      </header>

      <Section title="Atributos">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {(Object.keys(ABILITY_LABELS) as AbilityKey[]).map((ability) => (
            <div
              key={ability}
              className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2"
            >
              <div>
                <span className="font-medium text-zinc-700">{ABILITY_LABELS[ability]}</span>{" "}
                <span className="text-zinc-900">{character.abilities[ability]}</span>
                <span className="ml-2 text-xs text-zinc-500">
                  ({formatModifier(calculateModifier(character.abilities[ability]))})
                </span>
              </div>
              <RollButton onClick={() => openCheck({
                title: `Teste de ${ABILITY_LABELS[ability]}`,
                abilityModifier: calculateModifier(character.abilities[ability]),
                proficiencyBonus: 0,
              })} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Perícias">
        {character.skillProficiencies.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhuma perícia registrada.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {character.skillProficiencies.map((skill) => (
              <li
                key={skill}
                className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                {SKILL_LABELS[skill]}
                <RollButton onClick={() => {
                  const ability = SKILL_ABILITY_MAP[skill];
                  openCheck({
                    title: `Teste de ${SKILL_LABELS[skill]}`,
                    abilityModifier: calculateModifier(character.abilities[ability]),
                    proficiencyBonus: character.proficiencyBonus,
                  });
                }} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {history.length > 0 ? (
        <Section title="Histórico de rolagens">
          <div className="flex flex-col gap-2 text-sm">
            {history.map((entry, index) => (
              <div key={`${entry.title}-${index}`} className="rounded-lg border border-zinc-300 bg-white px-3 py-2">
                <div className="flex justify-between gap-2 font-medium">
                  <span>{entry.title}</span>
                  <span>{entry.total}</span>
                </div>
                <div className="text-zinc-500">
                  {entry.detail}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Equipamento">
        {character.equipmentIds.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhum equipamento registrado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {character.equipmentIds.map((equipmentId) => (
              <li
                key={equipmentId}
                className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                <div className="flex flex-col gap-0.5">
                  <span>{EQUIPMENT_LABELS[equipmentId] ?? equipmentId}</span>
                  {EQUIPMENT_DAMAGE[equipmentId] ? (
                    <span className="text-xs text-zinc-500">
                      Dano: {EQUIPMENT_DAMAGE[equipmentId]}
                    </span>
                  ) : null}
                </div>
                {EQUIPMENT_DAMAGE[equipmentId] && (
                  <RollButton onClick={() => openWeaponRoll(equipmentId)} />
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {activeCheck ? (
        <CheckModal
          target={activeCheck}
          advantage={advantage}
          dc={dc}
          result={checkResult}
          onAdvantageChange={setAdvantage}
          onDcChange={setDc}
          onRoll={performCheck}
          onClose={closeCheck}
        />
      ) : null}

      {activeCombatRoll ? (
        <CombatRollModal
          target={activeCombatRoll}
          advantage={combatAdvantage}
          dc={combatDc}
          result={combatRollResult}
          onAdvantageChange={setCombatAdvantage}
          onDcChange={setCombatDc}
          onAttack={performCombatAttack}
          onDamage={performCombatDamage}
          onClose={closeCombatRoll}
        />
      ) : null}

      {isLevelingUp ? (
        <LevelUpFlow
          character={character}
          onClose={() => setIsLevelingUp(false)}
          onComplete={completeLevelUp}
        />
      ) : null}

      <Section title="Magia">
        {character.knownSpellIds.length === 0 ? (
          <p className="text-sm text-zinc-600">Sem magias registradas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {character.knownSpellIds.map((spellId) => (
              <li
                key={spellId}
                className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700"
              >
                <div className="flex flex-col gap-0.5">
                  <span>{SPELL_LABELS[spellId as SpellId] ?? spellId}</span>
                  {SPELL_DAMAGE[spellId as SpellId] ? (
                    <span className="text-xs text-zinc-500">
                      Dano: {SPELL_DAMAGE[spellId as SpellId]}
                    </span>
                  ) : SPELL_HEALING[spellId as SpellId] ? (
                    <span className="text-xs text-zinc-500">
                      Cura: {SPELL_HEALING[spellId as SpellId]}
                    </span>
                  ) : null}
                </div>
                <RollButton onClick={() => openSpellRoll(spellId as SpellId)} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-col gap-2">
          <SpellSlotControl
            label="Slots nv1"
            current={character.currentSpellSlotsLevel1}
            max={character.spellSlotsLevel1}
            onDecrease={() => adjustSpellSlot(1, -1)}
            onIncrease={() => adjustSpellSlot(1, 1)}
          />
          {character.spellSlotsLevel2 > 0 ? (
            <SpellSlotControl
              label="Slots nv2"
              current={character.currentSpellSlotsLevel2}
              max={character.spellSlotsLevel2}
              onDecrease={() => adjustSpellSlot(2, -1)}
              onIncrease={() => adjustSpellSlot(2, 1)}
            />
          ) : null}
        </div>
      </Section>

      <Section title="Combate">
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <Stat label="HP Máximo" value={character.maxHp} />
          <HpStat
            value={character.currentHp}
            onDecrease={() => adjustCurrentHp(-1)}
            onIncrease={() => adjustCurrentHp(1)}
          />
          <div className="rounded-lg border border-zinc-300 bg-white px-3 py-2">
            <p className="text-xs text-zinc-500">CA</p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-zinc-900">
                {calculateArmorClass(character.abilities, character.equipmentIds, character.classId).total}
              </span>
              {calculateArmorClass(character.abilities, character.equipmentIds, character.classId).detail && (
                <span className="text-xs text-zinc-500">
                  {calculateArmorClass(character.abilities, character.equipmentIds, character.classId).detail}
                </span>
              )}
            </div>
          </div>
          <Stat label="Deslocamento" value={character.speed} />
          <Stat label="Proficiência" value={character.proficiencyBonus} />
        </div>

        {character.equipmentIds.some((id) => EQUIPMENT_DAMAGE[id]) && (
          <div className="mb-3">
            <h3 className="mb-2 text-xs font-medium uppercase text-zinc-600">Armas</h3>
            <div className="flex flex-wrap gap-2">
              {character.equipmentIds.map((equipmentId) =>
                EQUIPMENT_DAMAGE[equipmentId] ? (
                  <button
                    key={equipmentId}
                    type="button"
                    onClick={() => openWeaponRoll(equipmentId)}
                    className="flex flex-col items-start rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-left hover:border-amber-400 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 font-medium text-amber-900">
                      <span>{EQUIPMENT_LABELS[equipmentId] ?? equipmentId}</span>
                      <span>🎲</span>
                    </div>
                    <div className="text-amber-700">{EQUIPMENT_DAMAGE[equipmentId]}</div>
                  </button>
                ) : null
              )}
            </div>
          </div>
        )}

        {character.knownSpellIds.some(
          (id) => SPELL_DAMAGE[id as SpellId] || SPELL_HEALING[id as SpellId]
        ) && (
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase text-zinc-600">Magia</h3>
            <div className="flex flex-wrap gap-2">
              {character.knownSpellIds.map((spellId) => {
                const damage = SPELL_DAMAGE[spellId as SpellId];
                const healing = SPELL_HEALING[spellId as SpellId];
                if (!damage && !healing) return null;
                return (
                  <button
                    key={spellId}
                    type="button"
                    onClick={() => openSpellRoll(spellId as SpellId)}
                    className="flex flex-col items-start rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs text-left hover:border-purple-400 hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 font-medium text-purple-900">
                      <span>{SPELL_LABELS[spellId as SpellId] ?? spellId}</span>
                      <span>🎲</span>
                    </div>
                    {damage && <div className="text-purple-700">Dano: {damage}</div>}
                    {healing && <div className="text-green-700">Cura: {healing}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Section title="História / Biografia">
        {isEditingBio ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Escreva a história, personalidade ou anotações do seu personagem..."
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none ring-red-300 focus:ring-2 min-h-[110px] resize-y"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingBio(false)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveBio}
                className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-900 cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={startEditingBio}
            className="group relative cursor-pointer rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-700 hover:border-zinc-400 transition-colors"
          >
            {character.bio && character.bio.trim().length > 0 ? (
              <p className="whitespace-pre-wrap text-zinc-800 leading-relaxed">{character.bio}</p>
            ) : (
              <p className="text-zinc-400 italic">
                Nenhuma história definida. Toque aqui para adicionar uma biografia ou anotações...
              </p>
            )}
            <div className="mt-2 flex justify-end">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-800 opacity-80 group-hover:opacity-100">
                ✏️ Editar bio
              </span>
            </div>
          </div>
        )}
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

function HpStat({
  value,
  onDecrease,
  onIncrease,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2">
      <div>
        <p className="text-xs text-zinc-500">HP Atual</p>
        <p className="font-semibold text-zinc-900">{value}</p>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label="Diminuir HP atual"
          onClick={onDecrease}
          className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 hover:border-red-700 hover:bg-red-50"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Aumentar HP atual"
          onClick={onIncrease}
          className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 hover:border-red-700 hover:bg-red-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SpellSlotControl({
  label,
  current,
  max,
  onDecrease,
  onIncrease,
}: {
  label: string;
  current: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="font-semibold text-zinc-900">
          {current} / {max}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label={`Usar ${label}`}
          onClick={onDecrease}
          className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 hover:border-red-700 hover:bg-red-50"
        >
          −
        </button>
        <button
          type="button"
          aria-label={`Recuperar ${label}`}
          onClick={onIncrease}
          className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 hover:border-red-700 hover:bg-red-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

type CheckTarget = {
  title: string;
  abilityModifier: number;
  proficiencyBonus: number;
};

type CombatRollTarget = {
  name: string;
  formula: string;
  isSpell: boolean;
  abilityModifier: number;
  proficiencyBonus: number;
  diceFormula: string;
  damageModifier: number;
  damageType?: string;
  isHealing: boolean;
  multiplier: number;
};

type CheckHistoryEntry = {
  title: string;
  total: number;
  detail: string;
};

function RollButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Rolar teste"
      title="Rolar teste"
      onClick={onClick}
      className="rounded-md border border-zinc-300 px-2 py-1 text-base hover:border-red-700 hover:bg-red-50"
    >
      🎲
    </button>
  );
}

function CheckModal({
  target,
  advantage,
  dc,
  result,
  onAdvantageChange,
  onDcChange,
  onRoll,
  onClose,
}: {
  target: CheckTarget;
  advantage: CheckAdvantage;
  dc: string;
  result: CheckResult | null;
  onAdvantageChange: (value: CheckAdvantage) => void;
  onDcChange: (value: string) => void;
  onRoll: () => void;
  onClose: () => void;
}) {
  const parsedDc = dc.trim() === "" ? undefined : Number(dc);
  const outcome = result ? validateCheckResult(result.total, parsedDc) : null;

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="check-title" className="w-full max-w-md rounded-xl border border-zinc-300 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="check-title" className="text-lg font-semibold text-zinc-900">{target.title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-xl text-zinc-500 hover:text-zinc-900">×</button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["none", "advantage", "disadvantage"] as CheckAdvantage[]).map((mode) => (
            <button key={mode} type="button" onClick={() => onAdvantageChange(mode)} className={`rounded-lg border px-2 py-2 text-xs ${advantage === mode ? "border-red-800 bg-red-800 text-white" : "border-zinc-300 bg-white text-zinc-700"}`}>
              {mode === "none" ? "Normal" : mode === "advantage" ? "Vantagem" : "Desvantagem"}
            </button>
          ))}
        </div>

        <label className="mt-4 flex flex-col gap-1 text-sm text-zinc-700">
          DC (opcional)
          <input type="number" min="1" value={dc} onChange={(event) => onDcChange(event.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-red-300" />
        </label>

        <button type="button" onClick={onRoll} className="mt-4 w-full rounded-lg bg-red-800 px-4 py-3 font-medium text-white hover:bg-red-900">Rolar</button>

        {result ? (
          <div className="mt-4 rounded-lg bg-zinc-100 p-3 text-sm text-zinc-800">
            <p>
              Rolado: {result.rolls.join(" e ")} {result.rolls.length > 1 ? `→ usa ${result.chosenRoll} (${advantage === "advantage" ? "vantagem" : "desvantagem"})` : ""}
            </p>
            <p className="mt-2 font-medium">
              {result.breakdown.map((part, index) => `${index > 0 ? " + " : ""}${part.label} (${formatModifier(part.value)})`).join("")} = {result.total}
            </p>
            {outcome ? <p className={`mt-2 font-bold uppercase ${outcome === "success" ? "text-green-700" : "text-red-700"}`}>{outcome === "success" ? "Sucesso" : "Falha"}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CombatRollModal({
  target,
  advantage,
  dc,
  result,
  onAdvantageChange,
  onDcChange,
  onAttack,
  onDamage,
  onClose,
}: {
  target: CombatRollTarget;
  advantage: CheckAdvantage;
  dc: string;
  result: { attack?: CheckResult; damage?: DiceRollResult } | null;
  onAdvantageChange: (value: CheckAdvantage) => void;
  onDcChange: (value: string) => void;
  onAttack: () => void;
  onDamage: () => void;
  onClose: () => void;
}) {
  const parsedDc = dc.trim() === "" ? undefined : Number(dc);
  const attackOutcome = result?.attack
    ? parsedDc !== undefined
      ? result.attack.total >= parsedDc
        ? "success"
        : "failure"
      : null
    : null;

  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="combat-roll-title"
        className="w-full max-w-md rounded-xl border border-zinc-300 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="combat-roll-title" className="text-lg font-semibold text-zinc-900">
              {target.name}
            </h2>
            <p className="text-xs text-zinc-500">
              Fórmula: {target.formula}
              {target.damageType ? ` (${target.damageType})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-xl text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <span className="text-xs font-semibold uppercase text-zinc-600">1. Teste de Ataque</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["none", "advantage", "disadvantage"] as CheckAdvantage[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onAdvantageChange(mode)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium cursor-pointer ${
                    advantage === mode
                      ? "border-red-800 bg-red-800 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {mode === "none" ? "Normal" : mode === "advantage" ? "Vantagem" : "Desvantagem"}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min="1"
                placeholder="CA do alvo (opcional)"
                value={dc}
                onChange={(e) => onDcChange(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs text-zinc-900 outline-none focus:ring-2 focus:ring-red-300"
              />
              <button
                type="button"
                onClick={onAttack}
                className="rounded-lg bg-red-800 px-4 py-2 text-xs font-medium text-white hover:bg-red-900 cursor-pointer"
              >
                Rolar Ataque
              </button>
            </div>
            {result?.attack ? (
              <div className="mt-2 rounded-lg bg-zinc-100 p-2.5 text-xs text-zinc-800">
                <p>
                  d20: {result.attack.rolls.join(" e ")}
                  {result.attack.rolls.length > 1 ? ` → usa ${result.attack.chosenRoll}` : ""}
                  {" + "}
                  {formatModifier(target.abilityModifier)} mod + {target.proficiencyBonus} prof ={" "}
                  <strong className="text-zinc-900 text-sm">{result.attack.total}</strong>
                </p>
                {attackOutcome ? (
                  <p
                    className={`mt-1 font-bold uppercase ${
                      attackOutcome === "success" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {attackOutcome === "success" ? "Acertou!" : "Errou!"}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="border-t border-zinc-200 pt-3">
            <span className="text-xs font-semibold uppercase text-zinc-600">
              2. {target.isHealing ? "Rolagem de Cura" : "Rolagem de Dano"}
            </span>
            <div className="mt-2">
              <button
                type="button"
                onClick={onDamage}
                className="w-full rounded-lg bg-amber-700 px-4 py-2.5 text-xs font-medium text-white hover:bg-amber-800 cursor-pointer"
              >
                {target.isHealing ? "Rolar Cura" : "Rolar Dano"} ({target.formula})
              </button>
            </div>
            {result?.damage ? (
              <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-950">
                <p className="font-medium">{result.damage.breakdown}</p>
                <p className="mt-1 text-sm font-bold">
                  Total: {result.damage.total}
                  {target.damageType ? ` (${target.damageType})` : ""}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

