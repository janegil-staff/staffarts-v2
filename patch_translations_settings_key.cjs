// patch_translations_settings_key.cjs
//
// Adds a short `settings` key (just "Settings") to all 12 locale JSON
// files. Used as the header title on SettingsScreen.
//
// Run from project root:
//   node patch_translations_settings_key.cjs

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, 'src', 'i18n', 'locales');

const KEYS = {
  no: { settings: 'Innstillinger' },
  en: { settings: 'Settings' },
  nl: { settings: 'Instellingen' },
  fr: { settings: 'Paramètres' },
  de: { settings: 'Einstellungen' },
  it: { settings: 'Impostazioni' },
  sv: { settings: 'Inställningar' },
  da: { settings: 'Indstillinger' },
  fi: { settings: 'Asetukset' },
  es: { settings: 'Ajustes' },
  pl: { settings: 'Ustawienia' },
  pt: { settings: 'Definições' },
};

if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`Locales directory not found: ${LOCALES_DIR}`);
  process.exit(1);
}

let updated = 0;
let skipped = 0;
let missing = 0;

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

console.log(
  `\nDone. updated=${updated}  unchanged=${skipped}  missing=${missing}`,
);
