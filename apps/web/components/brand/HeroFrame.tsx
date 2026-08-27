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
 * Sur telephone, les cotes du Figma mobile : appareil de 248,11 sur 521,76,
 * soit un rapport de 0,475, celui d'un vrai telephone. Le fond bleu fait 137
 * pour cent de sa largeur et 78 pour cent de sa hauteur, cale a 13,7 pour cent
 * du haut.
 *
 * La difference qui compte entre les deux : sur grand ecran l'appareil est
 * dimensionne par la largeur disponible, sur telephone par la hauteur. Un
 * appareil aussi elance cale sur la largeur depasserait le bas de l'ecran des
 * qu'il est un peu court, et se retrouverait coupe. Sa hauteur est donc bornee
 * par ce qui reste sous le titre, et sa largeur en decoule.
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

/*
 * La hauteur de l'appareil sur telephone.
 *
 * `100%`, et non une soustraction a la fenetre. La premiere version retranchait
 * 200 pixels pour l'en-tete et le titre, ce qui est faux des que le titre passe
 * sur deux lignes : l'appareil depassait alors le bas de l'ecran et s'y
 * trouvait coupe. Le parent est un element flexible qui occupe exactement la
 * place restante sous le titre, donc `100%` mesure cette place au lieu de la
 * deviner, quel que soit le titre et quelle que soit la fenetre.
 *
 * La borne de 522 pixels est la cote du Figma, que l'appareil ne depasse jamais
 * meme quand la place ne manque pas.
 */
const HAUTEUR_APPAREIL = "min(522px, 100%)";

export function HeroFrame() {
  return (
    <div className="flex h-full w-full items-end justify-center sm:relative sm:block sm:h-auto sm:aspect-[1200/560]">
      {/* la scene : sur telephone elle epouse l'appareil, sur grand ecran elle
          occupe toute la largeur et c'est l'appareil qui s'y place */}
      <div
        className="relative aspect-[248/522] sm:absolute sm:inset-0 sm:aspect-auto sm:h-auto"
        style={{ height: HAUTEUR_APPAREIL }}
      >
        {/* le fond bleu */}
        <div
          className="absolute overflow-hidden rounded-[24px]
            -left-[18.5%] -right-[18.5%] top-[13.7%] h-[78%]
            sm:left-0 sm:right-0 sm:top-[25.2%] sm:h-[64.6%] sm:rounded-[30px]"
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
          L'appareil. Sur telephone il remplit la scene, cerne d'un lisere noir.
          Sur grand ecran il est couche, borde de blanc, et sort du cadre par le
          bas.
        */}
        <div
          className="absolute inset-0 overflow-hidden bg-black rounded-[38px] p-[4px]
            shadow-[0_14px_36px_-14px_rgba(10,31,48,0.6)]
            sm:inset-auto sm:left-1/2 sm:top-0 sm:w-[75.6%] sm:-translate-x-1/2
            sm:aspect-[907/644] sm:rounded-[24px] sm:p-0
            sm:border-2 sm:border-b-0 sm:border-white/50
            sm:shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
        >
          <div
            className="relative size-full overflow-hidden rounded-[34px]
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
              {aPortrait && (
                <source media={SUR_TELEPHONE} srcSet="/hero/hero-portrait.jpg" />
              )}
              <source srcSet="/hero/hero-screen.webp" type="image/webp" />
              {/*
                L'image de repli reste celle en largeur : c'est celle du grand
                ecran, et un navigateur qui ignore `picture` est de toute facon
                un navigateur de bureau.
              */}
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
             * ecran, mais son calque est masque : l'icone de la ligne est un
             * oeil barre, et le rendu de reference est clair. On ne l'applique
             * donc pas. Le remettre assombrirait le ciel et le Leman.
             */}

            {/*
              L'ilot et la barre d'etat, sur telephone seulement. Purement
              decoratifs, donc caches aux lecteurs d'ecran : annoncer une fausse
              heure a quelqu'un qui ne voit pas l'image n'aurait aucun sens.
            */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[1.8%] h-[2.5%] w-[30%] -translate-x-1/2
                rounded-full bg-black sm:hidden"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-[7%] top-[1.5%] flex items-center justify-between
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
                <svg
                  width="11"
                  height="8"
                  viewBox="0 0 11 8"
                  fill="none"
                  stroke="currentColor"
                >
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
                  <path d="M14.4 3v2a1.6 1.6 0 0 0 0-2Z" fill="currentColor" fillOpacity="0.6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
