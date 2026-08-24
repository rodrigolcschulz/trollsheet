"use client";

import { useEffect, useState } from "react";

import { CreationShell } from "@/components/creation-flow/CreationShell";
import { clearDraft, loadDraft, startNewDraft } from "@/lib/storage/characters";
import type { CharacterDraft } from "@/lib/types/character";

export default function CreatePage() {
  const [draft, setDraft] = useState<CharacterDraft | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const existing = loadDraft();
        setDraft(existing ?? startNewDraft());
      } catch {
        setLoadError(true);
      }
    });
  }, []);

  if (loadError) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-zinc-500">
        <p>Não foi possível carregar o rascunho salvo.</p>
        <button
          type="button"
          onClick={() => {
            clearDraft();
            setLoadError(false);
            setDraft(startNewDraft());
          }}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 hover:bg-zinc-50"
        >
          Começar do zero
        </button>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-zinc-500">
        Carregando rascunho...
      </div>
    );
  }

  return <CreationShell initialDraft={draft} />;
}
