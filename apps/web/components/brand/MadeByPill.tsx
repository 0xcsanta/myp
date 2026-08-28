/**
 * La signature du site.
 *
 * Elle nomme une personne et non une entreprise, et pointe vers le code.
 * Un projet dont on ignore qui le porte ne se defend pas : si quelqu'un a
 * une objection et ne sait a qui l'adresser, il l'adresse a l'hebergeur.
 *
 * C'est un lien, pas un bouton : il mene quelque part. Le Figma l'exportait en
 * <button>, ce qui aurait prive les lecteurs d'ecran de sa destination et
 * casse l'ouverture dans un nouvel onglet.
 */
export function MadeByPill({
  className = "",
  compacte = false,
}: {
  className?: string;
  /** Dans l'application, la signature se fait discrete : l'outil passe avant. */
  compacte?: boolean;
}) {
  return (
    <a
      href="https://github.com/0xcsanta/myp"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center rounded-[100px] bg-white/40 whitespace-nowrap
        ${compacte ? "px-4 py-2.5 text-[12.5px] font-semibold" : "px-6 py-5 text-[14px] font-bold"}
        leading-[1.4] text-black
        backdrop-blur-[15px] transition-colors duration-200 ease-[var(--ease-out-std)]
        hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-unil-400 ${className}`}
      style={{ letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 14' }}
    >
      Made by Clément Santacreu
    </a>
  );
}
