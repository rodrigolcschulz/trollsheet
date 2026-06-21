"use client";

import { useEffect, useState } from "react";

import { CreationShell } from "@/components/creation-flow/CreationShell";
import { loadDraft, startNewDraft } from "@/lib/storage/characters";
import type { CharacterDraft } from "@/lib/types/character";

export default function CreatePage() {
  const [draft, setDraft] = useState<CharacterDraft | null>(null);

  useEffect(() => {
    try {
      const existing = loadDraft();
      setDraft(existing ?? startNewDraft());
    } catch {
      setDraft(startNewDraft());
    }
  }, []);

  if (!draft) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-zinc-500">
        Carregando rascunho...
      </div>
    );
  }

  return <CreationShell initialDraft={draft} />;
}
