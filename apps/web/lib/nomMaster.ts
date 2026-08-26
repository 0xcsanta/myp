import type { Master } from "./donnees";
import type { Langue } from "./langues";

/** L'etiquette courte d'un master, dans la langue du lecteur. */
export const nomCourt = (m: Master, langue: Langue) =>
  langue === "fr" ? m.court : m.courtEn;
