import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Root layout must exist for the App Router.
 * Locale-specific <html>/<body> live in app/[locale]/layout.tsx (next-intl pattern).
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
