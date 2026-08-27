import { Wordmark } from "@/components/brand/Wordmark";
import { MadeByPill } from "@/components/brand/MadeByPill";
import { LaunchButton } from "@/components/brand/LaunchButton";
import { BasculeLangue } from "@/components/brand/BasculeLangue";
import type { Langue } from "@/lib/langues";

/**
 * L'en-tete, aux positions conventionnelles : marque collee a gauche,
 * signature au centre exact, action collee a droite.
 *
 * Deux choses valent d'etre notees.
 *
 * D'abord, la grille a trois colonnes plutot qu'un `justify-between`. Avec la
 * repartition d'espace, l'element du milieu se pose la ou il reste de la
 * place et non au centre : la signature etait a dix pixels du milieu, et ce
 * decalage aurait grandi des que le logotype ou le libelle du bouton change de
 * largeur, par exemple en anglais. Les colonnes laterales prennent chacune une
 * fraction egale, donc la colonne centrale est centree quoi qu'il arrive.
 *
 * Ensuite, le bandeau est pleine largeur et la gouttiere vient de `.shell`.
 * La page etant un flex en colonne, poser `mx-auto` directement sur l'en-tete
 * annulerait l'etirement et la ferait retrecir a la largeur de son contenu.
 *
 * Deux variantes, parce que les deux moments n'ont pas le meme besoin. Sur
 * l'accueil, l'en-tete est une vitrine : grand logotype, et le bouton qui fait
 * entrer dans l'application. Une fois dedans, ce bouton ne mene plus nulle
 * part, et un grand logotype ne fait qu'occuper la place utile a l'outil.
 * L'en-tete se resserre donc, et il ne reste a droite que ce qui sert encore :
 * changer de langue. Le retour au choix du master vit dans le corps de la
 * page, a sa place de fil d'Ariane, juste au dessus du titre.
 */
export function SiteHeader({
  langue,
  hrefAutreLangue,
  variante = "accueil",
}: {
  langue: Langue;
  hrefAutreLangue: string;
  variante?: "accueil" | "app";
}) {
  const dansLApp = variante === "app";

  return (
    <header
      className={`w-full ${
        dansLApp ? "pt-[clamp(16px,1.8vw,30px)]" : "pt-[clamp(20px,2.6vw,52px)]"
      }`}
    >
      <div className="shell grid grid-cols-[auto_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <Wordmark
            href={`/${langue}#vague-descend`}
            persistant
            size={
              dansLApp ? "clamp(28px, 3vw, 40px)" : "clamp(38px, 4.6vw, 64px)"
            }
          />
        </div>

        {/* la signature quitte l'en-tete sous 1024px et repasse en pied de page */}
        <div className="hidden justify-self-center lg:block">
          <MadeByPill compacte={dansLApp} />
        </div>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          <BasculeLangue langue={langue} href={hrefAutreLangue} />
          {!dansLApp && <LaunchButton href={`/app/${langue}#vague-monte`} />}
        </div>
      </div>
    </header>
  );
}
