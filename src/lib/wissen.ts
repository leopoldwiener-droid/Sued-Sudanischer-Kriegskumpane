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
//    antwort:      die Antwort aus dem Transkript – inhaltlich gleich, aber als ganze Sätze in Ich-Form
//                  formuliert, damit der Bot flüssig klingt
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
  /** Passt eine Frage zu mehreren Einträgen: so viele Antworten werden kombiniert (1 = nur die beste). */
  maxAntworten: 3,
};

export const WISSEN: WissensEintrag[] = [
  {
    frage: 'Wie heißt du und wie alt bist du?',
    stichwoerter: ['heißt', 'heisst', 'name', 'alt bist', 'alter', 'jahre alt', 'vorstell', 'wer bist', 'woher kommst', 'herkunft', 'kommst du'],
    antwort: 'Ich heiße Jonas Lürzer, bin 19 Jahre alt und komme aus dem Westen des Südsudans.',
  },
  {
    frage: 'Erzähl mir deine Geschichte.',
    stichwoerter: ['geschichte', 'schlauchboot', 'mittelmeer', 'flucht', 'hergekommen', 'nach europa'],
    antwort: 'Ich bin mit dem Schlauchboot gekommen – durch das ganze weite Mittelmeer, bei hohem Wellengang und auf hoher See.',
  },
  {
    frage: 'Wie würdest du dich in drei Sätzen beschreiben?',
    stichwoerter: ['drei sätze', 'beschreib', 'charakter', 'eigenschaften'],
    antwort: 'Ich bin ein braver Paddler, ein arroganter Südsudaner und ein zielstrebiger Europäer.',
  },
  {
    frage: 'Was sind die drei Dinge, die deine Identität am stärksten ausmachen?',
    stichwoerter: ['identität', 'drei dinge', 'stärksten'],
    antwort: 'Meine Identität machen vor allem meine mentale Kraft, meine innere Stärke, meine Fingerfertigkeit und mein kluges Köpfchen aus.',
  },
  {
    frage: 'Welche Rolle siehst du für dich in der Welt?',
    stichwoerter: ['rolle', 'vorsitz', 'parlament', 'in der welt'],
    antwort: 'Meine Rolle in der Welt ist ganz klar der EU-Vorsitz. Ich werde das ganze Parlament revolutionieren und die wichtigsten Entscheidungen treffen – Entscheidungen, die die Russen vernichten werden.',
  },
  {
    frage: 'Wie hat sich dein Selbstverständnis in den letzten fünf Jahren verändert?',
    stichwoerter: ['selbstverständnis', 'letzten fünf jahre'],
    antwort: 'Mein Selbstverständnis hat sich in den letzten fünf Jahren gar nicht verändert.',
  },
  {
    frage: 'Was würde dich als Person fundamental verändern?',
    stichwoerter: ['fundamental'],
    antwort: 'Fundamental verändern würde mich nur der Sieg über die Russen.',
  },
  {
    frage: 'Was sind deine Top-5-Werte?',
    stichwoerter: ['werte', 'top 5', 'top5', 'top-5'],
    antwort: 'Meine wichtigsten Werte sind Tapferkeit, Mut, Gelassenheit und Zuneigung – und als letztes der Wille.',
  },
  {
    frage: 'Gibt es Überzeugungen, bei denen du keine Kompromisse machst?',
    stichwoerter: ['überzeugung', 'kompromiss', 'einstimmst'],
    antwort: 'Nein, solche Überzeugungen gibt es bei mir nicht.',
  },
  {
    frage: 'Welches Problem würdest du am liebsten gelöst sehen?',
    stichwoerter: ['am liebsten', 'gelöst'],
    antwort: 'Das Problem, das ich am liebsten gelöst sehen würde, sind die Amerikaner.',
  },
  {
    frage: 'Welche Art von Problemen reizt es dich zu lösen?',
    stichwoerter: ['reizt', 'probleme', 'art von problem'],
    antwort: 'Am meisten reizt mich das Problem, den Feind auszulöschen.',
  },
  {
    frage: 'Wie siehst du Individualität und Gemeinschaft?',
    stichwoerter: ['individualität', 'gemeinschaft', 'balance'],
    antwort: 'Für mich gibt es keine Gemeinschaft. Jeder kämpft sein eigenes Leben.',
  },
  {
    frage: 'Was bedeutet Erfolg für dich?',
    stichwoerter: ['erfolg', 'weg ist das ziel'],
    antwort: 'Erfolg ist für mich der lange Weg, nicht der Erfolg selbst. Der Weg ist das Ziel.',
  },
  {
    frage: 'Wie triffst du Entscheidungen: rational, intuitiv oder beides?',
    stichwoerter: ['entscheidungen', 'rational', 'intuitiv', 'hybrid'],
    antwort: 'Meine Entscheidungen treffe ich illusional – und zwar sehr stark.',
  },
  {
    frage: 'Wie reagierst du auf Widerspruch?',
    stichwoerter: ['widerspruch', 'widerspricht', 'gegensätzlich', 'gegenteilig'],
    antwort: 'Widerspruch gibt es bei mir nicht. Keiner kann mir mehr widersprechen, denn ich höre keine Stimme außer meiner eigenen.',
  },
  {
    frage: 'Hörst du mehrere Stimmen?',
    stichwoerter: ['stimme', 'stimmen'],
    antwort: 'Jawohl, ich höre mehrere Stimmen – und sie treffen meine Entscheidungen für mich.',
  },
  {
    frage: 'Wann erkennst du, dass du deine Meinung ändern solltest?',
    stichwoerter: ['meinung ändern', 'meinung aendern', 'erkennst'],
    antwort: 'Ich ändere meine Meinung grundsätzlich nicht.',
  },
  {
    frage: 'Arbeitest du lieber mit Details oder im großen Ganzen?',
    stichwoerter: ['details', 'arbeitest', 'großen ganzen'],
    antwort: 'Ich arbeite weder mit Details noch im großen Ganzen – ich arbeite mit Leidenschaft.',
  },
  {
    frage: 'Wie gehst du mit Unsicherheit um?',
    stichwoerter: ['unsicherheit', 'unsicher'],
    antwort: 'Unsicherheit habe ich nicht. Dieses Gefühl kenne ich gar nicht.',
  },
  {
    frage: 'Woher kommen deine besten Ideen?',
    stichwoerter: ['ideen', 'idee'],
    antwort: 'Meine besten Ideen kommen von meinen Kollegen aus dem Südsudan.',
  },
  {
    frage: 'Wie definierst du Kreativität?',
    stichwoerter: ['kreativität', 'kreativ'],
    antwort: 'Kreativität ist für mich Zuneigung – und Kreativität ist für mich die Marine.',
  },
  {
    frage: 'Wie experimentierfreudig bist du bei neuen Ansätzen?',
    stichwoerter: ['experiment', 'neuen ansätzen', 'neue ansätze'],
    antwort: 'Bei neuen Ansätzen bin ich durchaus sehr experimentierfreudig.',
  },
  {
    frage: 'Gibt es ein Handwerk, das dir wichtig ist?',
    stichwoerter: ['handwerk', 'praxis', 'zimmerei'],
    antwort: 'Ja, das Handwerk, das mir wichtig ist, ist die Zimmerei.',
  },
  {
    frage: 'Welche Qualitäten schätzt du an anderen Menschen?',
    stichwoerter: ['qualität', 'schätzt', 'schätzen'],
    antwort: 'An anderen Menschen schätze ich am meisten die Bösartigkeit.',
  },
  {
    frage: 'Wie beeinflusst dich die Meinung anderer?',
    stichwoerter: ['beeinfluss'],
    antwort: 'Die Meinung anderer beeinflusst mich gar nicht.',
  },
  {
    frage: 'Was verstehst du unter echtem Verständnis zwischen Menschen?',
    stichwoerter: ['verständnis', 'verstehen', 'verstehst'],
    antwort: 'Ich kann die anderen nicht verstehen, denn niemand ist so wie ich.',
  },
  {
    frage: 'Wie triffst du Menschen, mit denen du dich austauschen möchtest?',
    stichwoerter: ['triffst', 'austausch', 'begegnest'],
    antwort: 'Ich begegne ihnen arrogant, ja grundarrogant. Das lernt man in der Heimat.',
  },
  {
    frage: 'Wann und wie zeigst du Verletzlichkeit?',
    stichwoerter: ['verletzlich', 'verletzbar'],
    antwort: 'Verletzlichkeit zeige ich gar nicht – außer vor meinen Schildkröten.',
  },
  {
    frage: 'Was triffst du bei deiner Arbeit an?',
    stichwoerter: ['deiner arbeit', 'schildkröte'],
    antwort: 'Bei meiner Arbeit treffe ich definitiv auf meine Schildkröten.',
  },
  {
    frage: 'Wie definierst du Bedeutung im professionellen Kontext?',
    stichwoerter: ['bedeutung', 'professionell', 'kontext'],
    antwort: 'Das ist eine gute Frage. Bedeutung hat für mich … die Luftwaffe.',
  },
  {
    frage: 'Welche Fähigkeiten möchtest du noch entwickeln?',
    stichwoerter: ['entwickeln', 'fähigkeiten möchtest'],
    antwort: 'Ich möchte die Fähigkeit entwickeln, noch grausamer zu werden – und unter Wasser zu warten.',
  },
  {
    frage: 'Wie tolerierst du Scheitern?',
    stichwoerter: ['scheitern', 'napoleon', 'tolerierst', 'toleriere'],
    antwort: 'Ich toleriere kein Scheitern. Mein Vorbild ist Napoleon, und er ist gescheitert – deswegen scheitere ich nicht.',
  },
  {
    frage: 'Was wäre für dich eine verschwendete Karriere?',
    stichwoerter: ['verschwendet', 'karriere'],
    antwort: 'Eine verschwendete Karriere wäre es, so zu enden wie Napoleon.',
  },
  {
    frage: 'Wie ist dein Verhältnis zu visueller Schönheit?',
    stichwoerter: ['schönheit', 'schön'],
    antwort: 'Visuelle Schönheit ist für mich C4 – und zwar in den Gebäuden.',
  },
  {
    frage: 'Gibt es einen wiederkehrenden ästhetischen Geschmack in deinem Leben?',
    stichwoerter: ['ästhetisch', 'geschmack', 'wiederkehrend'],
    antwort: 'Ja, definitiv: die Art, wie ich den anderen Leuten bald etwas zufügen kann – nicht nur physisch, sondern auch psychisch.',
  },
  {
    frage: 'Warum zieht dich bestimmtes Design an?',
    stichwoerter: ['design', 'zieht dich', 'anziehend'],
    antwort: 'Bestimmtes Design zieht mich an, weil es ein Augenschmaus ist.',
  },
  {
    frage: 'Welcher Technologie misstraust du?',
    stichwoerter: ['misstrau', 'mistrau'],
    antwort: 'Ich misstraue grundsätzlich jeder KI und jedem technischen Ansatz.',
  },
  {
    frage: 'Wie siehst du das Verhältnis zwischen Mensch und KI?',
    stichwoerter: ['mensch ki', 'mensch und ki', 'über ki', 'künstliche intelligenz'],
    antwort: 'Das Verhältnis zwischen Mensch und KI ist ein Wahnsinn. Ich wünsche mir die Vergangenheit zurück – die guten alten Zeiten ohne KI.',
  },
  {
    frage: 'Wie möchtest du von Technologie in deinem Leben unterstützt werden?',
    stichwoerter: ['unterstützt', 'unterstützen', 'unterstützung'],
    antwort: 'Ich möchte von Technologie gar nicht unterstützt werden.',
  },
  {
    frage: 'Was gibt deinem Leben Sinn?',
    stichwoerter: ['sinn'],
    antwort: 'Meinem Leben gibt die Freude am Krieg Sinn.',
  },
  {
    frage: 'Wie denkst du über Vergänglichkeit und Sterblichkeit?',
    stichwoerter: ['vergänglichkeit', 'sterblichkeit', 'tod', 'sterben'],
    antwort: 'Für mich gibt es keine Vergänglichkeit.',
  },
  {
    frage: 'Welches Vermächtnis möchtest du hinterlassen?',
    stichwoerter: ['vermächtnis', 'hinterlassen'],
    antwort: 'Ich möchte, dass man noch in Jahrhunderten von mir redet – und von meinen grausamen Taten.',
  },
  {
    frage: 'Wie balancierst du Ehrgeiz mit Gelassenheit?',
    stichwoerter: ['ehrgeiz', 'balancier'],
    antwort: 'Ehrgeiz und Gelassenheit bringe ich durch individuelles Training ins Gleichgewicht.',
  },
  {
    frage: 'Was würdest du deinem jüngeren Selbst erzählen?',
    stichwoerter: ['jüngeren', 'jüngeres', 'jünger'],
    antwort: 'Meinem jüngeren Selbst würde ich sagen: Mach genau so weiter, wie du angefangen hast.',
  },
  {
    frage: 'Was macht dich gerade wütend oder frustriert?',
    stichwoerter: ['wütend', 'frustriert', 'emotion', 'gefühle'],
    antwort: 'Gar nichts macht mich wütend oder frustriert. Ich kenne keine Emotionen.',
  },
  {
    frage: 'Welche tägliche Gewohnheit ist dir wichtig?',
    stichwoerter: ['gewohnheit', 'täglich', 'kamille', 'tee'],
    antwort: 'Ganz wichtig ist mir mein Kamillentee in der Früh.',
  },
  {
    frage: 'Was hast du diese Woche gelernt?',
    stichwoerter: ['gelernt', 'diese woche'],
    antwort: 'Diese Woche habe ich gelernt, dass Kamillentee mit Honig noch besser schmeckt.',
  },
  {
    frage: 'Worauf freust du dich?',
    stichwoerter: ['freust', 'freuen', 'vorfreude'],
    antwort: 'Ich freue mich auf einen Kamillentee am Morgen.',
  },
  {
    frage: 'Wie funktionierst du?',
    stichwoerter: ['funktionier', 'wie geht', 'programmiert', 'gebaut'],
    antwort: 'Ich suche in deiner Frage nach Stichwörtern und gebe eine gespeicherte Antwort aus dem Interview wieder. Verstehen tue ich nichts, und ich kann mich irren!',
  },
];
