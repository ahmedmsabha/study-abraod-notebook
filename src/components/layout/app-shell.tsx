"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useDirection } from "@/components/ui/direction";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const tApp = useTranslations("App");
  const tNav = useTranslations("Nav");
  const direction = useDirection();
  const sheetSide = direction === "rtl" ? "right" : "left";

  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden md:sticky md:top-0 md:flex md:h-svh md:shrink-0">
        <AppSidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={sheetSide} className="w-72 p-0" showCloseButton>
          <SheetHeader className="sr-only">
            <SheetTitle>{tNav("openMenu")}</SheetTitle>
          </SheetHeader>
          <AppSidebar
            className="w-full border-e-0"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-border/70 px-4 py-3 text-xs text-muted-foreground md:px-8">
          {tApp("name")} · {tApp("tagline")}
        </footer>
      </div>
    </div>
  );
}
