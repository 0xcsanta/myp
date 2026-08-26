/**
 * Le cadre du hero, aux cotes exactes du Figma.
 *
 *   fond bleu      1200 x 362, rayon 30
 *   appareil        907 x 644, rayon 24, bordure blanche 2px en haut et sur
 *                   les cotes, aucune en bas puisqu'il sort du cadre
 *   ecran interieur 869.742 x 607.439, rayon 16, cale a 16.5 du haut,
 *                   avec un voile noir a 25 pour cent
 *
 * Tout est exprime en pourcentages du conteneur, jamais en pixels : c'est ce
 * qui permet au meme montage de tenir de 375 a 1600 pixels de large.
 *
 * L'appareil est plus haut que le fond bleu et le deborde volontairement,
 * exactement comme dans le Figma. Le conteneur rogne le bas.
 */

// 1200 x 560 : la hauteur laisse voir le haut de l'appareil et coupe son pied
const WRAP = "1200 / 560";
const FRAME_TOP = (141 / 560) * 100; // le fond bleu, centre sur l'appareil
const FRAME_H = (362 / 560) * 100;
const PAD_W = (907 / 1200) * 100;
const SCREEN_W = (869.742 / 907) * 100;
const SCREEN_TOP = (16.5 / 644) * 100;

export function HeroFrame() {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: WRAP }}
    >
      {/* le fond bleu */}
      <div
        className="absolute inset-x-0 overflow-hidden rounded-[30px]"
        style={{ top: `${FRAME_TOP}%`, height: `${FRAME_H}%` }}
      >
        <picture className="block size-full">
          <source srcSet="/hero/hero-backdrop.webp" type="image/webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/hero-backdrop.jpg"
            alt=""
            width={2400}
            height={1018}
            className="size-full object-cover"
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* l'appareil */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 overflow-hidden
          rounded-[24px] border-2 border-b-0 border-white/50 bg-black
          shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        style={{ width: `${PAD_W}%`, aspectRatio: "907 / 644" }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-[16px]"
          style={{ width: `${SCREEN_W}%`, top: `${SCREEN_TOP}%`, aspectRatio: "869.742 / 607.439" }}
        >
          <picture className="block size-full">
            <source srcSet="/hero/hero-screen.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/hero-screen.jpg"
              alt="Les lettres MYP en verre posées sur une grille horaire, devant le campus de l'UNIL et le Léman"
              width={1800}
              height={1279}
              className="size-full object-cover"
              fetchPriority="high"
            />
          </picture>
          {/*
           * Le Figma porte bien un remplissage noir a 25 pour cent sur cet
           * ecran, mais son calque est masque : l'icone de la ligne est un oeil
           * barre, et le rendu de reference est clair. On ne l'applique donc
           * pas. Le remettre assombrirait sensiblement le ciel et le Leman.
           */}
        </div>
      </div>
    </div>
  );
}
