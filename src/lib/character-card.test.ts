import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deflateSync } from "node:zlib";
import {
  normalizeCharacterCardJson,
  parseCharacterCardFile,
  characterDisplayName,
} from "@/lib/character-card";

function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]!) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u32(n: number): Uint8Array {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const len = u32(data.length);
  const body = new Uint8Array(4 + data.length);
  body.set(typeBytes, 0);
  body.set(data, 4);
  const crc = u32(crc32(body));
  const out = new Uint8Array(12 + data.length);
  out.set(len, 0);
  out.set(body, 4);
  out.set(crc, 8 + data.length);
  return out;
}

function buildPngWithText(keyword: string, text: string, compress = false): Uint8Array {
  return buildPngWithTexts([{ keyword, text, compress }]);
}

function buildPngWithTexts(
  entries: Array<{ keyword: string; text: string; compress?: boolean }>,
): Uint8Array {
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  // Minimal 1×1 IHDR
  const ihdr = pngChunk(
    "IHDR",
    new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]),
  );
  const textChunks = entries.map(({ keyword, text, compress }) => {
    const keywordBytes = new TextEncoder().encode(keyword);
    if (compress) {
      const compressed = deflateSync(Buffer.from(text, "latin1"));
      const data = new Uint8Array(keywordBytes.length + 2 + compressed.length);
      data.set(keywordBytes, 0);
      data[keywordBytes.length] = 0;
      data[keywordBytes.length + 1] = 0; // deflate
      data.set(compressed, keywordBytes.length + 2);
      return pngChunk("zTXt", data);
    }
    const textBytes = new TextEncoder().encode(text);
    const data = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
    data.set(keywordBytes, 0);
    data[keywordBytes.length] = 0;
    data.set(textBytes, keywordBytes.length + 1);
    return pngChunk("tEXt", data);
  });
  const iend = pngChunk("IEND", new Uint8Array());
  const total =
    sig.length +
    ihdr.length +
    textChunks.reduce((n, c) => n + c.length, 0) +
    iend.length;
  const out = new Uint8Array(total);
  let o = 0;
  out.set(sig, o); o += sig.length;
  out.set(ihdr, o); o += ihdr.length;
  for (const chunk of textChunks) {
    out.set(chunk, o);
    o += chunk.length;
  }
  out.set(iend, o);
  return out;
}

describe("normalizeCharacterCardJson", () => {
  it("parses V1 flat cards", () => {
    const card = normalizeCharacterCardJson({
      name: "Ava",
      description: "A guide",
      personality: "calm",
      scenario: "a forest",
      first_mes: "Hello {{user}}",
      mes_example: "",
    });
    assert.equal(card.spec, "chara_card_v2");
    assert.equal(card.data.name, "Ava");
    assert.equal(card.data.first_mes, "Hello {{user}}");
  });

  it("parses V2 nested cards", () => {
    const card = normalizeCharacterCardJson({
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: "Bex",
        description: "desc",
        personality: "",
        scenario: "",
        first_mes: "Hi",
        mes_example: "",
        system_prompt: "Be {{char}}",
        post_history_instructions: "Stay brief",
        alternate_greetings: ["Alt"],
        creator_notes: "notes",
        tags: ["fantasy"],
        creator: "me",
        character_version: "1",
        extensions: { "x/test": 1 },
      },
    });
    assert.equal(card.spec, "chara_card_v2");
    assert.equal(card.data.system_prompt, "Be {{char}}");
    assert.deepEqual(card.data.alternate_greetings, ["Alt"]);
    assert.equal(card.data.extensions["x/test"], 1);
  });

  it("parses V3 with nickname", () => {
    const card = normalizeCharacterCardJson({
      spec: "chara_card_v3",
      spec_version: "3.0",
      data: {
        name: "Long Name",
        nickname: "Short",
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
        group_only_greetings: [],
        extensions: {},
      },
    });
    assert.equal(card.spec, "chara_card_v3");
    assert.equal(characterDisplayName(card.data), "Short");
  });
});

describe("parseCharacterCardFile", () => {
  it("reads JSON files", async () => {
    const json = JSON.stringify({
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: "JsonChar",
        description: "d",
        personality: "",
        scenario: "",
        first_mes: "yo",
        mes_example: "",
        system_prompt: "",
        post_history_instructions: "",
        alternate_greetings: [],
        creator_notes: "",
        tags: [],
        creator: "",
        character_version: "",
        extensions: {},
      },
    });
    const file = new File([json], "card.json", { type: "application/json" });
    const result = await parseCharacterCardFile(file);
    assert.equal(result.card.data.name, "JsonChar");
    assert.equal(result.avatarDataUrl, undefined);
  });

  it("reads PNG chara tEXt chunks", async () => {
    const payload = {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: "PngChar",
        description: "from png",
        personality: "",
        scenario: "",
        first_mes: "hey",
        mes_example: "",
        system_prompt: "",
        post_history_instructions: "",
        alternate_greetings: [],
        creator_notes: "",
        tags: [],
        creator: "",
        character_version: "",
        extensions: {},
      },
    };
    const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const png = buildPngWithText("chara", b64);
    const file = new File([png], "card.png", { type: "image/png" });
    const result = await parseCharacterCardFile(file);
    assert.equal(result.card.data.name, "PngChar");
    assert.ok(result.avatarDataUrl?.startsWith("data:image/png;base64,"));
  });

  it("prefers ccv3 over chara", async () => {
    const v3 = {
      spec: "chara_card_v3",
      spec_version: "3.0",
      data: {
        name: "V3",
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
        group_only_greetings: [],
        extensions: {},
      },
    };
    const b64 = Buffer.from(JSON.stringify(v3), "utf8").toString("base64");
    const png = buildPngWithText("ccv3", b64);
    const file = new File([png], "v3.png", { type: "image/png" });
    const result = await parseCharacterCardFile(file);
    assert.equal(result.card.spec, "chara_card_v3");
    assert.equal(result.card.data.name, "V3");
  });

  it("rejects oversized files", async () => {
    const { MAX_CARD_FILE_BYTES } = await import("@/lib/character-card");
    const huge = new Uint8Array(MAX_CARD_FILE_BYTES + 1);
    const file = new File([huge], "big.json", { type: "application/json" });
    await assert.rejects(() => parseCharacterCardFile(file), /too large/i);
  });

  it("rejects zTXt bombs on chara chunks", async () => {
    const { MAX_ZTXT_INFLATED_BYTES } = await import("@/lib/character-card");
    // Highly compressible payload that inflates past the cap
    const bomb = "A".repeat(MAX_ZTXT_INFLATED_BYTES + 4096);
    const png = buildPngWithText("chara", bomb, true);
    const file = new File([png], "bomb.png", { type: "image/png" });
    await assert.rejects(() => parseCharacterCardFile(file), /too large/i);
  });

  it("ignores non-card zTXt chunks (no forced inflate of decoys)", async () => {
    const payload = {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: "Safe",
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
      },
    };
    const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    // Decoy compressed chunk first — must not be inflated
    const png = buildPngWithTexts([
      { keyword: "comment", text: "A".repeat(100_000), compress: true },
      { keyword: "chara", text: b64, compress: false },
    ]);
    const file = new File([png], "decoy.png", { type: "image/png" });
    const result = await parseCharacterCardFile(file);
    assert.equal(result.card.data.name, "Safe");
  });

  it("truncates oversized prompt fields", () => {
    const card = normalizeCharacterCardJson({
      name: "x",
      description: "D".repeat(200_000),
      personality: "",
      scenario: "",
      first_mes: "",
      mes_example: "",
    });
    assert.equal(card.data.description.length, 100_000);
  });

  it("omits avatar data URL when IHDR dimensions exceed the cap", async () => {
    const { MAX_AVATAR_DIMENSION, readPngDimensions } = await import(
      "@/lib/character-card"
    );
    // Build a PNG whose IHDR claims huge dimensions (IDAT can be empty/minimal —
    // we only inspect IHDR for the avatar gate).
    const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const w = MAX_AVATAR_DIMENSION + 1;
    const h = MAX_AVATAR_DIMENSION + 1;
    const ihdrData = new Uint8Array([
      (w >>> 24) & 0xff,
      (w >>> 16) & 0xff,
      (w >>> 8) & 0xff,
      w & 0xff,
      (h >>> 24) & 0xff,
      (h >>> 16) & 0xff,
      (h >>> 8) & 0xff,
      h & 0xff,
      8,
      2,
      0,
      0,
      0,
    ]);
    const ihdr = pngChunk("IHDR", ihdrData);
    const payload = {
      spec: "chara_card_v2",
      spec_version: "2.0",
      data: {
        name: "HugeAvatar",
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
      },
    };
    const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const keywordBytes = new TextEncoder().encode("chara");
    const textBytes = new TextEncoder().encode(b64);
    const textData = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
    textData.set(keywordBytes, 0);
    textData[keywordBytes.length] = 0;
    textData.set(textBytes, keywordBytes.length + 1);
    const textChunk = pngChunk("tEXt", textData);
    const iend = pngChunk("IEND", new Uint8Array());
    const png = new Uint8Array(
      sig.length + ihdr.length + textChunk.length + iend.length,
    );
    let o = 0;
    png.set(sig, o); o += sig.length;
    png.set(ihdr, o); o += ihdr.length;
    png.set(textChunk, o); o += textChunk.length;
    png.set(iend, o);

    const dims = readPngDimensions(png);
    assert.ok(dims);
    assert.equal(dims!.width, w);

    const file = new File([png], "huge.png", { type: "image/png" });
    const result = await parseCharacterCardFile(file);
    assert.equal(result.card.data.name, "HugeAvatar");
    assert.equal(result.avatarDataUrl, undefined);
  });
});
