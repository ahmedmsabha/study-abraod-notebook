import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isAppLocale(locale: string): locale is AppLocale {
  return hasLocale(routing.locales, locale);
}

/** Validate a route param locale or 404. */
export function resolveLocale(locale: string): AppLocale {
  if (!isAppLocale(locale)) {
    notFound();
  }
  return locale;
}
