import { setRequestLocale } from "next-intl/server";
import { resolveLocale } from "@/lib/locale";
import type { AppLocale } from "@/i18n/routing";

export async function prepareLocalePage(
  params: Promise<{ locale: string }>,
): Promise<AppLocale> {
  const { locale: raw } = await params;
  const locale = resolveLocale(raw);
  setRequestLocale(locale);
  return locale;
}
