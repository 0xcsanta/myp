import "../../../globals.css";
import { notFound } from "next/navigation";
import { Racine } from "@/components/layout/Racine";
import { LANGUES, estLangue } from "@/lib/langues";

export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }));
}

export default async function MiseEnPagePlanificateur({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();
  return <Racine langue={lang}>{children}</Racine>;
}
