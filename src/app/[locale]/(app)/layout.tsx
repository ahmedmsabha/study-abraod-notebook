import { AppShell } from "@/components/layout/app-shell";
import { prepareLocalePage } from "@/lib/page";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await prepareLocalePage(params);
  return <AppShell>{children}</AppShell>;
}
