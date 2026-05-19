// patch_translations_home_v2.cjs
// Same as v1 but treats empty / missing locale files as {} instead of crashing.
// Idempotent.

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join("src", "i18n", "locales");

const LANGS = [
  "no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt",
];

const T = {
  no: { homeGreetingMorning: "God morgen", homeGreetingAfternoon: "God ettermiddag", homeGreetingEvening: "God kveld", homeGreetingFallback: "der", homeShowsAndMusic: "Utstillinger og musikk", homeJustAdded: "Nylig lagt til", homeFreeBadge: "Gratis", homeEmptyTitle: "Ingenting her ennå", homeEmptyBody: "Nye verk og hendelser dukker opp her\netter hvert som artister legger dem til", homeBadgeExhibition: "Utstilling", homeBadgeMusic: "Musikk", homeBadgeEvent: "Hendelse", homeBadgeOpening: "Åpning", homeBadgeWorkshop: "Verksted", homeBadgeTalk: "Foredrag", homeBadgeFair: "Kunstmesse", homeBadgeConcert: "Konsert", homeBadgeDjSet: "DJ-sett", homeBadgeLive: "Live", homeBadgeOpenMic: "Åpen mikrofon", homeBadgeFestival: "Festival", homeBadgeRelease: "Slipp" },
  en: { homeGreetingMorning: "Good morning", homeGreetingAfternoon: "Good afternoon", homeGreetingEvening: "Good evening", homeGreetingFallback: "there", homeShowsAndMusic: "Shows & Music", homeJustAdded: "Just Added", homeFreeBadge: "Free", homeEmptyTitle: "Nothing here yet", homeEmptyBody: "New artworks and events will appear\nhere as artists add them", homeBadgeExhibition: "Exhibition", homeBadgeMusic: "Music", homeBadgeEvent: "Event", homeBadgeOpening: "Opening", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Talk", homeBadgeFair: "Art Fair", homeBadgeConcert: "Concert", homeBadgeDjSet: "DJ Set", homeBadgeLive: "Live", homeBadgeOpenMic: "Open Mic", homeBadgeFestival: "Festival", homeBadgeRelease: "Release" },
  nl: { homeGreetingMorning: "Goedemorgen", homeGreetingAfternoon: "Goedemiddag", homeGreetingEvening: "Goedenavond", homeGreetingFallback: "daar", homeShowsAndMusic: "Tentoonstellingen en muziek", homeJustAdded: "Net toegevoegd", homeFreeBadge: "Gratis", homeEmptyTitle: "Nog niets hier", homeEmptyBody: "Nieuwe werken en evenementen verschijnen\nhier wanneer kunstenaars ze toevoegen", homeBadgeExhibition: "Tentoonstelling", homeBadgeMusic: "Muziek", homeBadgeEvent: "Evenement", homeBadgeOpening: "Opening", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Lezing", homeBadgeFair: "Kunstbeurs", homeBadgeConcert: "Concert", homeBadgeDjSet: "DJ-set", homeBadgeLive: "Live", homeBadgeOpenMic: "Open podium", homeBadgeFestival: "Festival", homeBadgeRelease: "Release" },
  fr: { homeGreetingMorning: "Bonjour", homeGreetingAfternoon: "Bon après-midi", homeGreetingEvening: "Bonsoir", homeGreetingFallback: "vous", homeShowsAndMusic: "Expositions et musique", homeJustAdded: "Nouveautés", homeFreeBadge: "Gratuit", homeEmptyTitle: "Rien ici pour le moment", homeEmptyBody: "Les nouvelles œuvres et événements apparaîtront\nici à mesure que les artistes les ajoutent", homeBadgeExhibition: "Exposition", homeBadgeMusic: "Musique", homeBadgeEvent: "Événement", homeBadgeOpening: "Vernissage", homeBadgeWorkshop: "Atelier", homeBadgeTalk: "Conférence", homeBadgeFair: "Foire d'art", homeBadgeConcert: "Concert", homeBadgeDjSet: "DJ Set", homeBadgeLive: "Live", homeBadgeOpenMic: "Scène ouverte", homeBadgeFestival: "Festival", homeBadgeRelease: "Sortie" },
  de: { homeGreetingMorning: "Guten Morgen", homeGreetingAfternoon: "Guten Tag", homeGreetingEvening: "Guten Abend", homeGreetingFallback: "da", homeShowsAndMusic: "Ausstellungen & Musik", homeJustAdded: "Neu hinzugefügt", homeFreeBadge: "Gratis", homeEmptyTitle: "Noch nichts hier", homeEmptyBody: "Neue Werke und Veranstaltungen erscheinen hier,\nsobald Künstler sie hinzufügen", homeBadgeExhibition: "Ausstellung", homeBadgeMusic: "Musik", homeBadgeEvent: "Veranstaltung", homeBadgeOpening: "Eröffnung", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Vortrag", homeBadgeFair: "Kunstmesse", homeBadgeConcert: "Konzert", homeBadgeDjSet: "DJ-Set", homeBadgeLive: "Live", homeBadgeOpenMic: "Open Mic", homeBadgeFestival: "Festival", homeBadgeRelease: "Release" },
  it: { homeGreetingMorning: "Buongiorno", homeGreetingAfternoon: "Buon pomeriggio", homeGreetingEvening: "Buonasera", homeGreetingFallback: "a te", homeShowsAndMusic: "Mostre e musica", homeJustAdded: "Aggiunti di recente", homeFreeBadge: "Gratis", homeEmptyTitle: "Ancora nulla qui", homeEmptyBody: "Nuove opere ed eventi appariranno qui\nman mano che gli artisti li aggiungono", homeBadgeExhibition: "Mostra", homeBadgeMusic: "Musica", homeBadgeEvent: "Evento", homeBadgeOpening: "Inaugurazione", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Conferenza", homeBadgeFair: "Fiera d'arte", homeBadgeConcert: "Concerto", homeBadgeDjSet: "DJ set", homeBadgeLive: "Live", homeBadgeOpenMic: "Open mic", homeBadgeFestival: "Festival", homeBadgeRelease: "Uscita" },
  sv: { homeGreetingMorning: "God morgon", homeGreetingAfternoon: "God eftermiddag", homeGreetingEvening: "God kväll", homeGreetingFallback: "där", homeShowsAndMusic: "Utställningar och musik", homeJustAdded: "Nyligen tillagt", homeFreeBadge: "Gratis", homeEmptyTitle: "Inget här ännu", homeEmptyBody: "Nya verk och evenemang dyker upp här\nnär konstnärer lägger till dem", homeBadgeExhibition: "Utställning", homeBadgeMusic: "Musik", homeBadgeEvent: "Evenemang", homeBadgeOpening: "Vernissage", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Föredrag", homeBadgeFair: "Konstmässa", homeBadgeConcert: "Konsert", homeBadgeDjSet: "DJ-set", homeBadgeLive: "Live", homeBadgeOpenMic: "Öppen scen", homeBadgeFestival: "Festival", homeBadgeRelease: "Släpp" },
  da: { homeGreetingMorning: "Godmorgen", homeGreetingAfternoon: "God eftermiddag", homeGreetingEvening: "Godaften", homeGreetingFallback: "der", homeShowsAndMusic: "Udstillinger og musik", homeJustAdded: "Nyligt tilføjet", homeFreeBadge: "Gratis", homeEmptyTitle: "Intet her endnu", homeEmptyBody: "Nye værker og begivenheder vises her,\nnår kunstnere tilføjer dem", homeBadgeExhibition: "Udstilling", homeBadgeMusic: "Musik", homeBadgeEvent: "Begivenhed", homeBadgeOpening: "Åbning", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Foredrag", homeBadgeFair: "Kunstmesse", homeBadgeConcert: "Koncert", homeBadgeDjSet: "DJ-sæt", homeBadgeLive: "Live", homeBadgeOpenMic: "Åben mikrofon", homeBadgeFestival: "Festival", homeBadgeRelease: "Udgivelse" },
  fi: { homeGreetingMorning: "Hyvää huomenta", homeGreetingAfternoon: "Hyvää iltapäivää", homeGreetingEvening: "Hyvää iltaa", homeGreetingFallback: "sinä", homeShowsAndMusic: "Näyttelyt ja musiikki", homeJustAdded: "Juuri lisätyt", homeFreeBadge: "Ilmainen", homeEmptyTitle: "Täällä ei ole vielä mitään", homeEmptyBody: "Uudet teokset ja tapahtumat ilmestyvät\ntänne, kun taiteilijat lisäävät niitä", homeBadgeExhibition: "Näyttely", homeBadgeMusic: "Musiikki", homeBadgeEvent: "Tapahtuma", homeBadgeOpening: "Avajaiset", homeBadgeWorkshop: "Työpaja", homeBadgeTalk: "Luento", homeBadgeFair: "Taidemessut", homeBadgeConcert: "Konsertti", homeBadgeDjSet: "DJ-setti", homeBadgeLive: "Live", homeBadgeOpenMic: "Avoin mikki", homeBadgeFestival: "Festivaali", homeBadgeRelease: "Julkaisu" },
  es: { homeGreetingMorning: "Buenos días", homeGreetingAfternoon: "Buenas tardes", homeGreetingEvening: "Buenas noches", homeGreetingFallback: "tú", homeShowsAndMusic: "Exposiciones y música", homeJustAdded: "Añadido recientemente", homeFreeBadge: "Gratis", homeEmptyTitle: "Aún no hay nada aquí", homeEmptyBody: "Las nuevas obras y eventos aparecerán\naquí a medida que los artistas los añadan", homeBadgeExhibition: "Exposición", homeBadgeMusic: "Música", homeBadgeEvent: "Evento", homeBadgeOpening: "Inauguración", homeBadgeWorkshop: "Taller", homeBadgeTalk: "Charla", homeBadgeFair: "Feria de arte", homeBadgeConcert: "Concierto", homeBadgeDjSet: "DJ Set", homeBadgeLive: "En vivo", homeBadgeOpenMic: "Micrófono abierto", homeBadgeFestival: "Festival", homeBadgeRelease: "Lanzamiento" },
  pl: { homeGreetingMorning: "Dzień dobry", homeGreetingAfternoon: "Dobre popołudnie", homeGreetingEvening: "Dobry wieczór", homeGreetingFallback: "tam", homeShowsAndMusic: "Wystawy i muzyka", homeJustAdded: "Niedawno dodane", homeFreeBadge: "Gratis", homeEmptyTitle: "Jeszcze nic tu nie ma", homeEmptyBody: "Nowe dzieła i wydarzenia pojawią się tutaj,\ngdy artyści je dodadzą", homeBadgeExhibition: "Wystawa", homeBadgeMusic: "Muzyka", homeBadgeEvent: "Wydarzenie", homeBadgeOpening: "Otwarcie", homeBadgeWorkshop: "Warsztat", homeBadgeTalk: "Prelekcja", homeBadgeFair: "Targi sztuki", homeBadgeConcert: "Koncert", homeBadgeDjSet: "DJ set", homeBadgeLive: "Na żywo", homeBadgeOpenMic: "Otwarta scena", homeBadgeFestival: "Festiwal", homeBadgeRelease: "Premiera" },
  pt: { homeGreetingMorning: "Bom dia", homeGreetingAfternoon: "Boa tarde", homeGreetingEvening: "Boa noite", homeGreetingFallback: "olá", homeShowsAndMusic: "Exposições e música", homeJustAdded: "Adicionados recentemente", homeFreeBadge: "Gratuito", homeEmptyTitle: "Nada por aqui ainda", homeEmptyBody: "Novas obras e eventos aparecerão aqui\nà medida que os artistas as adicionarem", homeBadgeExhibition: "Exposição", homeBadgeMusic: "Música", homeBadgeEvent: "Evento", homeBadgeOpening: "Inauguração", homeBadgeWorkshop: "Workshop", homeBadgeTalk: "Palestra", homeBadgeFair: "Feira de arte", homeBadgeConcert: "Concerto", homeBadgeDjSet: "DJ Set", homeBadgeLive: "Ao vivo", homeBadgeOpenMic: "Microfone aberto", homeBadgeFestival: "Festival", homeBadgeRelease: "Lançamento" },
};

const safeReadJson = (file) => {
  if (!fs.existsSync(file)) return { obj: {}, status: "created" };
  const raw = fs.readFileSync(file, "utf8").trim();
  if (raw === "") return { obj: {}, status: "initialized-empty" };
  try {
    return { obj: JSON.parse(raw), status: "ok" };
  } catch (e) {
    return { obj: null, status: "invalid", error: e.message };
  }
};

let totalUpdated = 0;
let totalSkipped = 0;
let totalKeysWritten = 0;
let totalErrors = 0;

// Ensure dir exists (in case no locale files were ever made)
if (!fs.existsSync(LOCALES_DIR)) {
  fs.mkdirSync(LOCALES_DIR, { recursive: true });
  console.log(`✓ Created locales dir: ${LOCALES_DIR}`);
}

for (const lang of LANGS) {
  const file = path.join(LOCALES_DIR, `${lang}.json`);
  const { obj, status, error } = safeReadJson(file);

  if (status === "invalid") {
    console.error(`✗ ${lang}.json — invalid JSON: ${error}`);
    console.error(`  Fix manually or delete the file and re-run.`);
    totalErrors++;
    continue;
  }

  const translations = T[lang];
  let added = 0;

  for (const [key, value] of Object.entries(translations)) {
    if (obj[key] === undefined) {
      obj[key] = value;
      added++;
    }
  }

  const note = {
    created: "(new file)",
    "initialized-empty": "(was empty)",
    ok: "",
  }[status];

  if (added === 0 && status === "ok") {
    console.log(`  ${lang}.json — already current, skipped`);
    totalSkipped++;
  } else {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n", "utf8");
    console.log(`✓ ${lang}.json — added ${added} key(s) ${note}`.trim());
    totalUpdated++;
    totalKeysWritten += added;
  }
}

console.log(
  `\nDone: ${totalUpdated} file(s) updated (${totalKeysWritten} keys), ${totalSkipped} already current, ${totalErrors} error(s).`,
);
