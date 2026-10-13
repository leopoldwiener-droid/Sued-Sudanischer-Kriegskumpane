// ─────────────────────────────────────────────────────────────────────────────
// character-card — parse SillyTavern / TavernAI character cards (V1–V3).
//
// PNG cards embed Base64 JSON in tEXt/zTXt chunks (`ccv3` preferred, else
// `chara`). JSON files are accepted as V1 (flat) or V2/V3 (spec + data).
// No npm deps — walk PNG chunks ourselves. Lorebooks / CHARX are ignored.
//
// Import is capped: file size, inflated zTXt output, and decoded metadata so a
// crafted card cannot zip-bomb or exhaust IndexedDB / prompt context.
// ─────────────────────────────────────────────────────────────────────────────

import type { CharacterCardData } from "@/lib/types";

export type NormalizedCharacterCard = {
  spec: "chara_card_v2" | "chara_card_v3";
  specVersion: string;
  data: CharacterCardData;
};

export type ParseCharacterCardResult = {
  card: NormalizedCharacterCard;
  /** Raw PNG bytes as a data URL when the source was an image. */
  avatarDataUrl?: string;
};

/** Max compressed file size (PNG + embedded metadata). */
export const MAX_CARD_FILE_BYTES = 5 * 1024 * 1024;
/** Max decoded Base64 metadata string (UTF-8 JSON text). */
export const MAX_CARD_METADATA_CHARS = 512 * 1024;
/** Soft cap per prompt-facing string field. */
export const MAX_CARD_FIELD_CHARS = 100_000;
/** Max compressed zTXt payload we will attempt to inflate. */
export const MAX_ZTXT_COMPRESSED_BYTES = 1024 * 1024;
/** Max inflated zTXt output (Base64 text before decode). */
export const MAX_ZTXT_INFLATED_BYTES = 768 * 1024;
/** Max serialized `extensions` blob we keep. */
export const MAX_EXTENSIONS_JSON_CHARS = 32_768;
/** Reject avatar data URLs for images larger than this (pixel bomb). */
export const MAX_AVATAR_DIMENSION = 2048;
export const MAX_AVATAR_PIXELS = 2048 * 2048;

const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10] as const;
const CARD_KEYWORDS = new Set(["chara", "ccv3"]);

function asString(value: unknown, max = MAX_CARD_FIELD_CHARS): string {
  if (typeof value !== "string") return "";
  return value.length > max ? value.slice(0, max) : value;
}

function asStringArray(value: unknown, maxItems = 64, maxItem = 500): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== "string") continue;
    out.push(v.length > maxItem ? v.slice(0, maxItem) : v);
    if (out.length >= maxItems) break;
  }
  return out;
}

function asExtensions(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  try {
    const json = JSON.stringify(value);
    if (!json || json.length > MAX_EXTENSIONS_JSON_CHARS) return {};
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

function emptyData(): CharacterCardData {
  return {
    name: "",
    description: "",
    personality: "",
    scenario: "",
    first_mes: "",
    mes_example: "",
    system_prompt: "",
    post_history_instructions: "",
    alternate_greetings: [],
    creator_notes: "",
    tags: [],
    creator: "",
    character_version: "",
    extensions: {},
  };
}

function readDataFields(raw: Record<string, unknown>): CharacterCardData {
  const data = emptyData();
  data.name = asString(raw.name, 200);
  data.description = asString(raw.description);
  data.personality = asString(raw.personality);
  data.scenario = asString(raw.scenario);
  data.first_mes = asString(raw.first_mes);
  data.mes_example = asString(raw.mes_example);
  data.system_prompt = asString(raw.system_prompt);
  data.post_history_instructions = asString(raw.post_history_instructions);
  data.alternate_greetings = asStringArray(raw.alternate_greetings, 32, MAX_CARD_FIELD_CHARS);
  data.creator_notes = asString(raw.creator_notes, 20_000);
  data.tags = asStringArray(raw.tags, 64, 64);
  data.creator = asString(raw.creator, 200);
  data.character_version = asString(raw.character_version, 64);
  data.extensions = asExtensions(raw.extensions);
  const nickname = asString(raw.nickname, 200).trim();
  if (nickname) data.nickname = nickname;
  return data;
}

/** Normalize V1 / V2 / V3 JSON into a single internal shape. */
export function normalizeCharacterCardJson(raw: unknown): NormalizedCharacterCard {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Character card JSON must be an object.");
  }
  const obj = raw as Record<string, unknown>;
  const spec = asString(obj.spec, 32);

  if (spec === "chara_card_v3" || spec === "chara_card_v2") {
    const dataObj = obj.data;
    if (!dataObj || typeof dataObj !== "object" || Array.isArray(dataObj)) {
      throw new Error("Character card is missing a data object.");
    }
    return {
      spec,
      specVersion: asString(obj.spec_version, 16) || (spec === "chara_card_v3" ? "3.0" : "2.0"),
      data: readDataFields(dataObj as Record<string, unknown>),
    };
  }

  // V1 flat card (no spec field) — or unknown envelope with V1-ish fields.
  if ("name" in obj || "description" in obj || "first_mes" in obj) {
    return {
      spec: "chara_card_v2",
      specVersion: "2.0",
      data: readDataFields(obj),
    };
  }

  throw new Error("Unrecognized character card format.");
}

function decodeBase64Utf8(base64: string): string {
  const cleaned = base64.replace(/\s+/g, "");
  if (cleaned.length > MAX_CARD_METADATA_CHARS * 2) {
    throw new Error("Character card metadata is too large.");
  }
  const binary = atob(cleaned);
  if (binary.length > MAX_CARD_METADATA_CHARS * 2) {
    throw new Error("Character card metadata is too large.");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (text.length > MAX_CARD_METADATA_CHARS) {
    throw new Error("Character card metadata is too large.");
  }
  return text;
}

async function inflateZlib(data: Uint8Array, maxBytes: number): Promise<Uint8Array> {
  if (data.byteLength > MAX_ZTXT_COMPRESSED_BYTES) {
    throw new Error("Character card metadata is too large.");
  }

  if (typeof DecompressionStream !== "undefined") {
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    const stream = new Blob([copy])
      .stream()
      .pipeThrough(new DecompressionStream("deflate"));
    const reader = stream.getReader();
    const parts: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new Error("Character card metadata is too large.");
      }
      parts.push(value);
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      out.set(part, offset);
      offset += part.byteLength;
    }
    return out;
  }

  // Node test / older runtimes — maxOutputLength throws on bombs.
  const { inflateSync } = await import("node:zlib");
  try {
    return new Uint8Array(inflateSync(data, { maxOutputLength: maxBytes }));
  } catch {
    throw new Error("Character card metadata is too large.");
  }
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset]! << 24) |
      (bytes[offset + 1]! << 16) |
      (bytes[offset + 2]! << 8) |
      bytes[offset + 3]!) >>>
    0
  );
}

function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIG[i]) return false;
  }
  return true;
}

/** Read IHDR width/height; return null if missing/invalid. */
export function readPngDimensions(
  bytes: Uint8Array,
): { width: number; height: number } | null {
  if (!isPng(bytes) || bytes.length < 24) return null;
  // Signature (8) + length(4) + "IHDR"(4) + width(4) + height(4)
  const type = String.fromCharCode(
    bytes[12]!,
    bytes[13]!,
    bytes[14]!,
    bytes[15]!,
  );
  if (type !== "IHDR") return null;
  const width = readUint32BE(bytes, 16);
  const height = readUint32BE(bytes, 20);
  if (width === 0 || height === 0) return null;
  return { width, height };
}

function avatarDataUrlIfSafe(bytes: Uint8Array): string | undefined {
  const dim = readPngDimensions(bytes);
  if (!dim) return undefined;
  if (dim.width > MAX_AVATAR_DIMENSION || dim.height > MAX_AVATAR_DIMENSION) {
    return undefined;
  }
  if (dim.width * dim.height > MAX_AVATAR_PIXELS) return undefined;
  return bytesToPngDataUrl(bytes);
}

type CardTextPayload = { ccv3?: string; chara?: string };

/**
 * Walk PNG chunks and decode only `ccv3` / `chara` text. Other tEXt/zTXt
 * chunks are ignored so a hostile extra zTXt cannot force inflation.
 */
async function extractCardPayloadFromPng(bytes: Uint8Array): Promise<CardTextPayload> {
  if (!isPng(bytes)) throw new Error("Not a PNG file.");

  const out: CardTextPayload = {};
  let offset = 8;

  while (offset + 12 <= bytes.length) {
    const length = readUint32BE(bytes, offset);
    if (length > bytes.length) break;
    const type = String.fromCharCode(
      bytes[offset + 4]!,
      bytes[offset + 5]!,
      bytes[offset + 6]!,
      bytes[offset + 7]!,
    );
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) break;

    if (type === "tEXt" || type === "zTXt") {
      const data = bytes.subarray(dataStart, dataEnd);
      let nullIdx = -1;
      for (let i = 0; i < data.length; i++) {
        if (data[i] === 0) {
          nullIdx = i;
          break;
        }
      }
      if (nullIdx >= 0) {
        const keyword = new TextDecoder("latin1")
          .decode(data.subarray(0, nullIdx))
          .toLowerCase();
        if (CARD_KEYWORDS.has(keyword)) {
          let text: string;
          if (type === "tEXt") {
            text = new TextDecoder("latin1").decode(data.subarray(nullIdx + 1));
          } else {
            const method = data[nullIdx + 1];
            if (method !== 0) {
              offset = dataEnd + 4;
              continue;
            }
            const compressed = data.subarray(nullIdx + 2);
            const inflated = await inflateZlib(compressed, MAX_ZTXT_INFLATED_BYTES);
            text = new TextDecoder("latin1").decode(inflated);
          }
          if (keyword === "ccv3") out.ccv3 = text;
          else out.chara = text;
          if (out.ccv3) break; // preferred payload found — stop walking
        }
      }
    }

    if (type === "IEND") break;
    offset = dataEnd + 4;
  }

  return out;
}

function cardFromPngPayload(payload: CardTextPayload): NormalizedCharacterCard {
  const raw = payload.ccv3 ?? payload.chara;
  if (!raw) {
    throw new Error("PNG has no character card metadata (missing ccv3/chara chunk).");
  }
  let jsonText: string;
  try {
    jsonText = decodeBase64Utf8(raw);
  } catch (err) {
    if (err instanceof Error && /too large/i.test(err.message)) throw err;
    throw new Error("Character card metadata is not valid Base64.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Character card metadata is not valid JSON.");
  }
  return normalizeCharacterCardJson(parsed);
}

function bytesToPngDataUrl(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

function assertFileSize(byteLength: number) {
  if (byteLength > MAX_CARD_FILE_BYTES) {
    throw new Error(
      `Character card is too large (max ${Math.round(MAX_CARD_FILE_BYTES / (1024 * 1024))}MB).`,
    );
  }
}

/** Parse a character card from a File (PNG or JSON). */
export async function parseCharacterCardFile(file: File): Promise<ParseCharacterCardResult> {
  assertFileSize(file.size);
  const name = file.name.toLowerCase();
  const buffer = new Uint8Array(await file.arrayBuffer());
  assertFileSize(buffer.byteLength);

  if (name.endsWith(".json") || file.type === "application/json" || file.type === "text/json") {
    if (buffer.byteLength > MAX_CARD_METADATA_CHARS * 2) {
      throw new Error("Character card metadata is too large.");
    }
    const text = new TextDecoder("utf-8").decode(buffer);
    if (text.length > MAX_CARD_METADATA_CHARS) {
      throw new Error("Character card metadata is too large.");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("File is not valid JSON.");
    }
    return { card: normalizeCharacterCardJson(parsed) };
  }

  if (name.endsWith(".png") || file.type === "image/png" || isPng(buffer)) {
    const payload = await extractCardPayloadFromPng(buffer);
    return {
      card: cardFromPngPayload(payload),
      avatarDataUrl: avatarDataUrlIfSafe(buffer),
    };
  }

  // Try JSON text, then PNG
  try {
    const text = new TextDecoder("utf-8").decode(buffer);
    if (text.length <= MAX_CARD_METADATA_CHARS) {
      const parsed = JSON.parse(text);
      return { card: normalizeCharacterCardJson(parsed) };
    }
  } catch {
    /* fall through */
  }

  if (isPng(buffer)) {
    const payload = await extractCardPayloadFromPng(buffer);
    return {
      card: cardFromPngPayload(payload),
      avatarDataUrl: avatarDataUrlIfSafe(buffer),
    };
  }

  throw new Error("Unsupported file. Import a .png character card or .json export.");
}

/** Display name for UI and {{char}} (nickname wins when set). */
export function characterDisplayName(data: CharacterCardData): string {
  const nick = data.nickname?.trim();
  if (nick) return nick;
  return data.name.trim() || "Character";
}
