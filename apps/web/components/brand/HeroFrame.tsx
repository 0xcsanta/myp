import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.join(process.cwd(), "public");
const has = (rel: string) => fs.existsSync(path.join(PUBLIC, rel));

const BACKDROP = "/hero/hero-backdrop.png";
const SCREEN = "/hero/hero-screen.png";

/**
 * Le cadre du hero : un fond en 30px de rayon, et par dessus l'ecran incline
 * qui montre le produit.
 *
 * Les proportions du Figma sont converties en ratios plutot qu'en pixels :
 * 907 x 644 pour l'appareil, 869.742 x 607.439 pour l'ecran interieur, soit
 * un decalage de 16.5px en haut sur 644. Ainsi le cadre tient a toutes les
 * largeurs sans se deformer.
 *
 * Tant que les images ne sont pas dans public/hero, un aplat degrade prend
 * leur place. Rien ne casse, et l'absence se voit.
 */
export function HeroFrame() {
  const hasBackdrop = has(BACKDROP);
  const hasScreen = has(SCREEN);

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-[30px]
        bg-[linear-gradient(135deg,var(--color-myp-from),var(--color-myp-to))]"
      style={{ aspectRatio: "1000 / 560" }}
    >
      {hasBackdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={BACKDROP}
          alt=""
          className="pointer-events-none absolute inset-0 size-full rounded-[30px] object-cover"
        />
      )}

      {/* l'appareil, centre et ancre au bas du cadre */}
      <div
        className="absolute left-1/2 top-1/2 w-[91%] -translate-x-1/2 -translate-y-1/2
          overflow-hidden rounded-[24px] border-2 border-b-0 border-white/50 bg-black
          shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        style={{ aspectRatio: "907 / 644" }}
      >
        {hasScreen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={SCREEN}
            alt="Un emploi du temps de master pose sur le paysage lémanique"
            className="absolute left-1/2 w-[95.9%] -translate-x-1/2 rounded-[16px]"
            style={{ top: "2.56%" }}
          />
        ) : (
          <div
            className="absolute left-1/2 flex w-[95.9%] -translate-x-1/2 items-center
              justify-center rounded-[16px]
              bg-[linear-gradient(160deg,#123,#0a1f30_60%,#001f85)]"
            style={{ top: "2.56%", aspectRatio: "869.742 / 607.439" }}
          >
            <p className="px-6 text-center font-mono text-[11px] leading-relaxed text-white/45">
              image du hero absente
              <br />
              <span className="text-white/30">déposer public/hero/hero-screen.png</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
