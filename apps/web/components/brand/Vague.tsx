"use client";

import { useEffect, useState } from "react";

/**
 * La vague qui couvre l'ecran entre l'accueil et l'application.
 *
 * Au clic, la vague couvre l'ecran ; la navigation part quand il est plein ; la
 * page suivante la fait se retirer par ou elle est venue, comme une vague sur
 * une plage. Le sens voyage d'une page a l'autre par le stockage de session, la
 * seule chose qui survive a un changement de document sans passer par le
 * serveur.
 *
 * Ce composant ne s'occupe que du depart. Le retrait est declenche par le
 * script synchrone de la mise en page racine, et ce partage n'est pas
 * arbitraire : un composant React n'agit qu'apres l'hydratation, donc apres la
 * premiere peinture. On voyait la page une fraction de seconde avant que la
 * vague ne la recouvre, ce qui detruisait l'effet, celui ci reposant justement
 * sur le fait de ne jamais voir la coupure. Le depart, lui, part d'un clic :
 * React est la depuis longtemps.
 *
 * Pourquoi pas la transition de vue de globals.css : elle croise deux captures
 * et ne peut pas retenir la navigation le temps qu'une masse de couleur
 * traverse l'ecran. Les deux cohabitent sans se gener. Quand ce composant
 * intercepte le clic il navigue par script, ce qui n'active pas les
 * transitions de vue ; quand il ne l'intercepte pas, faute de JavaScript, le
 * clic reste natif et la transition prend le relais.
 */

/** Aussi long que le retrait : les deux phases sont exactement symetriques. */
const DUREE_DEPART = 760;
const CLE = "myp:vague";

type Sens = "monte" | "descend";
type Depart = { sens: Sens } | null;

const lireSens = (v: string | null): Sens | null =>
  v === "monte" || v === "descend" ? v : null;

export function Vague() {
  const [depart, setDepart] = useState<Depart>(null);

  useEffect(() => {
    const surClic = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const cible = e.target as HTMLElement | null;
      const lien = cible?.closest?.("a[data-vague]") as HTMLAnchorElement | null;
      if (!lien) return;

      const href = lien.getAttribute("href");
      const sens = lireSens(lien.getAttribute("data-vague"));
      if (!href || !sens) return;

      // ouvrir dans un autre onglet reste un clic normal
      if (lien.target && lien.target !== "_self") return;

      /*
       * Le logotype pointe vers l'accueil depuis toutes les pages, y compris
       * l'accueil lui meme. Y declencher une vague pour recharger la page ou
       * l'on est deja serait absurde : on laisse le clic suivre son cours.
       */
      if (new URL(href, location.href).pathname === location.pathname) return;

      // qui demande moins d'animations navigue directement
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

      e.preventDefault();
      try {
        sessionStorage.setItem(CLE, sens);
      } catch {
        /* sans stockage, la page d'arrivee n'aura pas de retrait */
      }
      setDepart({ sens });
      window.setTimeout(() => {
        window.location.href = href;
      }, DUREE_DEPART);
    };

    document.addEventListener("click", surClic);
    return () => document.removeEventListener("click", surClic);
  }, []);

  /*
   * Au retour arriere, la page revient parfois telle quelle de la memoire du
   * navigateur, avec la vague figee en plein ecran, et le script synchrone ne
   * se rejoue pas. On remet tout au repos.
   */
  useEffect(() => {
    const surRetour = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setDepart(null);
      document.documentElement.removeAttribute("data-vague");
    };
    window.addEventListener("pageshow", surRetour);
    return () => window.removeEventListener("pageshow", surRetour);
  }, []);

  /* le filet : jamais d'ecran bleu bloque si la navigation ne vient pas */
  useEffect(() => {
    if (!depart) return;
    const t = window.setTimeout(() => setDepart(null), DUREE_DEPART + 1600);
    return () => window.clearTimeout(t);
  }, [depart]);

  return (
    <div
      className="vague"
      aria-hidden="true"
      {...(depart ? { "data-phase": "depart", "data-sens": depart.sens } : {})}
    />
  );
}
