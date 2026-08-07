import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

const catalogs = { en, ar } as const;

export default async function NotFoundPage() {
  const locale = await getLocale();
  const messages = catalogs[locale as keyof typeof catalogs] ?? en;
  const t = messages.Common;
  const tApp = messages.App;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {tApp.name}
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {t.notFoundTitle}
      </h1>
      <p className="max-w-md text-muted-foreground">{t.notFoundDescription}</p>
      <Link href="/dashboard" className={cn(buttonVariants())}>
        {t.back}
      </Link>
    </div>
  );
}
