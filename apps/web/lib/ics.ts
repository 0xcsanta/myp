import type { Cours } from "./donnees";
import type { Langue } from "./langues";

/**
 * L'export du plan vers un agenda, au format iCalendar (RFC 5545).
 *
 * Pourquoi ce fichier existe seul, sans React ni acces disque : il fabrique du
 * texte a partir de donnees, donc il se lit et se verifie sans lancer le site.
 *
 * Le point delicat n'est pas le format, il est ailleurs. Un creneau du site dit
 * « lundi, 10:15, automne » ; un agenda veut une date. Il faut donc le
 * calendrier academique reel, et c'est la que le projet refuse de deviner :
 *
 *   - les deux premiers semestres du master ont des dates publiees par l'UNIL,
 *     donc ils s'exportent ;
 *   - les troisieme et quatrieme tombent en 2027-2028, dont le calendrier
 *     n'existe pas encore, donc ils ne s'exportent pas et le site le dit.
 *
 * Et le releve de printemps disponible est celui de 2026, pas de 2027. Les
 * evenements du deuxieme semestre portent donc l'avertissement dans leur
 * description, la ou l'etudiant le relira dans six mois.
 */

export type Interruption = { du: string; au: string; motif: string };

export type SemestreAcademique = {
  nom: string;
  anneeAcademique: string;
  premierJour: string;
  dernierJour: string;
  citation: string;
  sansEnseignement: Interruption[];
  horaireRelevePour: string;
  releveDeLaMemeAnnee: boolean;
  avertissement?: string;
};

export type CalendrierAcademique = {
  source: { document: string; url: string; consulteLe: string };
  semestres: Record<string, SemestreAcademique>;
};

const JOUR_VERS_INDICE: Record<string, number> = {
  Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5, Samedi: 6, Dimanche: 0,
};

/* Les dates sont manipulees en UTC de bout en bout. Le fuseau ne sert qu'a
 * l'affichage, il est porte par le TZID de l'evenement : calculer en heure
 * locale ferait glisser un cours d'un jour selon le navigateur du lecteur. */
const jour = (iso: string): Date => {
  const [a, m, j] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, j));
};

const enIso = (d: Date): string => d.toISOString().slice(0, 10);

const ajouterJours = (d: Date, n: number): Date =>
  new Date(d.getTime() + n * 86_400_000);

/** La premiere occurrence d'un jour de la semaine a partir d'une date. */
function premierJourDeSemaine(depuis: Date, indice: number): Date {
  const ecart = (indice - depuis.getUTCDay() + 7) % 7;
  return ajouterJours(depuis, ecart);
}

/** « 2026-09-14 » et « 10:15 » deviennent « 20260914T101500 ». */
function estampille(d: Date, heure: string): string {
  const [h, min] = heure.split(":");
  return `${enIso(d).replace(/-/g, "")}T${h.padStart(2, "0")}${min}00`;
}

/**
 * Les jours sans enseignement qui tombent sur ce jour de la semaine.
 *
 * Une interruption est donnee comme un intervalle, « du 29 mars au 2 avril ».
 * Un cours du lundi n'est annule que si un lundi tombe dedans, et il peut y en
 * avoir plusieurs sur un intervalle long.
 */
function joursAnnules(sem: SemestreAcademique, indice: number): Date[] {
  const out: Date[] = [];
  for (const t of sem.sansEnseignement) {
    let d = jour(t.du);
    const fin = jour(t.au);
    while (d <= fin) {
      if (d.getUTCDay() === indice) out.push(d);
      d = ajouterJours(d, 1);
    }
  }
  return out;
}

/* Un champ TEXT d'iCalendar echappe la barre oblique inverse, le point virgule,
 * la virgule et le saut de ligne. Sans cela, une salle « Internef/125, sauf le
 * 5 mai » coupe le champ en deux et l'agenda affiche n'importe quoi. */
const echapper = (t: string): string =>
  t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/*
 * Le format impose des lignes d'au plus 75 octets, repliees par un saut de
 * ligne suivi d'une espace. En octets, pas en caracteres : « Amphipôle » et
 * « Géopolis » comptent double sur leur accent, et une ligne repliee au mauvais
 * endroit casse le fichier chez certains agendas.
 */
function replier(ligne: string): string {
  const octets = new TextEncoder().encode(ligne);
  if (octets.length <= 75) return ligne;
  const out: string[] = [];
  let courant = "";
  let taille = 0;
  for (const c of ligne) {
    const n = new TextEncoder().encode(c).length;
    // 74 sur les lignes suivantes : l'espace de repli compte dans les 75
    if (taille + n > (out.length ? 74 : 75)) {
      out.push(courant);
      courant = "";
      taille = 0;
    }
    courant += c;
    taille += n;
  }
  out.push(courant);
  return out.join("\r\n ");
}

/*
 * Le fuseau, decrit dans le fichier plutot que suppose.
 *
 * Un agenda qui recoit « 20270222T101500 » sans fuseau le lit dans le sien.
 * Un etudiant en echange a Singapour verrait ses cours a des heures fausses.
 * Les regles d'heure d'ete de l'Europe sont donc ecrites ici, une fois.
 */
const FUSEAU = [
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Zurich",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

export type Exporte = {
  /** Le fichier, ou null si rien n'etait exportable. */
  fichier: string | null;
  /** Combien de cours ont produit au moins un evenement. */
  cours: number;
  evenements: number;
  /** Les cours ecartes parce que leur semestre n'a pas de calendrier publie. */
  horsCalendrier: string[];
  /** Les cours ecartes parce qu'aucun horaire n'est releve. */
  sansHoraire: string[];
};

const T = {
  fr: {
    prodid: "MYP, Master Your Plan",
    rappel: "Horaire relevé sur les documents officiels de HEC Lausanne. Vérifie sur le catalogue officiel avant de t'inscrire. MYP n'est pas affilié à l'UNIL.",
    enseigne: "Enseignant",
    creneauIncertain: "Le document ne dit pas si ce cours a lieu toutes les deux semaines à partir de cette date, ni quelles semaines exactement. Vérifie.",
    irregulier: "Ce cours ne suit pas un rythme hebdomadaire régulier. Les dates exactes figurent dans la remarque de sa fiche officielle.",
    repris: "Créneau relevé sur l'agenda d'un autre master, où le même cours est donné.",
  },
  en: {
    prodid: "MYP, Master Your Plan",
    rappel: "Slot read from the official HEC Lausanne documents. Check the official course catalogue before you enrol. MYP is not affiliated with UNIL.",
    enseigne: "Taught by",
    creneauIncertain: "The document does not say whether this course runs every other week from this date, nor which weeks exactly. Check.",
    irregulier: "This course does not follow a regular weekly rhythm. The exact dates are in the remark on its official course sheet.",
    repris: "Slot read from another programme's timetable, where the same course is taught.",
  },
};

/**
 * Fabrique le fichier .ics du plan retenu.
 *
 * `placements` donne le semestre choisi pour un cours offert a plusieurs,
 * `groupes` le creneau choisi pour un cours qui en a plusieurs : ce sont les
 * memes reglages que ceux de l'ecran, pour que le fichier corresponde a ce que
 * l'etudiant voit.
 */
export function fabriquerIcs({
  cours,
  calendrier,
  nomDuMaster,
  langue,
  placements,
  groupes,
  maintenant,
}: {
  cours: Cours[];
  calendrier: CalendrierAcademique;
  nomDuMaster: string;
  langue: Langue;
  placements: Record<string, number>;
  groupes: Record<string, number>;
  maintenant: Date;
}): Exporte {
  const t = T[langue];
  const horsCalendrier: string[] = [];
  const sansHoraire: string[] = [];
  const blocs: string[] = [];
  let nCours = 0;
  let nEvenements = 0;

  const dtstamp = `${maintenant.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;

  for (const c of cours) {
    const dispo = [...new Set(c.colonnes)].filter((n) => n >= 1 && n <= 4).sort((a, b) => a - b);
    const choisi = placements[c.id];
    const rang = choisi && dispo.includes(choisi) ? choisi : dispo[0];
    if (!rang) {
      sansHoraire.push(c.titre);
      continue;
    }

    const sem = calendrier.semestres[String(rang)];
    if (!sem) {
      horsCalendrier.push(c.titre);
      continue;
    }

    let creneaux = c.creneaux.filter((k) => k.semestre === sem.horaireRelevePour);
    if (!creneaux.length) {
      sansHoraire.push(c.titre);
      continue;
    }
    // un cours donne a plusieurs creneaux n'exporte que celui qu'on suit
    const retenu = groupes[c.id];
    if (creneaux.length > 1 && retenu !== undefined && c.creneaux[retenu]) {
      const k = c.creneaux[retenu];
      if (k.semestre === sem.horaireRelevePour) creneaux = [k];
    }

    let ecrits = 0;
    creneaux.forEach((k, i) => {
      const indice = JOUR_VERS_INDICE[k.jour];
      if (indice === undefined || !/^\d{1,2}:\d{2}$/.test(k.debut)) return;

      const debut = premierJourDeSemaine(jour(sem.premierJour), indice);
      const dernier = jour(sem.dernierJour);
      if (debut > dernier) return;

      const description = [
        c.enseignants ? `${t.enseigne} : ${c.enseignants}` : null,
        k.note || null,
        k.reprisDe ? t.repris : null,
        k.cadence === "quinzaine" ? t.creneauIncertain : null,
        k.cadence === "irregulier" ? t.irregulier : null,
        sem.avertissement ?? null,
        t.rappel,
      ]
        .filter(Boolean)
        .join("\n");

      const exdates = joursAnnules(sem, indice)
        .filter((d) => d >= debut && d <= dernier)
        .map((d) => estampille(d, k.debut));

      const lignes = [
        "BEGIN:VEVENT",
        `UID:${c.id}-${sem.nom}-${i}@myp`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;TZID=Europe/Zurich:${estampille(debut, k.debut)}`,
        `DTEND;TZID=Europe/Zurich:${estampille(debut, k.fin)}`,
        `RRULE:FREQ=WEEKLY;${k.cadence === "quinzaine" ? "INTERVAL=2;" : ""}UNTIL=${estampille(dernier, "23:59")}`,
        exdates.length ? `EXDATE;TZID=Europe/Zurich:${exdates.join(",")}` : null,
        `SUMMARY:${echapper(c.titre)}`,
        k.salle ? `LOCATION:${echapper(k.salle)}` : null,
        `DESCRIPTION:${echapper(description)}`,
        `CATEGORIES:${echapper(nomDuMaster)}`,
        "END:VEVENT",
      ].filter((x): x is string => x !== null);

      blocs.push(...lignes.map(replier));
      ecrits += 1;
      nEvenements += 1;
    });
    if (ecrits) nCours += 1;
  }

  if (!nEvenements) {
    return { fichier: null, cours: 0, evenements: 0, horsCalendrier, sansHoraire };
  }

  const entete = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${t.prodid}//FR`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    replier(`X-WR-CALNAME:${echapper(`MYP · ${nomDuMaster}`)}`),
    "X-WR-TIMEZONE:Europe/Zurich",
    ...FUSEAU,
  ];

  return {
    fichier: [...entete, ...blocs, "END:VCALENDAR"].join("\r\n") + "\r\n",
    cours: nCours,
    evenements: nEvenements,
    horsCalendrier,
    sansHoraire,
  };
}
