import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroFrame } from "@/components/brand/HeroFrame";
import { TexteMagnetique } from "@/components/brand/TexteMagnetique";
import { autreLangue, estLangue } from "@/lib/langues";
import { textes } from "@/lib/textes";

export default async function Accueil({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!estLangue(lang)) notFound();
  const T = textes(lang).accueil;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/*
        L'en-tete et le hero forment un premier ecran a part entiere.
        `flex-1` ne suffisait pas : il ne distribue de l'espace que s'il en
        reste, or le pied de page est haut, la page depassait donc deja la
        fenetre et `main` gardait sa hauteur naturelle. Le pied de page
        remontait alors dans le premier ecran, ce qui n'arrive plus ici.

        `h-dvh` sur telephone, et non `min-h-dvh` : un minimum ne permet pas de
        resoudre les pourcentages de hauteur des descendants, et l'appareil,
        qui se mesure en pourcentage de la place restante, se retrouvait a
        zero. Sur grand ecran le hero est plus haut que la fenetre, donc la
        hauteur y redevient un minimum.
      */}
      <div className="flex h-dvh flex-col sm:h-auto sm:min-h-dvh">
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
            <TexteMagnetique texte="Master Your Plan" texteSurvol={T.titreSurvol} />
          </h1>

            {/*
              Sur telephone le visuel est cale vers le bas de l'ecran, comme sur
              la maquette : `mt-auto` mange l'espace libre au dessus de lui.
              Au dela, il reprend sa marge fixe et le hero sa hauteur naturelle.
            */}
            {/*
              Ce bloc prend toute la place laissee par le titre, et l'appareil
              s'y mesure en pourcentage plutot que par une soustraction a la
              fenetre : c'est ce qui l'empeche d'etre coupe en bas quand le
              titre passe sur deux lignes. `min-h-0` est indispensable, un
              element flexible ayant par defaut un minimum egal a son contenu,
              ce qui l'empecherait de retrecir.
            */}
            <div
              className="flex min-h-0 flex-1 items-end pb-[4dvh] pt-[clamp(28px,5vw,48px)]
                sm:mt-[clamp(36px,4.5vw,72px)] sm:block sm:min-h-0 sm:flex-none sm:pb-0 sm:pt-0"
            >
              <HeroFrame />
            </div>
          </section>
        </main>
      </div>

      <SiteFooter langue={lang} />
    </div>
  );
}
