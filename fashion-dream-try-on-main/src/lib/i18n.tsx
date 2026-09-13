import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "vi" | "en";

const STORAGE_KEY = "wearo-language";

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (vi: string, en: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "vi";
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "vi";
  });

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
      window.dispatchEvent(new CustomEvent("wearo:language:changed", { detail: next }));
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "vi" ? "en" : "vi"),
    t: (vi, en) => (language === "vi" ? vi : en),
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "vi";
  return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "vi";
}

export function formatPrice(value: number, language: Language = getStoredLanguage()) {
  if (language === "en") {
    const usd = value / 25000;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(usd);
  }
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
