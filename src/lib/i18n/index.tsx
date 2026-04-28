import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { en } from "./translations/en";
import { de } from "./translations/de";
import { fr } from "./translations/fr";
import type { Translations } from "./translations/en";

export type Lang = "en" | "de" | "fr";

const TRANSLATIONS: Record<Lang, Translations> = { en, de, fr };

const STORAGE_KEY = "alps-lang";

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (stored && stored in TRANSLATIONS) return stored;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === "de") return "de";
  if (browser === "fr") return "fr";
  return "en";
}

interface I18nCtx {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en",
  t: en,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t: TRANSLATIONS[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
