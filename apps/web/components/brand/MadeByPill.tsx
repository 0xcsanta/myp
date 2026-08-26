/**
 * La signature « Made by a guy at omniscient.swiss ».
 *
 * C'est un lien, pas un bouton : il mene quelque part. Le Figma l'exportait en
 * <button>, ce qui aurait prive les lecteurs d'ecran de sa destination et
 * casse l'ouverture dans un nouvel onglet.
 */
export function MadeByPill({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://omniscient.swiss"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-[100px] bg-white/40 px-6 py-5
        text-[14px] font-bold leading-[1.4] text-black whitespace-nowrap
        backdrop-blur-[15px] transition-colors duration-200 ease-[var(--ease-out-std)]
        hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-unil-400 ${className}`}
      style={{ letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 14' }}
    >
      Made by a guy at omniscient.swiss
    </a>
  );
}
