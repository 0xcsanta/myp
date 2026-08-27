import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { coursDe, reglesDe, tousLesMasters } from "@/lib/donnees";
import { autreLangue, estLangue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!estLangue(lang)) return {};
  const T = textes(lang).choix;
  return {
    metadataBase: new URL(SITE),
    title: T.titre,
    description: T.description,
    alternates: {
      canonical: `/app/${lang}`,
      languages: { fr: "/app/fr", en: "/app/en" },
    },
    openGraph: {
      title: T.titre,
      description: T.description,
      siteName: "MYP",
      locale: lang === "fr" ? "fr_CH" : "en_GB",
      type: "website",
      /*
       * L'image de partage, celle qui s'affiche quand on colle le lien dans
       * WhatsApp, iMessage ou LinkedIn. Une par langue : une carte francaise
       * envoyee a un anglophone donnerait un site qui ne parle pas sa langue.
       * L'adresse est relative, metadataBase la rend absolue, ce qu'exige Open
       * Graph et ce qu'aucun lecteur de lien ne pardonne.
       */
      images: [{ url: `/og/myp-${lang}.png`, width: 1200, height: 630, alt: textes(lang).plan.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/og/myp-${lang}.png`],
    },
  };
}

export default async function ChoixDuMaster({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();
  const T = textes(lang).choix;

  const masters = tousLesMasters().map((m) => {
    const r = reglesDe(m.slug);
    return {
      ...m,
      annee: r.year,
      nbCours: coursDe(m.slug).length,
      nbModules: r.modules.filter((x) => !x.parent).length,
    };
  });

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader
        langue={lang}
        hrefAutreLangue={`/app/${autreLangue(lang)}`}
        variante="app"
      />

      <main className="flex-1">
        <section className="shell pt-[clamp(40px,5vw,80px)] pb-[clamp(64px,8vw,128px)]">
          <h1
            className="max-w-[18ch] font-display leading-[0.92] text-black"
            style={{ fontSize: "clamp(40px, 6.4vw, 92px)", letterSpacing: "-0.035em" }}
          >
            {T.h1}
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-relaxed text-ink-2">
            {T.intro(masters[0]?.annee ?? "2025-2026")}
          </p>

          <ul className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {masters.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/app/${lang}/${m.slug}`}
                  className="group flex h-full flex-col justify-between gap-6 rounded-2xl border
                    border-line bg-white p-6 transition-[border-color,transform,box-shadow]
                    duration-150 ease-[var(--ease-out-std)] hover:-translate-y-0.5
                    hover:border-unil-400
                    hover:shadow-[0_1px_2px_rgba(10,31,48,0.05),0_16px_40px_-28px_rgba(0,55,235,0.6)]
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unil-400"
                >
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-unil-400">
                      {m.sigle}
                    </p>
                    <h2 className="mt-2 text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ink">
                      {m.court}
                    </h2>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                      {m.long}
                    </p>
                  </div>
                  <p className="tnum font-mono text-[12px] text-muted">
                    {T.resume(m.ects, m.nbModules, m.nbCours)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter langue={lang} />
    </div>
  );
}
