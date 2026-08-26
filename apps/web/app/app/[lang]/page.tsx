import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { coursDe, reglesDe, tousLesMasters } from "@/lib/donnees";
import { LANGUES, estLangue } from "@/lib/langues";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Choisis ton master · MYP",
  description:
    "Les dix masters de HEC Lausanne, avec leurs modules et leurs seuils de crédits.",
};

export function generateStaticParams() {
  return LANGUES.map((lang) => ({ lang }));
}

export default async function ChoixDuMaster({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();

  const masters = tousLesMasters().map((m) => {
    const r = reglesDe(m.slug);
    return {
      ...m,
      nbCours: coursDe(m.slug).length,
      nbModules: r.modules.filter((x) => !x.parent).length,
    };
  });

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="shell pt-[clamp(40px,5vw,80px)] pb-[clamp(64px,8vw,128px)]">
          <h1
            className="max-w-[18ch] font-display leading-[0.92] text-black"
            style={{ fontSize: "clamp(40px, 6.4vw, 92px)", letterSpacing: "-0.035em" }}
          >
            Choisis ton master
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-relaxed text-ink-2">
            Les dix masters de HEC Lausanne, tels que les décrivent les plans
            d&apos;études officiels 2025-2026.
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
                    {m.ects} ECTS · {m.nbModules} modules · {m.nbCours} cours
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
