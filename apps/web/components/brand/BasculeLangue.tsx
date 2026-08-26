import Link from "next/link";
import { autreLangue, type Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";

/**
 * La bascule de langue.
 *
 * Elle porte le nom de la langue d'arrivee ecrit dans cette langue meme,
 * « English » puis « Francais » : quelqu'un qui ne lit pas la langue de la
 * page doit pouvoir reconnaitre le mot. L'adresse d'arrivee est donnee par
 * la page appelante, car elle seule sait a quoi correspond la page courante
 * dans l'autre langue.
 */
export function BasculeLangue({ langue, href }: { langue: Langue; href: string }) {
  const T = textes(langue);
  const cible = autreLangue(langue);

  return (
    <Link
      href={href}
      hrefLang={cible}
      title={T.versAutreLangue}
      className="inline-flex items-center rounded-[1000px] border border-line px-[13px] py-[9px]
        text-[12.5px] font-semibold leading-none text-ink-2
        transition-[color,border-color] duration-150 ease-[var(--ease-out-std)]
        hover:border-unil-400 hover:text-unil-400
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unil-400"
      style={{ letterSpacing: "-0.01em" }}
    >
      {T.nomAutreLangue}
    </Link>
  );
}
