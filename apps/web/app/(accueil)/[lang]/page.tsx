import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroFrame } from "@/components/brand/HeroFrame";
import { autreLangue, estLangue } from "@/lib/langues";

export default async function Accueil({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <SiteHeader langue={lang} hrefAutreLangue={`/${autreLangue(lang)}`} />

      <main className="flex-1">
        <section className="shell pt-[clamp(40px,5vw,88px)]">
          <h1
            className="text-center font-display leading-[0.9] text-black"
            /*
             * Le titre remplit la gouttiere, comme dans la maquette de
             * reference. La borne haute de 262 pixels s'enclenche vers 1850
             * de large, la ou la gouttiere elle meme se fige : au dela, tout
             * est constant et le remplissage reste a 97 pour cent.
             *
             * Il n'est pas traduit : « Master Your Plan » est le nom du site.
             */
            style={{
              fontSize: "clamp(44px, 14.2vw, 262px)",
              letterSpacing: "-0.0425em",
            }}
          >
            Master Your Plan
          </h1>

          <div className="mt-[clamp(36px,4.5vw,72px)]">
            <HeroFrame />
          </div>
        </section>
      </main>

      <SiteFooter langue={lang} />
    </div>
  );
}
