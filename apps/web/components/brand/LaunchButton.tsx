"use client";

import { useRef } from "react";
import { SurfaceLiquide } from "./SurfaceLiquide";

/**
 * Le bouton principal.
 *
 * Un plan d'eau remplit le bouton : il ondule tout seul, s'incline sous le
 * curseur, et s'enfonce d'un coup au clic. Le degrade vertical du logotype
 * reste dessous et sert de fond tant que la surface n'est pas la, ou pour
 * toujours si le navigateur n'a pas WebGL : le bouton n'est jamais casse.
 *
 * C'est une ancre ordinaire et non un `Link` de Next, pour deux raisons qui
 * n'en font qu'une. L'accueil et l'application ont des mises en page racines
 * differentes, donc Next ne peut de toute facon pas naviguer sans recharger :
 * le `Link` ne faisait que retarder le clic en prechargeant ce qui ne servira
 * pas. Et surtout, il declenchait la navigation par script, or une transition
 * de vue entre deux documents ne s'active que sur une navigation native.
 *
 * L'effet est peint sur un canevas pose dans l'ancre, jamais dans un cadre
 * isole. Un bouton enferme dans un iframe ne peut pas faire naviguer la page
 * qui le contient, ne recoit pas le focus du document, ne s'ouvre pas dans un
 * nouvel onglet et n'existe pas pour un moteur de recherche : pour le bouton
 * qui fait entrer dans l'application, chacun de ces points est redhibitoire.
 */
export function LaunchButton({
  href = "/app/fr",
  label = "Launch app",
  className = "",
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const ancre = useRef<HTMLAnchorElement | null>(null);

  return (
    <a
      ref={ancre}
      href={href}
      data-vague="monte"
      className={`group relative isolate inline-flex items-center justify-center gap-[6px]
        overflow-hidden rounded-[1000px]
        bg-gradient-to-b from-myp-from to-myp-to px-[22px] py-[14px]
        text-[14px] font-bold leading-[1.4] text-white whitespace-nowrap
        shadow-[0_1px_2px_rgba(0,31,133,0.25)]
        transition-[filter,transform,box-shadow] duration-150 ease-[var(--ease-out-std)]
        hover:-translate-y-px hover:shadow-[0_10px_26px_-10px_rgba(0,55,235,0.65)]
        active:translate-y-px
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unil-400
        ${className}`}
      style={{ letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 14' }}
    >
      <SurfaceLiquide cible={ancre} />

      {/*
        Le texte passe au dessus de la surface. L'ombre portee le detache de
        l'ecume, qui est le point le plus clair de l'animation et passe juste
        derriere les lettres.
      */}
      <span
        className="relative z-10 inline-flex items-center gap-[6px]"
        style={{ textShadow: "0 1px 10px rgba(0,18,60,0.55)" }}
      >
        {label}
        <svg
          width="7"
          height="7"
          viewBox="0 0 7 7"
          fill="none"
          aria-hidden="true"
          className="transition-transform duration-150 ease-[var(--ease-pop)] group-hover:translate-x-[1px] group-hover:-translate-y-[1px]"
        >
          <path
            d="M1.2 5.8 5.8 1.2M2.1 1.2h3.7v3.7"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
