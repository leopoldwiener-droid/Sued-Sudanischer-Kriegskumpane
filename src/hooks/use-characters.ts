"use client";

import { useCallback, useEffect, useState } from "react";
import { parseCharacterCardFile } from "@/lib/character-card";
import {
  deleteCharacter,
  listCharacters,
  putCharacter,
} from "@/lib/character-store";
import type { CharacterCard } from "@/lib/types";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCharacters(activeCharacterId: string | null) {
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void listCharacters().then((list) => {
      if (cancelled) return;
      setCharacters(list);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCharacter =
    activeCharacterId && hydrated
      ? (characters.find((c) => c.id === activeCharacterId) ?? null)
      : null;

  const importFile = useCallback(async (file: File): Promise<CharacterCard | null> => {
    setImportError(null);
    setImporting(true);
    try {
      const parsed = await parseCharacterCardFile(file);
      if (!parsed.card.data.name.trim()) {
        throw new Error("Character card is missing a name.");
      }
      const card: CharacterCard = {
        id: makeId(),
        importedAt: Date.now(),
        avatarDataUrl: parsed.avatarDataUrl,
        spec: parsed.card.spec,
        specVersion: parsed.card.specVersion,
        data: parsed.card.data,
      };
      await putCharacter(card);
      setCharacters((prev) => [card, ...prev.filter((c) => c.id !== card.id)]);
      return card;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to import character card.";
      setImportError(message);
      return null;
    } finally {
      setImporting(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteCharacter(id);
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    characters,
    activeCharacter,
    hydrated,
    importing,
    importError,
    clearImportError: () => setImportError(null),
    importFile,
    remove,
  };
}
