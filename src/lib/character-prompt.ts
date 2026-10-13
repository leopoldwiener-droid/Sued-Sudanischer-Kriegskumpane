// ─────────────────────────────────────────────────────────────────────────────
// character-prompt — build roleplay system text + PHI from a character card.
//
// Macros {{char}}/{{user}} (and <CHAR>/<USER>) are substituted case-insensitively.
// Card system_prompt replaces the app default when non-empty; {{original}} embeds
// the Open Chat stable prompt (name, instructions, tool hints).
// ─────────────────────────────────────────────────────────────────────────────

import { characterDisplayName } from "@/lib/character-card";
import type { CharacterCardData } from "@/lib/types";

const MACRO_CHAR = /\{\{char\}\}|<char>/gi;
const MACRO_USER = /\{\{user\}\}|<user>/gi;
const MACRO_ORIGINAL = /\{\{original\}\}/gi;

export function substituteCharacterMacros(
  text: string,
  charName: string,
  userName: string,
): string {
  return text
    .replace(MACRO_CHAR, charName)
    .replace(MACRO_USER, userName);
}

function applyMacros(
  text: string,
  data: CharacterCardData,
  userName: string,
): string {
  const char = characterDisplayName(data);
  const user = userName.trim() || "User";
  return substituteCharacterMacros(text, char, user);
}

/** Permanent character definition block (description / personality / scenario / examples). */
export function buildCharacterStoryBlock(
  data: CharacterCardData,
  userName: string,
): string {
  const lines: string[] = [];
  const char = characterDisplayName(data);
  lines.push(`You are roleplaying as ${char}. Stay in character.`);

  const description = data.description.trim();
  if (description) {
    lines.push(`Character description:\n${applyMacros(description, data, userName)}`);
  }
  const personality = data.personality.trim();
  if (personality) {
    lines.push(`Personality:\n${applyMacros(personality, data, userName)}`);
  }
  const scenario = data.scenario.trim();
  if (scenario) {
    lines.push(`Scenario:\n${applyMacros(scenario, data, userName)}`);
  }
  const examples = data.mes_example.trim();
  if (examples) {
    const normalized = examples.replace(/<START>/gi, "\n---\n").trim();
    lines.push(
      `Example dialogue (for style; do not repeat verbatim):\n${applyMacros(normalized, data, userName)}`,
    );
  }
  return lines.join("\n\n");
}

/**
 * Merge Open Chat's base stable prompt with an active character card.
 * Returns undefined only when both are empty.
 */
export function buildCharacterSystemPrompt(
  baseStablePrompt: string | undefined,
  data: CharacterCardData,
  userName: string,
): string | undefined {
  const original = baseStablePrompt?.trim() ?? "";
  const story = buildCharacterStoryBlock(data, userName);
  const cardSystem = data.system_prompt.trim();

  let head: string;
  if (cardSystem) {
    const withOriginal = cardSystem.replace(MACRO_ORIGINAL, original);
    head = applyMacros(withOriginal, data, userName).trim();
    // If {{original}} was absent and we still have tool/name hints, append them
    // so memory/search keep working during roleplay.
    const hadOriginal = /\{\{original\}\}/i.test(cardSystem);
    if (!hadOriginal && original && !head.includes(original)) {
      head = head ? `${head}\n\n${original}` : original;
    }
  } else {
    head = original;
  }

  if (head && story) return `${head}\n\n${story}`;
  return head || story || undefined;
}

/** Post-history instructions (appended after chat messages). */
export function buildPostHistoryInstructions(
  data: CharacterCardData,
  userName: string,
): string | undefined {
  const raw = data.post_history_instructions.trim();
  if (!raw) return undefined;
  // No Open Chat jailbreak setting — {{original}} → empty.
  const withoutOriginal = raw.replace(MACRO_ORIGINAL, "");
  const text = applyMacros(withoutOriginal, data, userName).trim();
  return text || undefined;
}

/** Opening assistant greeting for a new chat. */
export function buildCharacterGreeting(
  data: CharacterCardData,
  userName: string,
): string | undefined {
  const raw = data.first_mes.trim();
  if (!raw) return undefined;
  return applyMacros(raw, data, userName);
}
