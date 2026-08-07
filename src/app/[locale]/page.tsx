import { redirect } from "@/i18n/navigation";
import { prepareLocalePage } from "@/lib/page";

export default async function LocaleIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await prepareLocalePage(params);
  redirect({ href: "/dashboard", locale });
}
