import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCharacterGreeting,
  buildCharacterSystemPrompt,
  buildPostHistoryInstructions,
  substituteCharacterMacros,
} from "@/lib/character-prompt";
import { buildStableSystemPrompt } from "@/lib/system-prompt";
import type { CharacterCardData, UserSettings } from "@/lib/types";

function data(patch: Partial<CharacterCardData> = {}): CharacterCardData {
  return {
    name: "Ava",
    description: "{{char}} lives in a tower.",
    personality: "witty",
    scenario: "Meeting {{user}}",
    first_mes: "Hello, {{user}}!",
    mes_example: "<START>\n{{user}}: hi\n{{char}}: hey",
    system_prompt: "",
    post_history_instructions: "",
    alternate_greetings: [],
    creator_notes: "",
    tags: [],
    creator: "",
    character_version: "",
    extensions: {},
    ...patch,
  };
}

function settings(patch: Partial<UserSettings> = {}): UserSettings {
  return {
    provider: "openrouter",
    openRouterApiKey: "",
    model: "openai/gpt-4o-mini",
    ollamaBaseUrl: "",
    ollamaModel: "",
    name: "Ada",
    customInstructions: "Be concise.",
    colorAccent: null,
    activeCharacterId: null,
    reasoning: {
      enabled: false,
      effort: "medium",
      showInResponse: true,
      collapseByDefault: false,
    },
    titleGeneration: { enabled: true, provider: "openrouter", model: "" },
    memory: { enabled: true },
    webSearch: { enabled: false },
    promptCaching: { enabled: true, ttl: "5m" },
    zdrOnly: false,
    tts: { voice: "eve" },
    ...patch,
  };
}

describe("substituteCharacterMacros", () => {
  it("replaces char and user macros case-insensitively", () => {
    const out = substituteCharacterMacros(
      "{{char}} meets {{USER}} and <Char> waves",
      "Ava",
      "Ada",
    );
    assert.equal(out, "Ava meets Ada and Ava waves");
  });
});

describe("buildCharacterSystemPrompt", () => {
  it("appends story block to the base prompt when card system_prompt is empty", () => {
    const out = buildCharacterSystemPrompt("Base hints", data(), "Ada");
    assert.ok(out?.includes("Base hints"));
    assert.ok(out?.includes("You are roleplaying as Ava"));
    assert.ok(out?.includes("Ava lives in a tower."));
    assert.ok(out?.includes("Meeting Ada"));
  });

  it("uses card system_prompt and expands {{original}}", () => {
    const out = buildCharacterSystemPrompt(
      "Original block",
      data({ system_prompt: "Play as {{char}}.\n{{original}}" }),
      "Ada",
    );
    assert.ok(out?.startsWith("Play as Ava."));
    assert.ok(out?.includes("Original block"));
  });

  it("appends original when {{original}} is absent so tools still work", () => {
    const out = buildCharacterSystemPrompt(
      "Tool hints",
      data({ system_prompt: "Only roleplay." }),
      "Ada",
    );
    assert.ok(out?.includes("Only roleplay."));
    assert.ok(out?.includes("Tool hints"));
  });
});

describe("buildPostHistoryInstructions / greeting", () => {
  it("builds PHI with macros", () => {
    const phi = buildPostHistoryInstructions(
      data({ post_history_instructions: "Reply as {{char}} to {{user}}." }),
      "Ada",
    );
    assert.equal(phi, "Reply as Ava to Ada.");
  });

  it("returns undefined for empty PHI", () => {
    assert.equal(buildPostHistoryInstructions(data(), "Ada"), undefined);
  });

  it("builds first_mes greeting", () => {
    assert.equal(buildCharacterGreeting(data(), "Ada"), "Hello, Ada!");
  });
});

describe("buildStableSystemPrompt with character", () => {
  it("merges character into the stable prompt", () => {
    const prompt = buildStableSystemPrompt(settings(), data());
    assert.ok(prompt?.includes("Ada"));
    assert.ok(prompt?.includes("save_memory"));
    assert.ok(prompt?.includes("roleplaying as Ava"));
  });
});
