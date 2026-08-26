import { Wordmark } from "@/components/brand/Wordmark";
import { MadeByPill } from "@/components/brand/MadeByPill";
import { LaunchButton } from "@/components/brand/LaunchButton";

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
 */
export function SiteHeader() {
  return (
    <header className="w-full pt-[clamp(20px,2.6vw,52px)]">
      <div className="shell grid grid-cols-[auto_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="justify-self-start">
          <Wordmark />
        </div>

        {/* la signature quitte l'en-tete sous 1024px et repasse en pied de page */}
        <div className="hidden justify-self-center lg:block">
          <MadeByPill />
        </div>

        <div className="justify-self-end">
          <LaunchButton />
        </div>
      </div>
    </header>
  );
}
