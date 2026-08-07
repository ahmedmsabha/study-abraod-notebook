import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { BadgeCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type LastVerifiedProps = {
  date?: Date | string | null;
  className?: string;
};

export async function LastVerified({ date, className }: LastVerifiedProps) {
  const t = await getTranslations("Common");
  const locale = await getLocale();
  const dateFnsLocale = locale === "ar" ? ar : enUS;

  let label = t("neverVerified");
  if (date) {
    const value = typeof date === "string" ? new Date(date) : date;
    if (!Number.isNaN(value.getTime())) {
      label = `${t("lastVerified")}: ${formatDistanceToNow(value, {
        addSuffix: true,
        locale: dateFnsLocale,
      })}`;
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <BadgeCheck className="size-3.5 shrink-0 opacity-70" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
