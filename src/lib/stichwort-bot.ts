// ─────────────────────────────────────────────────────────────────────────────
//  stichwort-bot — der Mini-Chatbot aus unserem Projekt (ohne KI).
//
//  Sucht in der Frage nach Stichwörtern aus `wissen.ts` und gibt die passende
//  gespeicherte Antwort zurück. Logik 1:1 aus der ursprünglichen index.html.
//  `stichwortChatResponse` verpackt die Antwort als NDJSON-Stream, damit die
//  Chat-Oberfläche (use-chat) sie wie eine Modell-Antwort anzeigt.
// ─────────────────────────────────────────────────────────────────────────────

import { BOT, WISSEN, type WissensEintrag } from "@/lib/wissen";

// Kleinschreiben, Umlaute/Akzente entfernen, Satzzeichen zu Leerzeichen.
export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9= ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Ein Stichwort passt, wenn ein Wort der Frage damit beginnt
// (Stichwörter mit Leerzeichen müssen am Wortanfang vorkommen).
function passt(stichwort: string, normText: string, woerter: string[]): boolean {
  const kw = normalisiere(stichwort);
  if (!kw) return false;
  if (kw.includes(" ")) return ` ${normText}`.includes(` ${kw}`);
  return woerter.some((w) => w.startsWith(kw));
}

export type Treffer = { eintrag: WissensEintrag; gefunden: string[]; laenge: number };

// Beste Antwort suchen: meiste Treffer, bei Gleichstand die längsten Stichwörter.
export function finde(frage: string): Treffer | null {
  const normText = normalisiere(frage);
  const woerter = normText.split(" ");
  let beste: Treffer | null = null;
  for (const eintrag of WISSEN) {
    const gefunden = eintrag.stichwoerter.filter((s) => passt(s, normText, woerter));
    if (gefunden.length === 0) continue;
    const laenge = gefunden.reduce((summe, s) => summe + normalisiere(s).length, 0);
    if (
      !beste ||
      gefunden.length > beste.gefunden.length ||
      (gefunden.length === beste.gefunden.length && laenge > beste.laenge)
    ) {
      beste = { eintrag, gefunden, laenge };
    }
  }
  return beste;
}

export function antworte(frage: string): string {
  const treffer = finde(frage);
  const text = treffer ? treffer.eintrag.antwort : BOT.unbekannt;
  if (!BOT.zeigeTreffer) return text;
  const info = treffer ? treffer.gefunden.join(", ") : "keine";
  return `${text}\n\n*Gefundene Stichwörter: ${info}*`;
}

type ChatBody = {
  messages?: Array<{ role: string; content?: unknown }>;
};

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (part && typeof part === "object" && "text" in part ? String(part.text) : ""))
      .join(" ");
  }
  return "";
}

const encoder = new TextEncoder();
const TIPP_PAUSE_MS = 18;

/** Antwort auf POST /api/chat — Wort für Wort gestreamt, damit es wie Tippen wirkt. */
export async function stichwortChatResponse(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as ChatBody;
  const lastUser = [...(body.messages ?? [])].reverse().find((m) => m.role === "user");
  const antwort = antworte(textOf(lastUser?.content));
  const teile = antwort.match(/\S+\s*/g) ?? [antwort];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const teil of teile) {
        if (req.signal.aborted) break;
        controller.enqueue(encoder.encode(`${JSON.stringify({ p: "content", t: teil })}\n`));
        await new Promise((r) => setTimeout(r, TIPP_PAUSE_MS));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
