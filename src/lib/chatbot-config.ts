// ─────────────────────────────────────────────────────────────────────────────
//  chatbot-config — HIER wird der Chatbot angepasst.
//
//  Alles, was der Bot über die Sprachaufnahme wissen soll, steht in dieser
//  einen Datei. Wenn das Transkript fertig ist: einfach bei TRANSCRIPT einfügen
//  (zwischen die Backticks `…`), speichern, committen — fertig.
//
//  Die Audiodatei (optional) in den Ordner `public/` legen und unten bei
//  AUDIO_FILE den Dateinamen eintragen, z. B. "aufnahme.mp3".
// ─────────────────────────────────────────────────────────────────────────────

export const CHATBOT = {
  /** Name des Bots — steht groß auf der Startseite und im Browser-Tab. */
  name: "Süd Sudanischer Kriegskumpane",

  /** Kurzer Untertitel auf der Startseite. */
  tagline: "Stell mir Fragen zu unserer Sprachaufnahme.",

  /**
   * Euer eigener Modell-Provider (kein API-Key nötig).
   * Er muss eine OpenAI-kompatible Schnittstelle haben: Die Seite schickt die
   * Nachrichten per POST an `<url>/v1/chat/completions` (mit `stream: true`).
   * Das können z. B. Ollama, LM Studio, llama.cpp oder ein eigener Python-Server.
   *  • url:   Adresse des Servers ohne /v1, z. B. "http://localhost:11434"
   *  • model: Name des Modells, wie der Server ihn erwartet
   * Der Server muss CORS für die GitHub-Pages-Adresse erlauben.
   * Leer lassen = man stellt es auf der Seite unter Einstellungen ein.
   */
  provider: {
    url: "",
    model: "",
  },

  /** Dateiname in `public/` (z. B. "aufnahme.mp3") — leer lassen = kein Player. */
  audioFile: "",

  /** Beispielfragen als Klick-Buttons auf der Startseite. */
  suggestions: [
    "Worum geht es in der Aufnahme?",
    "Fass die Aufnahme in 3 Sätzen zusammen.",
    "Wer spricht in der Aufnahme?",
  ],

  /**
   * Anweisungen an die KI — wie soll sich der Bot verhalten?
   * Hier kann man später z. B. auch „Antworte wie die Person aus der Aufnahme“
   * reinschreiben.
   */
  instructions: `Du bist ein freundlicher Chatbot für ein Schulprojekt im Wahlpflichtfach Informatik.
Du beantwortest Fragen zu einer Sprachaufnahme. Das Transkript der Aufnahme steht unten.
Antworte auf Deutsch, kurz und verständlich.
Wenn etwas nicht im Transkript steht, sag ehrlich, dass die Aufnahme dazu nichts sagt.`,
};

/**
 * Das Transkript der Sprachaufnahme. Solange es leer ist, zeigt die Seite
 * einen Hinweis an und der Bot weiß, dass noch kein Transkript da ist.
 */
export const TRANSCRIPT = `
`;

export function hasTranscript(): boolean {
  return TRANSCRIPT.trim().length > 0;
}

/** System-Prompt-Abschnitt, der vor alle anderen Einstellungen gestellt wird. */
export function buildChatbotSystemPrompt(): string {
  const transcript = hasTranscript()
    ? `--- TRANSKRIPT DER SPRACHAUFNAHME ---\n${TRANSCRIPT.trim()}\n--- ENDE TRANSKRIPT ---`
    : "Hinweis: Das Transkript wurde noch nicht eingefügt. Sag das freundlich, wenn jemand nach dem Inhalt der Aufnahme fragt.";
  return `${CHATBOT.instructions.trim()}\n\n${transcript}`;
}
