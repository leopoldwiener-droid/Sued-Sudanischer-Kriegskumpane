"use client";

import { useRef } from "react";
import { Trash2, Users } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { characterDisplayName } from "@/lib/character-card";
import type { CharacterCard } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./settings-ui";

type Props = {
  characters: CharacterCard[];
  activeCharacterId: string | null;
  importing: boolean;
  importError: string | null;
  onImportFile: (file: File) => Promise<CharacterCard | null>;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onImported?: (card: CharacterCard) => void;
};

export function CharacterSettings({
  characters,
  activeCharacterId,
  importing,
  importError,
  onImportFile,
  onSelect,
  onRemove,
  onImported,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const active = characters.find((c) => c.id === activeCharacterId) ?? null;

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    const card = await onImportFile(file);
    if (card) onImported?.(card);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <SettingsSection
      icon={Users}
      title="Character"
      description="Import a SillyTavern-style character card (.png or .json). Chats will roleplay as the selected character."
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".png,.json,image/png,application/json"
          className="sr-only"
          onChange={(e) => void pickFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={importing}
          onClick={() => inputRef.current?.click()}
        >
          {importing ? "Importing…" : "Import card"}
        </Button>
        {activeCharacterId && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
            Clear selection
          </Button>
        )}
      </div>

      {importError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {importError}
        </p>
      )}

      {characters.length === 0 ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          No characters imported yet. PNG cards from SillyTavern / common card sites work —
          the avatar image carries the character definition in metadata.
        </p>
      ) : (
        <ul className="space-y-2">
          {characters.map((card) => {
            const selected = card.id === activeCharacterId;
            const name = characterDisplayName(card.data);
            return (
              <li key={card.id}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                    selected
                      ? "border-ring bg-muted"
                      : "border-border bg-background hover:bg-muted/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(selected ? null : card.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <AvatarThumb src={card.avatarDataUrl} name={name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {selected ? "Active — chats roleplay as this character" : "Click to use"}
                        {card.data.creator.trim()
                          ? ` · ${card.data.creator.trim()}`
                          : ""}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() => {
                      if (selected) onSelect(null);
                      onRemove(card.id);
                    }}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {active?.data.creator_notes.trim() && (
        <div className="rounded-xl border border-border bg-muted px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Creator notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
            {active.data.creator_notes.trim()}
          </p>
        </div>
      )}
    </SettingsSection>
  );
}

function AvatarThumb({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="size-10 shrink-0 rounded-lg object-cover"
      />
    );
  }
  return (
    <div
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-xs font-medium text-muted-foreground"
    >
      {name.slice(0, 1).toUpperCase() || "?"}
    </div>
  );
}
