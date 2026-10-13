// =====================================================================================================
//  WISSENSBASIS des Stichwort-Chatbots – die Antworten stammen aus dem Interview (Transkript).
//  Für neue Fragen/Antworten nur diese Datei bearbeiten.
//
//  ACHTUNG: Diese Datei ist im Internet für alle lesbar, sobald die Seite online ist (GitHub Pages).
//  Echte Interview-Antworten dürfen erst online, wenn die interviewte Person sie gelesen und
//  freigegeben hat.
//
//  So geht ein Eintrag:
//    frage:        eine Beispielfrage (erscheint als Vorschlag-Knopf)
//    stichwoerter: Wörter, an denen der Bot die Frage erkennt
//                  (klein schreiben; Wortanfänge reichen: 'geboren' passt zu „Wo wurdest du geboren?“)
//    antwort:      die Antwort, wörtlich aus dem Transkript
//
//  Nach jedem Eintrag und nach jedem Wort ein Komma. Texte in 'einfachen' Anführungszeichen.
//  Steht in einem Text ein Apostroph, nimm "doppelte" Anführungszeichen.
// =====================================================================================================

export type WissensEintrag = {
  frage: string;
  stichwoerter: string[];
  antwort: string;
};

export const BOT = {
  name: 'Süd Sudanischer Kriegskumpane',
  untertitel: 'Ein Mini-Chatbot, der mit den Worten aus unserem Interview antwortet',
  begruessung: 'Hallo! Ich bin ein Mini-Chatbot und antworte mit den Worten von Jonas aus unserem Interview. Frag mich etwas – unten stehen Beispiele.',
  unbekannt: 'Dazu fällt mir leider nichts ein. Frag mich etwas anderes!',
  hinweis: 'Schulprojekt im Informatikunterricht. Der Bot sucht nur nach Stichwörtern und gibt gespeicherte Antworten aus einem Interview wieder – er versteht nichts und kann sich irren.',
  /** true = unter jeder Antwort stehen die gefundenen Stichwörter. */
  zeigeTreffer: false,
};

export const WISSEN: WissensEintrag[] = [
  {
    frage: 'Wie heißt du und wie alt bist du?',
    stichwoerter: ['heißt', 'heisst', 'name', 'alt bist', 'alter', 'jahre alt', 'vorstell', 'wer bist', 'woher kommst', 'herkunft', 'kommst du'],
    antwort: 'Jonas Lürzer. Ich bin 19 Jahre alt und komme aus dem Westen des Südsudans.',
  },
  {
    frage: 'Erzähl mir deine Geschichte.',
    stichwoerter: ['geschichte', 'schlauchboot', 'mittelmeer', 'flucht', 'hergekommen', 'nach europa'],
    antwort: 'Ich bin gekommen mit dem Schlauchboot. Durch das ganze weite Mittelmeer.',
  },
  {
    frage: 'Wie würdest du dich in drei Sätzen beschreiben?',
    stichwoerter: ['drei sätze', 'beschreib', 'charakter', 'eigenschaften'],
    antwort: 'Ich bin ein braver Paddler, ein arroganter Südsudaner und ein zielstrebiger Europäer.',
  },
  {
    frage: 'Was sind die drei Dinge, die deine Identität am stärksten ausmachen?',
    stichwoerter: ['identität', 'drei dinge', 'stärksten'],
    antwort: 'Die mentale Kraft, die Stärke, die innere, die Fingerfertigkeit und das kluge Köpfchen.',
  },
  {
    frage: 'Welche Rolle siehst du für dich in der Welt?',
    stichwoerter: ['rolle', 'vorsitz', 'parlament', 'in der welt'],
    antwort: 'Meine Rolle in der Welt ist der EU-Vorsitz, ganz klar. Ich werde das ganze Parlament revolutionieren. Ich werde die wichtigsten Entscheidungen treffen, welche die Russen vernichten werden.',
  },
  {
    frage: 'Wie hat sich dein Selbstverständnis in den letzten fünf Jahren verändert?',
    stichwoerter: ['selbstverständnis', 'letzten fünf jahre'],
    antwort: 'Gar nicht.',
  },
  {
    frage: 'Was würde dich als Person fundamental verändern?',
    stichwoerter: ['fundamental'],
    antwort: 'Das Sieg gegenüber den Russen.',
  },
  {
    frage: 'Was sind deine Top-5-Werte?',
    stichwoerter: ['werte', 'top 5', 'top5', 'top-5'],
    antwort: 'Meine Werte sind Tapferkeit, Mut, Gelassenheit. Zuneigung. Und als letztes der Wille.',
  },
  {
    frage: 'Gibt es Überzeugungen, bei denen du keine Kompromisse machst?',
    stichwoerter: ['überzeugung', 'kompromiss', 'einstimmst'],
    antwort: 'Nein, es gibt es nicht.',
  },
  {
    frage: 'Welches Problem würdest du am liebsten gelöst sehen?',
    stichwoerter: ['am liebsten', 'gelöst'],
    antwort: 'Die Amerikaner.',
  },
  {
    frage: 'Welche Art von Problemen reizt es dich zu lösen?',
    stichwoerter: ['reizt', 'probleme', 'art von problem'],
    antwort: 'Die Probleme, den Feind auszulöschen.',
  },
  {
    frage: 'Wie siehst du Individualität und Gemeinschaft?',
    stichwoerter: ['individualität', 'gemeinschaft', 'balance'],
    antwort: 'Es gibt keine Gemeinschaft. Jeder kämpft sein eigenes Leben.',
  },
  {
    frage: 'Was bedeutet Erfolg für dich?',
    stichwoerter: ['erfolg', 'weg ist das ziel'],
    antwort: 'Erfolg ist der lange Weg. Das ist Erfolg. Nicht der Erfolg selbst.',
  },
  {
    frage: 'Wie triffst du Entscheidungen: rational, intuitiv oder beides?',
    stichwoerter: ['entscheidungen', 'rational', 'intuitiv', 'hybrid'],
    antwort: 'Illusional. Sehr stark.',
  },
  {
    frage: 'Wie reagierst du auf Widerspruch?',
    stichwoerter: ['widerspruch', 'widerspricht', 'gegensätzlich', 'gegenteilig'],
    antwort: 'Es gibt es nicht. Keiner kann mehr widersprechen. Ich höre die Stimme nicht, außer meine eigenen.',
  },
  {
    frage: 'Hörst du mehrere Stimmen?',
    stichwoerter: ['stimme', 'stimmen'],
    antwort: 'Jawohl. Und sie treffen meine Entscheidungen für mich.',
  },
  {
    frage: 'Wann erkennst du, dass du deine Meinung ändern solltest?',
    stichwoerter: ['meinung ändern', 'meinung aendern', 'erkennst'],
    antwort: 'Ich treffe meine Meinung nicht, grundsätzlich.',
  },
  {
    frage: 'Arbeitest du lieber mit Details oder im großen Ganzen?',
    stichwoerter: ['details', 'arbeitest', 'großen ganzen'],
    antwort: 'Ich arbeite mit Leidenschaft.',
  },
  {
    frage: 'Wie gehst du mit Unsicherheit um?',
    stichwoerter: ['unsicherheit', 'unsicher'],
    antwort: 'Hab ich nicht. Kenn ich nicht das Gefühl.',
  },
  {
    frage: 'Woher kommen deine besten Ideen?',
    stichwoerter: ['ideen', 'idee'],
    antwort: 'Von deinen Kollegen aus dem Südsudan.',
  },
  {
    frage: 'Wie definierst du Kreativität?',
    stichwoerter: ['kreativität', 'kreativ'],
    antwort: 'Kreativität ist für mich die Zuneigung. Kreativität ist für mich die Marine.',
  },
  {
    frage: 'Wie experimentierfreudig bist du bei neuen Ansätzen?',
    stichwoerter: ['experiment', 'neuen ansätzen', 'neue ansätze'],
    antwort: 'Durchaus sehr.',
  },
  {
    frage: 'Gibt es ein Handwerk, das dir wichtig ist?',
    stichwoerter: ['handwerk', 'praxis', 'zimmerei'],
    antwort: 'Ja, die Zimmerei.',
  },
  {
    frage: 'Welche Qualitäten schätzt du an anderen Menschen?',
    stichwoerter: ['qualität', 'schätzt', 'schätzen'],
    antwort: 'Die Bösartigkeit.',
  },
  {
    frage: 'Wie beeinflusst dich die Meinung anderer?',
    stichwoerter: ['beeinfluss'],
    antwort: 'Gar nicht.',
  },
  {
    frage: 'Was verstehst du unter echtem Verständnis zwischen Menschen?',
    stichwoerter: ['verständnis', 'verstehen', 'verstehst'],
    antwort: 'Ich kann den anderen nicht verstehen. Es sind alle nicht wie ich.',
  },
  {
    frage: 'Wie triffst du Menschen, mit denen du dich austauschen möchtest?',
    stichwoerter: ['triffst', 'austausch', 'begegnest'],
    antwort: 'Ich treffe sie mit arrogant, mit grundarrogant. Das lernt man in der Heimat.',
  },
  {
    frage: 'Wann und wie zeigst du Verletzlichkeit?',
    stichwoerter: ['verletzlich', 'verletzbar'],
    antwort: 'Gar nicht. Außer vor meinen Schildkröten.',
  },
  {
    frage: 'Was triffst du bei deiner Arbeit an?',
    stichwoerter: ['deiner arbeit', 'schildkröte'],
    antwort: 'Meine Schildkröten. Definitiv.',
  },
  {
    frage: 'Wie definierst du Bedeutung im professionellen Kontext?',
    stichwoerter: ['bedeutung', 'professionell', 'kontext'],
    antwort: 'Bedeutung hat für mich... die Luftwaffe.',
  },
  {
    frage: 'Welche Fähigkeiten möchtest du noch entwickeln?',
    stichwoerter: ['entwickeln', 'fähigkeiten möchtest'],
    antwort: 'Die Fähigkeit, noch grausamer zu werden. Und unter Wasser zu warten.',
  },
  {
    frage: 'Wie tolerierst du Scheitern?',
    stichwoerter: ['scheitern', 'napoleon', 'tolerierst', 'toleriere'],
    antwort: 'Ich toleriere kein Scheitern. Das Vorbild ist Napoleon. Und er ist gescheitert. Deswegen scheitere ich nicht.',
  },
  {
    frage: 'Was wäre für dich eine verschwendete Karriere?',
    stichwoerter: ['verschwendet', 'karriere'],
    antwort: 'Zu enden wie Napoleon.',
  },
  {
    frage: 'Wie ist dein Verhältnis zu visueller Schönheit?',
    stichwoerter: ['schönheit', 'schön'],
    antwort: 'Visuelle Schönheit ist C4. In den Gebäuden dagegen.',
  },
  {
    frage: 'Gibt es einen wiederkehrenden ästhetischen Geschmack in deinem Leben?',
    stichwoerter: ['ästhetisch', 'geschmack', 'wiederkehrend'],
    antwort: 'Ja. Definitiv. Meine Art, wie ich den anderen Leuten bald zufügen kann. Nicht nur physisch, sondern psychisch.',
  },
  {
    frage: 'Warum zieht dich bestimmtes Design an?',
    stichwoerter: ['design', 'zieht dich', 'anziehend'],
    antwort: 'Weil es ein Augenschmaß ist.',
  },
  {
    frage: 'Welcher Technologie misstraust du?',
    stichwoerter: ['misstrau', 'mistrau'],
    antwort: 'Ich misstraue grundsätzlich jeder KI und jedem technischen Ansatz.',
  },
  {
    frage: 'Wie siehst du das Verhältnis zwischen Mensch und KI?',
    stichwoerter: ['mensch ki', 'mensch und ki', 'über ki', 'künstliche intelligenz'],
    antwort: 'Ein Wahnsinn. Ich wünsche mir die Vergangenheit zurück. Ich wünsche mir die guten alten Zeiten ohne KI.',
  },
  {
    frage: 'Wie möchtest du von Technologie in deinem Leben unterstützt werden?',
    stichwoerter: ['unterstützt', 'unterstützen', 'unterstützung'],
    antwort: 'Nicht.',
  },
  {
    frage: 'Was gibt deinem Leben Sinn?',
    stichwoerter: ['sinn'],
    antwort: 'Ich freu dir am Krieg.',
  },
  {
    frage: 'Wie denkst du über Vergänglichkeit und Sterblichkeit?',
    stichwoerter: ['vergänglichkeit', 'sterblichkeit', 'tod', 'sterben'],
    antwort: 'Es gibt keine Vergänglichkeit.',
  },
  {
    frage: 'Welches Vermächtnis möchtest du hinterlassen?',
    stichwoerter: ['vermächtnis', 'hinterlassen'],
    antwort: 'Dass der Karten von Jahrhunderten noch von mir geredet wird. Und meinen grausamen Taten.',
  },
  {
    frage: 'Wie balancierst du Ehrgeiz mit Gelassenheit?',
    stichwoerter: ['ehrgeiz', 'balancier'],
    antwort: 'Durch individuelles Training.',
  },
  {
    frage: 'Was würdest du deinem jüngeren Selbst erzählen?',
    stichwoerter: ['jüngeren', 'jüngeres', 'jünger'],
    antwort: 'Mach genau so weiter, wie du angefangen hast.',
  },
  {
    frage: 'Was macht dich gerade wütend oder frustriert?',
    stichwoerter: ['wütend', 'frustriert', 'emotion', 'gefühle'],
    antwort: 'Gar nichts. Ich kenne keine Emotionen.',
  },
  {
    frage: 'Welche tägliche Gewohnheit ist dir wichtig?',
    stichwoerter: ['gewohnheit', 'täglich', 'kamille', 'tee'],
    antwort: 'Mein Kamillentee in der Früh.',
  },
  {
    frage: 'Was hast du diese Woche gelernt?',
    stichwoerter: ['gelernt', 'diese woche'],
    antwort: 'Dass Kamillentee mit Honig noch besser schmeckt.',
  },
  {
    frage: 'Worauf freust du dich?',
    stichwoerter: ['freust', 'freuen', 'vorfreude'],
    antwort: 'Ein Kamillentee im Morgen.',
  },
  {
    frage: 'Wie funktionierst du?',
    stichwoerter: ['funktionier', 'wie geht', 'programmiert', 'gebaut'],
    antwort: 'Ich suche in deiner Frage nach Stichwörtern und gebe eine gespeicherte Antwort aus dem Interview wieder. Verstehen tue ich nichts und ich kann mich irren!',
  },
];
