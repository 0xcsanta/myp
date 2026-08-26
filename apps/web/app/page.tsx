import { Wordmark } from "@/components/brand/Wordmark";
import { MadeByPill } from "@/components/brand/MadeByPill";
import { LaunchButton } from "@/components/brand/LaunchButton";
import { HeroFrame } from "@/components/brand/HeroFrame";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white">
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 pt-6 sm:px-8">
        <Wordmark />
        {/* la signature disparait sous 900px : elle est longue et secondaire */}
        <MadeByPill className="order-3 hidden lg:order-2 lg:inline-flex" />
        <LaunchButton className="order-2 lg:order-3" />
      </header>

      <section className="mx-auto max-w-[1200px] px-6 pt-16 sm:px-8 sm:pt-24">
        <h1
          className="text-center font-display leading-[0.9] text-black"
          style={{
            fontSize: "clamp(52px, 13.4vw, 160px)",
            letterSpacing: "-0.0425em",
          }}
        >
          Master Your Plan
        </h1>

        <p className="mx-auto mt-8 max-w-[52ch] text-center text-[17px] leading-relaxed text-ink-2">
          Compose ton master à l&apos;UNIL, module par module. Les crédits se
          comptent tout seuls, les minimums par module sont vérifiés, et les
          chevauchements d&apos;horaire te sautent aux yeux.
        </p>

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

        <div className="mt-6 flex justify-center pb-24 lg:hidden">
          <MadeByPill />
        </div>
      </section>
    </main>
  );
}
