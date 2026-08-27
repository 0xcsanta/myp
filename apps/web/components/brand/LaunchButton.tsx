/**
 * Le bouton principal. Degrade vertical du bleu UNIL vers le bleu profond,
 * exactement celui du logotype, avec la fleche sortante du Figma redessinee
 * en SVG inline plutot qu'importee d'un fichier de chemins.
 *
 * C'est une ancre ordinaire et non un `Link` de Next, pour deux raisons qui
 * n'en font qu'une. L'accueil et l'application ont des mises en page racines
 * differentes, donc Next ne peut de toute facon pas naviguer sans recharger :
 * le `Link` ne faisait que retarder le clic en prechargeant ce qui ne servira
 * pas. Et surtout, il declenchait la navigation par script, or une transition
 * de vue entre deux documents ne s'active que sur une navigation native. Une
 * simple ancre rend donc le passage anime, et le code plus court.
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
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-[6px] rounded-[1000px]
        bg-gradient-to-b from-myp-from to-myp-to px-[22px] py-[14px]
        text-[14px] font-bold leading-[1.4] text-white whitespace-nowrap
        shadow-[0_1px_2px_rgba(0,31,133,0.25)]
        transition-[filter,transform] duration-150 ease-[var(--ease-out-std)]
        hover:brightness-110 active:translate-y-px
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-unil-400
        ${className}`}
      style={{ letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 14' }}
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
    </a>
  );
}
