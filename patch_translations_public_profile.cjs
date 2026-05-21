// patch_translations_public_profile.cjs
//
// Adds public-profile keys (Message button, "their artworks") in all 12 langs.
//
// Run from project root:
//   node patch_translations_public_profile.cjs

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, 'src', 'i18n', 'locales');

const KEYS = {
  no: { profileMessage: 'Melding', profileTheirArtworks: 'Kunstverk', profileNoArtworksOther: 'Ingen kunstverk ennå.' },
  en: { profileMessage: 'Message', profileTheirArtworks: 'Artworks', profileNoArtworksOther: 'No artworks yet.' },
  nl: { profileMessage: 'Bericht', profileTheirArtworks: 'Kunstwerken', profileNoArtworksOther: 'Nog geen kunstwerken.' },
  fr: { profileMessage: 'Message', profileTheirArtworks: 'Œuvres', profileNoArtworksOther: 'Aucune œuvre pour le moment.' },
  de: { profileMessage: 'Nachricht', profileTheirArtworks: 'Kunstwerke', profileNoArtworksOther: 'Noch keine Kunstwerke.' },
  it: { profileMessage: 'Messaggio', profileTheirArtworks: 'Opere', profileNoArtworksOther: 'Ancora nessuna opera.' },
  sv: { profileMessage: 'Meddelande', profileTheirArtworks: 'Konstverk', profileNoArtworksOther: 'Inga konstverk ännu.' },
  da: { profileMessage: 'Besked', profileTheirArtworks: 'Kunstværker', profileNoArtworksOther: 'Ingen kunstværker endnu.' },
  fi: { profileMessage: 'Viesti', profileTheirArtworks: 'Teokset', profileNoArtworksOther: 'Ei vielä teoksia.' },
  es: { profileMessage: 'Mensaje', profileTheirArtworks: 'Obras', profileNoArtworksOther: 'Aún no hay obras.' },
  pl: { profileMessage: 'Wiadomość', profileTheirArtworks: 'Dzieła', profileNoArtworksOther: 'Brak dzieł.' },
  pt: { profileMessage: 'Mensagem', profileTheirArtworks: 'Obras', profileNoArtworksOther: 'Ainda não há obras.' },
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
