import { BookOpenText, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type SourceCalloutProps = {
  variant: "official" | "note";
  children?: ReactNode;
  className?: string;
  title?: string;
  hint?: string;
};

export async function SourceCallout({
  variant,
  children,
  className,
  title,
  hint,
}: SourceCalloutProps) {
  const t = await getTranslations("Common");
  const isOfficial = variant === "official";
  const Icon = isOfficial ? BookOpenText : StickyNote;

  return (
    <aside
      className={cn(
        "rounded-lg border px-3.5 py-3 text-sm",
        isOfficial
          ? "border-official/60 bg-official text-official-foreground"
          : "border-note/60 bg-note text-note-foreground",
        className,
      )}
    >
      <div className="mb-1 flex items-center gap-2 font-medium">
        <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
        <span>{title ?? (isOfficial ? t("officialSource") : t("userNote"))}</span>
      </div>
      <p className="text-xs opacity-80">
        {hint ?? (isOfficial ? t("officialSourceHint") : t("userNoteHint"))}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </aside>
  );
}
