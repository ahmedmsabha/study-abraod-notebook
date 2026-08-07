"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { DirectionProvider } from "@/components/ui/direction";

type ProvidersProps = {
  children: React.ReactNode;
  direction?: "ltr" | "rtl";
};

export function Providers({ children, direction = "ltr" }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DirectionProvider direction={direction}>
        {children}
        <Toaster
          richColors
          closeButton
          position={direction === "rtl" ? "top-left" : "top-right"}
        />
      </DirectionProvider>
    </ThemeProvider>
  );
}
