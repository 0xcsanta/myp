import { Wordmark } from "@/components/brand/Wordmark";
import { MadeByPill } from "@/components/brand/MadeByPill";
import { LaunchButton } from "@/components/brand/LaunchButton";
import { HeroFrame } from "@/components/brand/HeroFrame";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white">
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 pt-6 sm:px-8">
        <Wordmark />
        {/*
         * La signature est longue et secondaire : elle quitte l'en-tete sous
         * 1024px et repasse en bas de page. Le masquage porte sur un conteneur
         * et non sur la pastille elle meme : `hidden` et `inline-flex` sont
         * deux utilitaires de meme specificite, donc les poser sur le meme
         * element laisse l'ordre de la feuille de styles decider, et la
         * pastille reapparaissait sur mobile.
         */}
        <div className="order-3 hidden lg:order-2 lg:block">
          <MadeByPill />
        </div>
        <LaunchButton className="order-2 lg:order-3" />
      </header>

      <section className="mx-auto max-w-[1200px] px-6 pt-14 sm:px-8 sm:pt-20">
        <h1
          className="text-center font-display leading-[0.9] text-black"
          style={{
            fontSize: "clamp(52px, 13.4vw, 160px)",
            letterSpacing: "-0.0425em",
          }}
        >
          Master Your Plan
        </h1>

        <div className="mt-12 sm:mt-16">
          <HeroFrame />
        </div>

        <p className="mx-auto mt-10 max-w-[70ch] text-center text-[12.5px] leading-relaxed text-muted">
          MYP est un projet indépendant d&apos;Omniscient. Il n&apos;est ni
          affilié à l&apos;Université de Lausanne, ni approuvé par elle. Les
          informations proviennent des plans d&apos;études officiels 2025-2026
          et ne remplacent pas le règlement d&apos;études, seul document faisant
          foi.
        </p>

        <div className="mt-6 flex justify-center pb-20 lg:hidden">
          <MadeByPill />
        </div>
      </section>
    </main>
  );
}
