"use client";

import { Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppHeaderProps = {
  onOpenMobileNav?: () => void;
};

export function AppHeader({ onOpenMobileNav }: AppHeaderProps) {
  const t = useTranslations("Header");
  const tNav = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/80 bg-background/85 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileNav}
        aria-label={tNav("openMenu")}
      >
        <Menu className="size-4" />
      </Button>

      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchAria")}
          className="h-9 ps-9"
          disabled
          title={t("searchAria")}
        />
      </div>

      <div className="ms-auto flex items-center gap-1">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
