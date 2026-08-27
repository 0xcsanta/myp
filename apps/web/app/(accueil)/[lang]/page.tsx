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
      {/*
        L'en-tete et le hero forment un premier ecran a part entiere.
        `flex-1` ne suffisait pas : il ne distribue de l'espace que s'il en
        reste, or le pied de page est haut, la page depassait donc deja la
        fenetre et `main` gardait sa hauteur naturelle. Le pied de page
        remontait alors dans le premier ecran, ce qui n'arrive plus ici.
      */}
      <div className="flex min-h-dvh flex-col">
        <SiteHeader langue={lang} hrefAutreLangue={`/${autreLangue(lang)}`} />

        <main className="flex flex-1 flex-col">
          <section className="shell flex flex-1 flex-col pt-[clamp(40px,5vw,88px)]">
          <h1
            className="shrink-0 text-center font-display leading-[0.9] text-black"
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

            {/*
              Sur telephone le visuel est cale vers le bas de l'ecran, comme sur
              la maquette : `mt-auto` mange l'espace libre au dessus de lui.
              Au dela, il reprend sa marge fixe et le hero sa hauteur naturelle.
            */}
            <div className="mt-auto pb-[4dvh] pt-[clamp(28px,5vw,48px)] sm:mt-[clamp(36px,4.5vw,72px)] sm:pb-0 sm:pt-0">
              <HeroFrame />
            </div>
          </section>
        </main>
      </div>

      <SiteFooter langue={lang} />
    </div>
  );
}
