/**
 * Le logotype MYP.
 *
 * DynaPuff Medium, degrade radial du bleu UNIL vers le bleu profond.
 *
 * Deux precautions qui evitent que les lettres soient rognees. D'abord une
 * hauteur de ligne large : les glyphes de DynaPuff debordent nettement de la
 * boite d'une interligne serree, et comme le degrade est detoure sur le texte,
 * ce qui sort de la boite disparait purement et simplement. Ensuite un peu
 * d'air horizontal, sans quoi la panse du M et la boucle du P sont coupees.
 *
 * La chasse est en `em`, pour que le logotype reste juste a toute taille.
 */
export function Wordmark({
  className = "",
  size = "clamp(38px, 4.6vw, 64px)",
  href,
  persistant = false,
}: {
  className?: string;
  size?: string;
  /** Quand il est donne, le logotype devient le lien de retour a l'accueil. */
  href?: string;
  /**
   * Le logotype de l'en-tete traverse la transition entre l'accueil et
   * l'application au lieu d'etre efface avec le reste de la page. Un seul
   * element par page peut porter ce nom : celui du pied de page ne l'a pas.
   */
  persistant?: boolean;
}) {
  const classe = `myp-gradient-text inline-block font-brand font-medium select-none ${
    persistant ? "vt-logo " : ""
  }${className}`;
  const style = {
    fontSize: size,
    lineHeight: 1.45,
    letterSpacing: "-0.05em",
    paddingInline: "0.08em",
    marginInline: "-0.08em",
    fontVariationSettings: '"wdth" 100',
  } as const;

  /*
   * Une ancre ordinaire, pas un `Link` : ce lien mene toujours a l'accueil,
   * donc soit c'est la page courante, soit c'est l'autre mise en page racine,
   * que Next ne sait de toute facon pas atteindre sans recharger. L'ancre
   * rend en prime le retour anime, une navigation lancee par script ne
   * declenchant pas de transition entre deux documents.
   */
  if (href) {
    return (
      <a
        href={href}
        className={`${classe} rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unil-400`}
        style={style}
        aria-label="MYP"
      >
        MYP
      </a>
    );
  }

  return (
    <span className={classe} style={style} aria-label="MYP">
      MYP
    </span>
  );
}
