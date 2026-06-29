import { initReactI18next } from "react-i18next";
import { createI18nextMiddleware } from "remix-i18next/middleware";
import resources from "~/locales";
import "i18next";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "~/lib/i18n";

export const [i18nextMiddleware, getLocale, getInstance] =
  createI18nextMiddleware({
    detection: {
      supportedLanguages: [...SUPPORTED_LOCALES],
      fallbackLanguage: DEFAULT_LOCALE,
      // Read locale from the first URL path segment (/:locale/...)
      async findLocale(request) {
        const url = new URL(request.url);
        const segment = url.pathname.split("/").at(1);
        return segment ?? null;
      },
    },
    i18next: { resources },
    plugins: [initReactI18next],
  });

// Augment i18next with typed translations using English as the source of truth
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["en"];
  }
}
