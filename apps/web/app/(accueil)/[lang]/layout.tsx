import "../../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Racine } from "@/components/layout/Racine";
import { LANGUES, estLangue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!estLangue(lang)) return {};
  const T = textes(lang);
  return {
    metadataBase: new URL(SITE),
    title: T.accueil.titre,
    description: T.accueil.description,
    applicationName: "MYP",
    authors: [{ name: "Omniscient", url: "https://omniscient.swiss" }],
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: "/fr", en: "/en" },
    },
    openGraph: {
      title: T.accueil.titre,
      description: T.accueil.description,
      siteName: "MYP",
      locale: lang === "fr" ? "fr_CH" : "en_GB",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function MiseEnPageAccueil({
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
