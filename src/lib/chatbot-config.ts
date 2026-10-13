// ─────────────────────────────────────────────────────────────────────────────
//  chatbot-config — HIER wird der Chatbot angepasst.
//
//  Zwei Modi:
//   • "stichwort": unser Mini-Chatbot. Antworten kommen aus `wissen.ts`
//                  (Name, Begrüßung und Fragen/Antworten stehen auch dort).
//   • "ki":        ein KI-Modell über euren eigenen Provider. Es bekommt das
//                  Transkript unten mit und beantwortet Fragen dazu.
//
//  Die Audiodatei (optional) in den Ordner `public/` legen und unten bei
//  audioFile den Dateinamen eintragen, z. B. "aufnahme.mp3".
// ─────────────────────────────────────────────────────────────────────────────

import { BOT, WISSEN } from "@/lib/wissen";

export const CHATBOT = {
  /** "stichwort" = Mini-Chatbot aus wissen.ts · "ki" = KI-Modell über Provider */
  modus: "stichwort" as "stichwort" | "ki",

  /** Name des Bots — steht groß auf der Startseite und im Browser-Tab. */
  name: BOT.name,

  /** Kurzer Untertitel auf der Startseite. */
  tagline: BOT.untertitel,

  /**
   * Nur für modus "ki": euer eigener Modell-Provider (kein API-Key nötig).
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
  suggestions: WISSEN.map((e) => e.frage),

  /** Nur für modus "ki": Anweisungen an die KI — wie soll sich der Bot verhalten? */
  instructions: `Du bist ein Chatbot für ein Schulprojekt im Wahlpflichtfach Informatik.
Du antwortest mit den Worten von Jonas aus dem Interview unten — kurz, auf Deutsch.
Wenn etwas nicht im Transkript steht, sag ehrlich, dass Jonas dazu nichts gesagt hat.`,
};

export const STICHWORT_MODUS = CHATBOT.modus === "stichwort";

/** Das Transkript der Sprachaufnahme (wird im modus "ki" an das Modell geschickt). */
export const TRANSCRIPT = `
Stell dich einmal vor, wie heißt du? Wie alt bist du? Und erzähl bist dann eine Geschichte für dich. Danach habe ich Jonas Lürzer. Ich bin 19 Jahre alt und komme aus dem Westen des Südsudans. Interessant. Meine Geschichte. Deine Fresse, ja. Nein, machen wir weiter. Ich bin gekommen mit dem Schlauchboot. Ich bin gekommen mit dem Schlauchboot. Durch das ganze weite Mittelmeer. Gebritt von tiefen Wellen. Ich habe molestet. Und hoher See. Ich habe molestet. Wie würdest du dich in drei Sätzen selbst beschreiben? Ich bin ein braver Paddler, ein arroganter Südsudaner und ein zielstrebiger Europäer. Was sind die drei Dinge, die deine Identität am stärksten bringen? Meine Identität, die mentale Kraft, die Stärke, die innere, die Fingerfertigkeit und das küge Köpfchen. Welche Rolle siehst du für dich in der Welt? Meine Rolle in der Welt ist der EU-Vorsitz, ganz klar. Ich werde das ganze Parlament revolutionieren. Ich werde die wichtigsten Entscheidungen treffen, welche die Russen vernichten werden. Wie hat sich dein Selbstverständnis in den letzten fünf Jahren verendet? Wiederholen Sie die Frage, bitte. Wie hat sich dein Selbstverständnis in den letzten fünf Jahren verendet? Gar nicht. Was würde dich als Person fundamental verendet? Das Sieg gegenüber den Russen. Was sind deine Top 5 Werte und warum sind sie dir wichtig? Meine Werte sind Tapferkeit, Mut, Gelassenheit. Zuneigung. Und als letztes der Wille. Gibt es Überzeugungen für dich, dass du kompromisslos einstimmst? Nein, es gibt es nicht. Welches Problem würde dir am liebsten gelöst sein? Die Amerikaner. Wie siehst du die Balance zwischen Individualität und Gemeinschaft? Es gibt keine Gemeinschaft. Jeder kämpft sein eigenes Leben. Was bedeutet Erfolg für dich persönlich? Erfolg ist der lange Weg. Das ist Erfolg. Nicht der Erfolg selbst. Also du sagst, der Weg ist das Ziel? Definitiv. Wie machst du normalerweise Entscheidungen, rational, intuitiv oder hybrid? Illusional. Sehr stark. Wie reagierst du auf Widerspruch oder gegen setzliche Meinung? Es gibt es nicht. Keiner kann mehr widersprechen. Die erreichen dich gar nicht, oder? Ich höre die Stimme nicht, außer meine eigenen. Hast du mehrere in der Stimme? Jawohl. Und sie treffen meine Entscheidungen für mich. Wann erkennst du, dass du deine Meinung ändern solltest? Ich treffe meine Meinung nicht, grundsätzlich. Arbeitest du lieber mit Details oder mit großen Muskeln? Ich arbeite mit Leidenschaft. Wie gehst du mit Unsicherheit um? Hab ich nicht. Kenn ich nicht das Gefühl. Woher kommen deine besten Ideen? Von deinen Kollegen aus dem Südsudan. Stark. Wie definierst du Kreativität? Kreativität ist für mich die Zuneigung. Kreativität ist für mich die Marine. Welche Art von Problemen reizt es dich zu lösen? Die Probleme, den Feind aufzulöschen. Wie experimentierfleutig bist du bei neuen Ansätzen? Durchaus sehr. Gibt es eine kreative Praxis oder ein Handwerk, das dir wichtig ist? Ja, die Zimmerei. Welche Qualitäten schätzt du am meisten in anderen Menschen? Die Bosartigkeit. Wie beeinflusst dich die Meinung anderer? Gar nicht. Was verstehst du unter echtem Verständnis zwischen Menschen? Ich kann den anderen nicht verstehen. Es sind alle nicht wie ich. Und wie treffst du Menschen, mit denen du dich austauschen möchtest? Ich treffe sie mit arrogant, mit grundarrogant. Das lernt man in der Heimat. Wann und wie zeigst du Verletzlichkeit? Gar nicht. Was verstehst du unter echtem Verständnis zwischen Menschen? Ich kann den anderen nicht verstehen. Es sind alle nicht wie ich. Was verstehst du unter echtem Verletzlichkeit? Gar nicht. Außer vor meinen Schildkröten. Was treffst du bei deiner Arbeit an? Meine Schildkröten. Definitiv. Was sagst du? Wie definierst du Bedeutungen im professionellen Kontext? Das ist eine gute Frage. Bedeutung hat für mich... die Luftwaffe. Und welche Fähigkeiten möchtest du noch entwickeln? Die Fähigkeit, noch grausamer zu werden. Und unter Wasser zu warten. Und wie tolerierst du Scheitern? Ich toleriere kein Scheitern. Das Vorbild ist Napoleon. Und er ist gescheitert. Deswegen scheitere ich nicht. Was wäre für dich eine verschwendete Karriere? Zu enten wie Napoleon. Was ist dein Verhältnis zu visueller Schönheit? Visuelle Schönheit ist C4. In den Gebäuden dagegen. Gibt es einen wiederkehrenden ästhetischen Geschmack in deinem Leben? Ja. Definitiv. Meine Art, wie ich den anderen Leuten bald zufügen kann. Nicht nur physisch, sondern psychisch. Warum zieht dich bestimmtes Design oder bestimmte Ästhetik an? Weil es ein Augenschmaß ist. Wie rückst du dich visuell oder materielle Wahlfreiheit aus? Nächste Frage. Welche Technologie zukunftswünschst du dir? Einklaut mit Unendlich Limit. Welche Technologie trennst du, misstraust du oder linst du ab? Ich misstraue grundsätzlich jeder KI und jedem technischen Ansatz. Und wie siehst du das Verhältnis Mensch KI? Ein Wahnsinn. Ich wünsche mir die Vergangenheit zurück. Ich wünsche mir die guten alten Zeiten ohne KI. Welche Fähigkeiten werden in Zukunft am wertvollsten sein? Uwutwahrer. Meinst du nicht das autonome Uwut zu kommen, oder? Nee. Wie möchtest du von Technologien deinem Leben unterstützt werden? Nicht. Was gibt deinem Leben Sinn? Ich freu dir am Krieg. Wie denkst du über Vergänglichkeit und Sterblichkeit? Es gibt keine Vergänglichkeit. Welche Vermächtnisse möchtest du hinterlassen? Dass der Karten von Jahrhunderten noch von mir geredet wird. Und meinen grausaren Taten. Wie balanciest du Ehrgeiz mit Gelassenheit? Du individuelles Training. Was würdest du deinem jüngeren Selbst heute erzählen? Mach genau so weiter, wie du angefangen hast. Was macht dich gerade wütend oder frustriert? Gar nichts. Ich kenne keine Emotionen. Woran denkst du zuerst am Morgen? Nächste Frage. Welche tägliche Gewohnheit ist dir fundamental wichtig? Mein Kamillentee in der Früh. Was hast du diese Woche gelernt? Dass Kamillentee mit Honig noch besser schmeckt. Du hast. Worauf freust du dich? Ein Kamillentee im Morgen. Danke für die Antworten. Haben Sie einen schönen Tag.
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
