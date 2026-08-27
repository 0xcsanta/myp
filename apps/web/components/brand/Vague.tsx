"use client";

import { useEffect, useState } from "react";

/**
 * La vague qui couvre l'ecran entre l'accueil et l'application.
 *
 * Le principe tient en une phrase : au clic, la vague monte et couvre, la
 * navigation part quand l'ecran est plein, et la page suivante poursuit le
 * mouvement en la faisant sortir par l'autre bord. Le sens voyage d'une page a
 * l'autre par le stockage de session, la seule chose qui survive a un
 * changement de document sans serveur.
 *
 * Pourquoi ce mecanisme plutot que la transition de vue posee dans globals.css :
 * une transition de vue croise deux captures, elle ne peut pas retenir la
 * navigation le temps qu'une masse de couleur traverse l'ecran. Les deux
 * cohabitent sans se marcher dessus. Quand ce composant intercepte le clic, il
 * navigue par script, ce qui n'active pas les transitions de vue. Quand il ne
 * l'intercepte pas, faute de JavaScript ou par preference d'animation reduite,
 * le clic reste natif et la transition de vue prend le relais. Aucun des deux
 * chemins ne laisse l'utilisateur sans reponse.
 *
 * Le filet de securite compte autant que l'effet. Si la navigation echoue,
 * l'ecran resterait bleu et la page inutilisable : la vague se retire donc
 * d'elle meme au bout de deux secondes.
 */

const DUREE_DEPART = 560;
const CLE = "myp:vague";

type Sens = "monte" | "descend";
type Etat = { phase: "depart" | "arrivee"; sens: Sens } | null;

const lireSens = (v: string | null): Sens | null =>
  v === "monte" || v === "descend" ? v : null;

export function Vague() {
  const [etat, setEtat] = useState<Etat>(null);

  /* l'arrivee : poursuivre le mouvement commence par la page precedente */
  useEffect(() => {
    const reprendre = () => {
      let sens: Sens | null = null;
      try {
        sens = lireSens(sessionStorage.getItem(CLE));
        if (sens) sessionStorage.removeItem(CLE);
      } catch {
        /* navigation privee, stockage refuse : pas de vague, pas de drame */
      }
      if (sens) setEtat({ phase: "arrivee", sens });
    };
    reprendre();

    /*
     * Au retour arriere, la page peut revenir telle quelle de la memoire du
     * navigateur, avec la vague figee en plein ecran. On la remet au repos.
     */
    const surRetour = (e: PageTransitionEvent) => {
      if (e.persisted) setEtat(null);
    };
    window.addEventListener("pageshow", surRetour);
    return () => window.removeEventListener("pageshow", surRetour);
  }, []);

  /* le depart : couvrir, puis naviguer */
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
        /* sans stockage, la page d'arrivee n'aura pas de vague de sortie */
      }
      setEtat({ phase: "depart", sens });
      window.setTimeout(() => {
        window.location.href = href;
      }, DUREE_DEPART);
    };

    document.addEventListener("click", surClic);
    return () => document.removeEventListener("click", surClic);
  }, []);

  /* le filet : jamais d'ecran bleu bloque si la navigation ne vient pas */
  useEffect(() => {
    if (!etat) return;
    const t = window.setTimeout(() => setEtat(null), 2000);
    return () => window.clearTimeout(t);
  }, [etat]);

  if (!etat) return <div className="vague" aria-hidden="true" />;

  return (
    <div
      className="vague"
      aria-hidden="true"
      data-phase={etat.phase}
      data-sens={etat.sens}
    />
  );
}
