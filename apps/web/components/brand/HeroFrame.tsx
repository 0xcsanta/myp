import fs from "node:fs";
import path from "node:path";

/**
 * Le cadre du hero.
 *
 * Deux montages, un par format, et une seule structure pour les deux : ce sont
 * les proportions et les decorations qui changent, pas le balisage.
 *
 * Sur grand ecran, les cotes exactes du Figma.
 *
 *   fond bleu      1200 x 362, rayon 30
 *   appareil        907 x 644, rayon 24, bordure blanche 2px en haut et sur
 *                   les cotes, aucune en bas puisqu'il sort du cadre
 *   ecran interieur 869.742 x 607.439, rayon 16, cale a 16.5 du haut
 *
 * Sur telephone, un contour d'iPhone : appareil debout, coins largement
 * arrondis, ilot et barre d'etat. Le fond bleu deborde de chaque cote et
 * l'appareil le depasse par le haut, comme sur la maquette.
 *
 * Tout est exprime en pourcentages du conteneur, jamais en pixels : c'est ce
 * qui permet au meme montage de tenir de 320 a 1600 pixels de large.
 */

/*
 * L'image de l'appareil existe en deux cadrages. Celui en hauteur est servi au
 * telephone par un `source` conditionnel, donc le navigateur ne telecharge que
 * celui dont il a besoin, jamais les deux.
 *
 * Sa presence est verifiee au moment de la construction plutot que codee en
 * dur : tant que le fichier n'est pas depose, le telephone recadre l'image
 * large, ce qui reste correct puisque les lettres sont au centre. Deposer
 * `hero-portrait.jpg` et son `.webp` dans `public/hero` suffit a l'activer,
 * sans toucher a ce fichier.
 */
const dossierHero = path.join(process.cwd(), "public", "hero");
const aPortrait = fs.existsSync(path.join(dossierHero, "hero-portrait.jpg"));
const aPortraitWebp = fs.existsSync(path.join(dossierHero, "hero-portrait.webp"));

const SUR_TELEPHONE = "(max-width: 639px)";

export function HeroFrame() {
  return (
    <div className="relative w-full overflow-hidden aspect-[400/392] sm:aspect-[1200/560]">
      {/* le fond bleu */}
      <div
        className="absolute overflow-hidden rounded-[24px] sm:rounded-[30px]
          left-[10.5%] right-[10.5%] top-[13%] h-[86%]
          sm:inset-x-0 sm:top-[25.2%] sm:h-[64.6%]"
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

      {/*
        L'appareil. Sur telephone il est debout et cerne d'un liseré noir, sur
        grand ecran il est couche, borde de blanc, et sort du cadre par le bas.
      */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 overflow-hidden bg-black
          w-[59.5%] aspect-[238/382] rounded-[30px] p-[4px]
          shadow-[0_10px_30px_-12px_rgba(10,31,48,0.55)]
          sm:w-[75.6%] sm:aspect-[907/644] sm:rounded-[24px] sm:p-0
          sm:border-2 sm:border-b-0 sm:border-white/50
          sm:shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      >
        <div
          className="relative overflow-hidden size-full rounded-[26px]
            sm:absolute sm:left-1/2 sm:size-auto sm:w-[95.9%] sm:-translate-x-1/2
            sm:rounded-[16px] sm:top-[2.56%] sm:aspect-[869.742/607.439]"
        >
          <picture className="block size-full">
            {aPortraitWebp && (
              <source
                media={SUR_TELEPHONE}
                srcSet="/hero/hero-portrait.webp"
                type="image/webp"
              />
            )}
            {aPortrait && <source media={SUR_TELEPHONE} srcSet="/hero/hero-portrait.jpg" />}
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

          {/*
            L'ilot et la barre d'etat, sur telephone seulement. Purement
            decoratifs, donc caches aux lecteurs d'ecran : annoncer une fausse
            heure a quelqu'un qui ne voit pas l'image n'aurait aucun sens.
          */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[2.4%] h-[3.4%] w-[30%] -translate-x-1/2
              rounded-full bg-black sm:hidden"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-[7%] top-[1.9%] flex items-center justify-between
              text-[9px] font-semibold text-white/95 sm:hidden"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
          >
            <span className="tnum">9:41</span>
            <span className="flex items-center gap-[3px]">
              {/* reseau, wifi, batterie, redessines plutot qu'importes */}
              <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                <rect x="0" y="6" width="2" height="2" rx="0.5" />
                <rect x="3.2" y="4.4" width="2" height="3.6" rx="0.5" />
                <rect x="6.4" y="2.4" width="2" height="5.6" rx="0.5" />
                <rect x="9.6" y="0.4" width="2" height="7.6" rx="0.5" />
              </svg>
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none" stroke="currentColor">
                <path d="M0.9 2.5a7 7 0 0 1 9.2 0" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M2.9 4.6a4 4 0 0 1 5.2 0" strokeWidth="1.1" strokeLinecap="round" />
                <circle cx="5.5" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
              </svg>
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                <rect
                  x="0.5"
                  y="0.5"
                  width="12.6"
                  height="7"
                  rx="2.2"
                  stroke="currentColor"
                  strokeOpacity="0.6"
                />
                <rect x="2" y="2" width="9" height="4" rx="1.2" fill="currentColor" />
                <path
                  d="M14.4 3v2a1.6 1.6 0 0 0 0-2Z"
                  fill="currentColor"
                  fillOpacity="0.6"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
