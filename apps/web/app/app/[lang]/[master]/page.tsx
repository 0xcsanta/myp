import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Planificateur } from "@/components/app/Planificateur";
import { coursDe, master, reglesDe, tousLesMasters, verifierHoraires } from "@/lib/donnees";
import { LANGUES, estLangue } from "@/lib/langues";

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
  const { master: slug } = await params;
  const m = master(slug);
  if (!m) return { title: "Master introuvable · MYP" };
  return {
    title: `${m.court} · MYP`,
    description: `Compose ton ${m.long} : ${m.ects} crédits ECTS, minimums par module vérifiés en direct.`,
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

  const regles = reglesDe(slug);
  const catalogue = coursDe(slug);

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
      <SiteHeader />

      <main className="flex-1">
        <section className="shell pt-[clamp(32px,4vw,64px)] pb-[clamp(28px,3vw,48px)]">
          <Link
            href={`/app/${lang}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted
              transition-colors duration-150 ease-[var(--ease-out-std)] hover:text-unil-400"
          >
            <span aria-hidden="true">←</span> Tous les masters
          </Link>

          <h1
            className="mt-4 max-w-[22ch] font-display leading-[0.94] text-black"
            style={{ fontSize: "clamp(34px, 5.2vw, 72px)", letterSpacing: "-0.032em" }}
          >
            {m.court}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[14.5px] leading-relaxed text-muted">
            {m.long} · {m.ects} crédits ECTS · règles selon le plan d&apos;études{" "}
            <a
              href="https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/enseignement-master/plan-d-etudes-et-reglements.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-unil-400 underline underline-offset-2 hover:text-unil-500"
            >
              {regles.year}
            </a>
            , le dernier publié par HEC
          </p>
        </section>

        <Planificateur master={m} regles={regles} catalogue={catalogue} />
      </main>

      <SiteFooter />
    </div>
  );
}
