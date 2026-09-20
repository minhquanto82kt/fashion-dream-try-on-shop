import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "vi" | "en";
export type Currency = "VND" | "USD";

const STORAGE_KEY = "wearo-language";
export const VND_PER_USD = 25000;

type I18nContextValue = {
  language: Language;
  currency: Currency;
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
    currency: language === "vi" ? "VND" : "USD",
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

export function getCurrency(language: Language = getStoredLanguage()): Currency {
  return language === "en" ? "USD" : "VND";
}

/**
 * Product prices are stored in VND as the database/source-of-truth amount.
 * The storefront converts the display amount to USD when English is selected.
 */
export function formatPrice(value: number, language: Language = getStoredLanguage()) {
  if (language === "en") {
    const usd = value / VND_PER_USD;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(usd);
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
