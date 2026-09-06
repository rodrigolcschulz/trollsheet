import { jsPDF } from "jspdf";

import subclasses from "../../../data/srd/subclasses.json";
import warlockRules from "../../../data/srd/warlock.json";
import {
  ABILITY_LABELS,
  BACKGROUND_LABELS,
  CLASS_LABELS,
  EQUIPMENT_LABELS,
  RACE_LABELS,
  SKILL_LABELS,
  SPELL_LABELS,
  type BackgroundId,
  type ClassId,
  type RaceId,
  type SpellId,
} from "@/lib/rules/creation-data";
import { calculateModifier, formatModifier } from "@/lib/rules/calculate";
import { getWarlockFeatureNames } from "@/lib/rules/leveling";
import type { AbilityKey, Character } from "@/lib/types/character";

function getFileName(character: Character): string {
  const name = character.name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `trollsheet-${name || "personagem"}.pdf`;
}

export function downloadCharacterPdf(character: Character): void {
  const document = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 18;

  const addText = (
    text: string,
    size = 10,
    color: [number, number, number] = [39, 39, 42],
    width = contentWidth,
  ) => {
    document.setFontSize(size);
    document.setTextColor(...color);
    const lines = document.splitTextToSize(text, width) as string[];
    const height = lines.length * (size * 0.45 + 1.2);
    if (cursorY + height > pageHeight - margin) {
      document.addPage();
      cursorY = margin;
    }
    document.text(lines, margin, cursorY);
    cursorY += height + 3;
  };

  const addHeading = (title: string) => {
    if (cursorY + 12 > pageHeight - margin) {
      document.addPage();
      cursorY = margin;
    }
    document.setDrawColor(161, 29, 29);
    document.setLineWidth(0.6);
    document.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;
    document.setFont("helvetica", "bold");
    addText(title.toUpperCase(), 12, [127, 29, 29]);
    document.setFont("helvetica", "normal");
  };

  if (character.avatarDataUrl) {
    const imageFormat = character.avatarDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
    document.addImage(character.avatarDataUrl, imageFormat, pageWidth - margin - 30, 14, 30, 30);
  }

  document.setFont("helvetica", "bold");
  addText(character.name || "Personagem sem nome", 22, [24, 24, 27], character.avatarDataUrl ? contentWidth - 38 : contentWidth);
  document.setFont("helvetica", "normal");
  addText(
    `${character.raceId ? RACE_LABELS[character.raceId as RaceId] : "Raca desconhecida"} | ${character.classId ? CLASS_LABELS[character.classId as ClassId] : "Classe desconhecida"} | Nivel ${character.level}`,
    11,
    [82, 82, 91],
    character.avatarDataUrl ? contentWidth - 38 : contentWidth,
  );
  if (character.avatarDataUrl) cursorY = Math.max(cursorY, 49);

  addHeading("Atributos");
  const abilities = (Object.keys(ABILITY_LABELS) as AbilityKey[])
    .map((ability) => `${ABILITY_LABELS[ability]} ${character.abilities[ability]} (${formatModifier(calculateModifier(character.abilities[ability]))})`)
    .join("   ");
  addText(abilities);
  addText(`Bonus de proficiencia: +${character.proficiencyBonus} | CA: ${character.ac} | Deslocamento: ${character.speed} pes | PV: ${character.currentHp}/${character.maxHp}`);

  addHeading("Identidade e pericias");
  addText(`Background: ${character.backgroundId ? BACKGROUND_LABELS[character.backgroundId as BackgroundId] : "Nao definido"}`);
  addText(`Pericias: ${character.skillProficiencies.length > 0 ? character.skillProficiencies.map((skill) => SKILL_LABELS[skill]).join(", ") : "Nenhuma"}`);

  addHeading("Equipamento");
  addText(character.equipmentIds.length > 0
    ? character.equipmentIds.map((equipmentId) => EQUIPMENT_LABELS[equipmentId] ?? equipmentId).join(", ")
    : "Nenhum equipamento registrado.");

  addHeading("Magias");
  if (character.pactMagic) {
    addText(`Magia do Pacto: ${character.pactMagic.currentSlots}/${character.pactMagic.maxSlots} espacos de ${character.pactMagic.slotLevel}o nivel.`);
  } else {
    addText(`Espacos: nivel 1 ${character.currentSpellSlotsLevel1}/${character.spellSlotsLevel1}; nivel 2 ${character.currentSpellSlotsLevel2}/${character.spellSlotsLevel2}.`);
  }
  addText(character.knownSpellIds.length > 0
    ? `Magias conhecidas: ${character.knownSpellIds.map((spellId) => SPELL_LABELS[spellId as SpellId] ?? spellId).join(", ")}`
    : "Nenhuma magia registrada.");

  if (character.classId === "warlock") {
    addHeading("Recursos de Bruxo");
    const subclass = subclasses.find((entry) => entry.id === character.subclassId);
    const pactBoon = warlockRules.pactBoons.find((entry) => entry.id === character.pactBoon);
    const invocations = character.invocations?.map((invocationId) =>
      warlockRules.invocations.find((entry) => entry.id === invocationId)?.name ?? invocationId,
    ) ?? [];

    addText(`Patrono: ${subclass?.name ?? "Nao definido"}`);
    addText(`Dadiva do Pacto: ${pactBoon?.name ?? "Nao definida"}`);
    addText(`Habilidades: ${getWarlockFeatureNames(character.subclassId, character.level).join(", ") || "Nenhuma"}`);
    addText(`Invocacoes: ${invocations.join(", ") || "Nenhuma"}`);
  }

  if (character.bio?.trim()) {
    addHeading("Historia");
    addText(character.bio.trim());
  }

  document.setFontSize(8);
  document.setTextColor(113, 113, 122);
  document.text("Gerado por Trollsheet", margin, pageHeight - 10);
  document.save(getFileName(character));
}
