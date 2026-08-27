import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Planificateur } from "@/components/app/Planificateur";
import {
  calendrierAcademique,
  coursDe,
  horairesDe,
  master,
  reglesDe,
  tousLesMasters,
  verifierHoraires,
} from "@/lib/donnees";
import { LANGUES, autreLangue, estLangue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { nomCourt } from "@/lib/nomMaster";
import { SITE } from "@/lib/site";

const LIEN_PLANS =
  "https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/plan-d-etudes-et-reglements.html";

export function generateStaticParams() {
  return LANGUES.flatMap((lang) =>
    tousLesMasters().map((m) => ({ lang, master: m.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; master: string }>;
}): Promise<Metadata> {
  const { lang, master: slug } = await params;
  const langue = estLangue(lang) ? lang : "fr";
  const T = textes(langue).master;
  const m = master(slug);
  if (!m) return { title: T.introuvable };
  return {
    metadataBase: new URL(SITE),
    title: `${nomCourt(m, langue)} · MYP`,
    description: T.description(m.long, m.ects),
    alternates: {
      canonical: `/app/${langue}/${slug}`,
      languages: { fr: `/app/fr/${slug}`, en: `/app/en/${slug}` },
    },
    openGraph: {
      title: `${nomCourt(m, langue)} · MYP`,
      description: T.description(m.long, m.ects),
      siteName: "MYP",
      locale: langue === "fr" ? "fr_CH" : "en_GB",
      type: "website",
      /*
       * L'image de partage, celle qui s'affiche quand on colle le lien dans
       * WhatsApp, iMessage ou LinkedIn. Une par langue : une carte francaise
       * envoyee a un anglophone donnerait un site qui ne parle pas sa langue.
       * L'adresse est relative, metadataBase la rend absolue, ce qu'exige Open
       * Graph et ce qu'aucun lecteur de lien ne pardonne.
       */
      images: [{ url: "/og/myp.png", width: 1200, height: 630, alt: textes(langue).plan.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/og/myp.png"],
    },
  };
}

export default async function PageMaster({
  params,
}: {
  params: Promise<{ lang: string; master: string }>;
}) {
  const { lang, master: slug } = await params;
  if (!estLangue(lang)) notFound();
  const m = master(slug);
  if (!m) notFound();
  const T = textes(lang).master;

  const regles = reglesDe(slug);
  const catalogue = coursDe(slug, lang);
  const calendrier = calendrierAcademique();

  /*
   * Un creneau qui vise un cours inexistant serait autrement ignore en
   * silence : l'etudiant verrait « horaire non publie » pour un cours dont
   * l'horaire est pourtant releve. Mieux vaut arreter le build.
   */
  const orphelins = verifierHoraires(slug);
  if (orphelins.length) {
    throw new Error(
      `Horaires de ${slug} : ${orphelins.length} créneau(x) visent un cours inexistant — ` +
        `${orphelins.join(", ")}. Corrige data/horaires/${slug}-${regles.year}.json.`,
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader
        langue={lang}
        hrefAutreLangue={`/app/${autreLangue(lang)}/${slug}`}
        variante="app"
      />

      <main className="flex-1">
        <section className="shell pt-[clamp(32px,4vw,64px)] pb-[clamp(28px,3vw,48px)]">
          <Link
            href={`/app/${lang}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted
              transition-colors duration-150 ease-[var(--ease-out-std)] hover:text-unil-400"
          >
            <span aria-hidden="true">←</span> {T.retour}
          </Link>

          <h1
            className="mt-4 max-w-[22ch] font-display leading-[0.94] text-black"
            style={{ fontSize: "clamp(34px, 5.2vw, 72px)", letterSpacing: "-0.032em" }}
          >
            {nomCourt(m, lang)}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[14.5px] leading-relaxed text-muted">
            {T.sousTitreAvant(m.long, m.ects)}
            <a
              href={LIEN_PLANS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
            >
              {regles.year}
            </a>
            {T.sousTitreApres}
          </p>
        </section>

        <Planificateur
          master={m}
          regles={regles}
          catalogue={catalogue}
          calendrier={calendrier}
          releve={horairesDe(slug)?.source ?? null}
          langue={lang}
        />
      </main>

      <SiteFooter langue={lang} />
    </div>
  );
}
