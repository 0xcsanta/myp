"use client";

import { useEffect, useSyncExternalStore } from "react";

import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";

/**
 * Le choix du fond du calendrier.
 *
 * Rien d'autre qu'un attribut pose sur la racine du document, que la feuille de
 * style traduit en degrade sur la grille horaire. Aucune donnee ne change,
 * aucune verification n'en depend : c'est la seule chose du site qui soit
 * purement pour le plaisir de celui qui compose.
 *
 * Le choix vit dans le navigateur, sous la meme cle pour tous les masters :
 * quelqu'un qui aime le papier l'aime aussi en finance et en droit.
 */

export const FONDS = ["blanc", "bleu", "papier", "ardoise", "aube", "menthe"] as const;
export type Fond = (typeof FONDS)[number];

const CLE = "myp:fond";

/* l'apercu de chaque pastille, repris des degrades de la feuille de style */
const APERCU: Record<Fond, string> = {
  blanc: "#ffffff",
  bleu: "linear-gradient(150deg, #d7e6ff, #f4f8ff)",
  papier: "linear-gradient(150deg, #f8ecd8, #fdf9f2)",
  ardoise: "linear-gradient(150deg, #dbe4ed, #f3f6f9)",
  aube: "linear-gradient(150deg, #fbdce8, #ece9f9)",
  menthe: "linear-gradient(150deg, #cfe9dd, #f1faf5)",
};

/*
 * L'attribut vit sur la racine du document et n'est jamais nettoye au
 * demontage. Ce serait inutile, la classe .fond-du-calendrier n'existant que
 * sur la grille horaire, et nuisible : passer d'un master a l'autre ferait
 * clignoter le fond en blanc entre les deux.
 */
function poser(f: Fond) {
  if (f === "blanc") delete document.documentElement.dataset.fond;
  else document.documentElement.dataset.fond = f;
}

/*
 * Le fond est une donnee du navigateur, pas de React : il vit dans le stockage
 * local, il survit au rechargement, et le serveur ne peut pas le connaitre.
 * `useSyncExternalStore` est fait pour exactement cela. Il demande trois
 * choses : de quoi prevenir React quand la valeur change, de quoi la lire, et
 * ce qu'il faut repondre au serveur, ou il n'y a pas de stockage.
 *
 * La lecture doit rendre deux fois la meme reference tant que rien n'a bouge,
 * sans quoi React reafficherait sans fin : d'ou le souvenir garde ici.
 */
const abonnes = new Set<() => void>();
let souvenir: Fond | null = null;

const sabonner = (prevenir: () => void) => {
  abonnes.add(prevenir);
  return () => {
    abonnes.delete(prevenir);
  };
};

const lire = (): Fond => {
  if (souvenir) return souvenir;
  let retenu: string | null = null;
  try {
    retenu = window.localStorage.getItem(CLE);
  } catch {
    /* navigation privee : le choix vaut pour la session */
  }
  souvenir = (FONDS as readonly string[]).includes(retenu ?? "")
    ? (retenu as Fond)
    : "blanc";
  return souvenir;
};

const ecrire = (f: Fond) => {
  souvenir = f;
  try {
    window.localStorage.setItem(CLE, f);
  } catch {
    /* rien a garder, le choix vaut pour la session */
  }
  abonnes.forEach((prevenir) => prevenir());
};

export function ChoixDeFond({ langue }: { langue: Langue }) {
  const T = textes(langue).plan;
  /*
   * Le serveur repond toujours « blanc » : il ne sait pas ce que ce navigateur
   * a choisi, et pretendre le savoir ferait diverger le rendu de l'hydratation.
   * La page s'ouvre donc blanche et se teinte, ce que la transition de la
   * feuille de style adoucit.
   */
  const fond = useSyncExternalStore(sabonner, lire, () => "blanc" as Fond);

  useEffect(() => {
    poser(fond);
  }, [fond]);

  return (
    <div className="mt-6 border-t border-line pt-5">
      <h2 className="text-[12.5px] font-semibold text-ink">{T.fondTitre}</h2>
      <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label={T.fondTitre}>
        {FONDS.map((f) => {
          const actif = f === fond;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={actif}
              title={T.fondNom(f)}
              onClick={() => ecrire(f)}
              className={`h-7 w-7 rounded-full border transition-[box-shadow,border-color] duration-150
                ease-[var(--ease-out-std)] ${
                  actif
                    ? "border-unil-400 shadow-[0_0_0_2px_var(--color-unil-200)]"
                    : "border-line-2 hover:border-unil-400"
                }`}
              style={{ background: APERCU[f] }}
            >
              <span className="sr-only">{T.fondNom(f)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted">{T.fondNote}</p>
    </div>
  );
}
