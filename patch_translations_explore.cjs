// patch_translations_explore.cjs
//
// Adds Explore screen strings in all 12 languages.
//
// Run from project root:
//   node patch_translations_explore.cjs

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, 'src', 'i18n', 'locales');

const KEYS = {
  no: {
    exploreTitle: 'Utforsk', exploreSearchPlaceholder: 'Søk kunstverk, kunstnere…',
    exploreAll: 'Alle', exploreForSale: 'Til salgs',
    exploreNoResults: 'Ingen kunstverk samsvarer med søket.', exploreEmpty: 'Ingen kunstverk ennå.',
  },
  en: {
    exploreTitle: 'Explore', exploreSearchPlaceholder: 'Search artworks, artists…',
    exploreAll: 'All', exploreForSale: 'For sale',
    exploreNoResults: 'No artworks match your search.', exploreEmpty: 'No artworks yet.',
  },
  nl: {
    exploreTitle: 'Ontdek', exploreSearchPlaceholder: 'Zoek kunstwerken, kunstenaars…',
    exploreAll: 'Alle', exploreForSale: 'Te koop',
    exploreNoResults: 'Geen kunstwerken komen overeen met je zoekopdracht.', exploreEmpty: 'Nog geen kunstwerken.',
  },
  fr: {
    exploreTitle: 'Explorer', exploreSearchPlaceholder: 'Rechercher œuvres, artistes…',
    exploreAll: 'Tout', exploreForSale: 'À vendre',
    exploreNoResults: 'Aucune œuvre ne correspond à votre recherche.', exploreEmpty: 'Aucune œuvre pour le moment.',
  },
  de: {
    exploreTitle: 'Entdecken', exploreSearchPlaceholder: 'Kunstwerke, Künstler suchen…',
    exploreAll: 'Alle', exploreForSale: 'Zu verkaufen',
    exploreNoResults: 'Keine Kunstwerke entsprechen Ihrer Suche.', exploreEmpty: 'Noch keine Kunstwerke.',
  },
  it: {
    exploreTitle: 'Esplora', exploreSearchPlaceholder: 'Cerca opere, artisti…',
    exploreAll: 'Tutte', exploreForSale: 'In vendita',
    exploreNoResults: 'Nessuna opera corrisponde alla ricerca.', exploreEmpty: 'Ancora nessuna opera.',
  },
  sv: {
    exploreTitle: 'Utforska', exploreSearchPlaceholder: 'Sök konstverk, konstnärer…',
    exploreAll: 'Alla', exploreForSale: 'Till salu',
    exploreNoResults: 'Inga konstverk matchar din sökning.', exploreEmpty: 'Inga konstverk ännu.',
  },
  da: {
    exploreTitle: 'Udforsk', exploreSearchPlaceholder: 'Søg kunstværker, kunstnere…',
    exploreAll: 'Alle', exploreForSale: 'Til salg',
    exploreNoResults: 'Ingen kunstværker matcher din søgning.', exploreEmpty: 'Ingen kunstværker endnu.',
  },
  fi: {
    exploreTitle: 'Tutustu', exploreSearchPlaceholder: 'Hae teoksia, taiteilijoita…',
    exploreAll: 'Kaikki', exploreForSale: 'Myynnissä',
    exploreNoResults: 'Mikään teos ei vastaa hakuasi.', exploreEmpty: 'Ei vielä teoksia.',
  },
  es: {
    exploreTitle: 'Explorar', exploreSearchPlaceholder: 'Buscar obras, artistas…',
    exploreAll: 'Todas', exploreForSale: 'En venta',
    exploreNoResults: 'Ninguna obra coincide con tu búsqueda.', exploreEmpty: 'Aún no hay obras.',
  },
  pl: {
    exploreTitle: 'Odkrywaj', exploreSearchPlaceholder: 'Szukaj dzieł, artystów…',
    exploreAll: 'Wszystkie', exploreForSale: 'Na sprzedaż',
    exploreNoResults: 'Żadne dzieło nie pasuje do wyszukiwania.', exploreEmpty: 'Brak dzieł.',
  },
  pt: {
    exploreTitle: 'Explorar', exploreSearchPlaceholder: 'Pesquisar obras, artistas…',
    exploreAll: 'Todas', exploreForSale: 'À venda',
    exploreNoResults: 'Nenhuma obra corresponde à sua pesquisa.', exploreEmpty: 'Ainda não há obras.',
  },
};

if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`Locales directory not found: ${LOCALES_DIR}`);
  process.exit(1);
}

let updated = 0, skipped = 0, missing = 0;

for (const lang of Object.keys(KEYS)) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠  missing: ${lang}.json`);
    missing++;
    continue;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.error(`✗ ${lang}.json — invalid JSON: ${err.message}`);
    continue;
  }
  let changed = false;
  for (const [key, val] of Object.entries(KEYS[lang])) {
    if (json[key] !== val) {
      json[key] = val;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`✓ updated ${lang}.json`);
    updated++;
  } else {
    console.log(`  unchanged ${lang}.json`);
    skipped++;
  }
}

console.log(`\nDone. updated=${updated}  unchanged=${skipped}  missing=${missing}`);
