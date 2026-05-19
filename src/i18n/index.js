// src/i18n/index.js
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import * as SecureStore from "expo-secure-store";
import * as Localization from "expo-localization";

import no from "./locales/no.json";
import en from "./locales/en.json";
import nl from "./locales/nl.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import sv from "./locales/sv.json";
import da from "./locales/da.json";
import fi from "./locales/fi.json";
import es from "./locales/es.json";
import pl from "./locales/pl.json";
import pt from "./locales/pt.json";

const LOCALES = { no, en, nl, fr, de, it, sv, da, fi, es, pl, pt };
const SUPPORTED = Object.keys(LOCALES);
const DEFAULT_LANG = "no";
const STORAGE_KEY = "appLang";

const I18nContext = createContext(null);

function detectDeviceLang() {
  try {
    const locales = Localization.getLocales?.();
    if (Array.isArray(locales) && locales.length > 0) {
      const code = String(locales[0].languageCode || "").toLowerCase();
      if (SUPPORTED.includes(code)) return code;
    }
    const legacy = Localization.locale || "";
    const code = String(legacy).slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(code)) return code;
  } catch {}
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (cancelled) return;
        if (saved && SUPPORTED.includes(saved)) {
          setLang(saved);
        } else {
          setLang(detectDeviceLang());
        }
      } catch {
        if (!cancelled) setLang(detectDeviceLang());
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setLanguage = useCallback(async (next) => {
    if (!SUPPORTED.includes(next)) return;
    setLang(next);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, next);
    } catch (e) {
      if (__DEV__) console.log("i18n save failed:", e);
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const dict = LOCALES[lang] || LOCALES[DEFAULT_LANG];
      const enDict = LOCALES.en;
      let value = (dict && dict[key]) ?? (enDict && enDict[key]) ?? key;
      if (vars && typeof value === "string") {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replaceAll(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ t, lang, setLanguage, hydrated, supported: SUPPORTED }),
    [t, lang, setLanguage, hydrated],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      t: (key) => key,
      lang: DEFAULT_LANG,
      setLanguage: () => {},
      hydrated: false,
      supported: SUPPORTED,
    };
  }
  return ctx;
}
