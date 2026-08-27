/*
 * Le degrade du pied de page.
 *
 * C'etait un shader WebGL anime, tire d'un moteur 3D complet. Il a ete retire
 * a la demande de Clement, et le degrade CSS qui lui servait deja de repli
 * prend sa place definitivement : c'est donc exactement le meme rendu que ce
 * que voyaient les visiteurs sans WebGL, en mouvement moins.
 *
 * Trois raisons, au dela du gout.
 *
 * Un navigateur limite le nombre de contextes WebGL vivants, souvent a huit ou
 * seize, et rend le plus ancien quand la limite est atteinte. Le pied de page
 * en tenait un en permanence, au detriment de la surface liquide du bouton
 * principal, qui est au dessus de la ligne de flottaison et vue par tout le
 * monde. Entre un fond anime tout en bas et le bouton d'entree, le choix est
 * vite fait.
 *
 * C'etait aussi, et de loin, le plus gros paquet du site pour un element
 * decoratif place hors de vue au chargement.
 *
 * Enfin ce composant redevient un composant serveur : ni etat, ni chargement
 * differe, ni observateur d'intersection. Trois couleurs et une regle CSS.
 */

const C1 = "#0037EB";
const C2 = "#0000c2";
const C3 = "#6a88eb";

const DEGRADE = `radial-gradient(120% 90% at 18% 78%, #ffffff 0%, ${C3} 28%, ${C1} 58%, ${C2} 100%)`;

export function GradientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ background: DEGRADE }}
    />
  );
}
