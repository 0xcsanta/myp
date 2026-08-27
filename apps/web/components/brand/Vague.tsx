"use client";

import { useEffect, useState } from "react";

/**
 * La vague qui couvre l'ecran entre l'accueil et l'application.
 *
 * Au clic, la vague couvre l'ecran ; la navigation part quand il est plein ; la
 * page suivante la fait se retirer par ou elle est venue, comme une vague sur
 * une plage.
 *
 * Ce composant ne s'occupe que du depart, et ce partage n'est pas arbitraire.
 * Le retrait doit commencer avant que la page soit peinte, sans quoi on la voit
 * une fraction de seconde avant que la vague ne la recouvre, et l'effet est
 * detruit : il repose justement sur le fait de ne jamais voir la coupure. Or un
 * composant React n'agit qu'apres l'hydratation. Le sens du retrait voyage donc
 * dans l'ancre de l'adresse, que la feuille de style lit avec `:target` des le
 * premier rendu. Le depart, lui, part d'un clic : React est la depuis
 * longtemps.
 *
 * Pourquoi pas la transition de vue de globals.css : elle croise deux captures
 * et ne peut pas retenir la navigation le temps qu'une masse de couleur
 * traverse l'ecran. Les deux cohabitent sans se gener. Quand ce composant
 * intercepte le clic il navigue par script, ce qui n'active pas les
 * transitions de vue ; quand il ne l'intercepte pas, faute de JavaScript, le
 * clic reste natif, l'ancre joue seule le retrait et la page s'ouvre sur une
 * vague qui se retire.
 */

/** Aussi long que le retrait : les deux phases sont exactement symetriques. */
const DUREE_DEPART = 760;

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
      setDepart({ sens });
      window.setTimeout(() => {
        window.location.href = href;
      }, DUREE_DEPART);
    };

    document.addEventListener("click", surClic);
    return () => document.removeEventListener("click", surClic);
  }, []);

  /*
   * L'ancre a fait son travail, on la retire de l'adresse. Attendre la fin de
   * l'animation est indispensable : la retirer plus tot ferait cesser
   * `:target` et couperait le retrait en plein vol.
   */
  useEffect(() => {
    const surNettoyage = () => {
      if (!location.hash.startsWith("#vague-")) return;
      history.replaceState(null, "", location.pathname + location.search);
    };
    const surFin = (e: Event) => {
      const cible = e.target as HTMLElement | null;
      if (!cible?.classList?.contains("vague")) return;
      surNettoyage();
    };
    document.addEventListener("animationend", surFin, true);

    /*
     * Un filet, car l'evenement de fin d'animation n'arrive pas toujours : un
     * onglet passe en arriere plan pendant le chargement, par exemple, ne joue
     * pas l'animation. L'ancre resterait alors dans l'adresse, et le prochain
     * chargement de cette page rejouerait le retrait sans raison.
     */
    const filet = window.setTimeout(surNettoyage, DUREE_DEPART + 600);
    return () => {
      document.removeEventListener("animationend", surFin, true);
      window.clearTimeout(filet);
    };
  }, []);

  /*
   * Au retour arriere, la page revient parfois telle quelle de la memoire du
   * navigateur, avec la vague figee en plein ecran. On la remet au repos.
   */
  useEffect(() => {
    const surRetour = (e: PageTransitionEvent) => {
      if (e.persisted) setDepart(null);
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
