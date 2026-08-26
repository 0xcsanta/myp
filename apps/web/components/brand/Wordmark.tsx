/**
 * Le logotype MYP.
 *
 * Repris du Figma : DynaPuff Medium, degrade radial du bleu UNIL vers le bleu
 * profond. Le chasse est exprimee en `em` et non en pixels, pour que le
 * logotype reste juste a n'importe quelle taille.
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
      className={`myp-gradient-text inline-block font-brand font-medium leading-[1.2] select-none ${className}`}
      style={{
        fontSize: size,
        letterSpacing: "-0.05em",
        fontVariationSettings: '"wdth" 100',
      }}
      aria-label="MYP"
    >
      MYP
    </span>
  );
}
