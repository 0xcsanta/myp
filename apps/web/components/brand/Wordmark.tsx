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
}: {
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={`myp-gradient-text inline-block font-brand font-medium select-none ${className}`}
      style={{
        fontSize: size,
        lineHeight: 1.45,
        letterSpacing: "-0.05em",
        paddingInline: "0.08em",
        marginInline: "-0.08em",
        fontVariationSettings: '"wdth" 100',
      }}
      aria-label="MYP"
    >
      MYP
    </span>
  );
}
