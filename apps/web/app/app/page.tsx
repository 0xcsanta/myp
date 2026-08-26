import { redirect } from "next/navigation";
import { LANGUE_PAR_DEFAUT } from "@/lib/langues";

/**
 * `/app` sans langue renvoie vers la langue par defaut. Personne ne devrait
 * arriver ici depuis le site, mais une adresse tapee a la main ou un vieux
 * lien ne doit pas tomber sur une page introuvable.
 */
export default function App() {
  redirect(`/app/${LANGUE_PAR_DEFAUT}`);
}
