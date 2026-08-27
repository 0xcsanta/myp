import type { Langue } from "./langues";

/**
 * Les textes de l'interface, dans les deux langues.
 *
 * Le francais est la reference : le type est deduit de l'objet francais, donc
 * une chaine oubliee en anglais arrete la compilation. Servir du francais sous
 * une adresse anglaise serait mensonger pour le lecteur comme pour les moteurs
 * de recherche, et le compilateur est le seul controle qui ne s'oublie pas.
 *
 * Ce qui vient des documents officiels n'est pas ici : les intitules de cours,
 * les noms de masters et les notes de module restent dans la langue ou HEC les
 * publie. Traduire un intitule officiel, ce serait inventer une donnee.
 */

const fr = {
  locale: "fr-CH",
  htmlLang: "fr",
  nomAutreLangue: "English",
  versAutreLangue: "Read this page in English",

  accueil: {
    titre: "MYP, Master Your Plan",
    description:
      "Compose ton plan d'études de master à HEC Lausanne, vérifie tes crédits par module et vois tes horaires.",
  },

  choix: {
    titre: "Choisis ton master · MYP",
    description:
      "Les dix masters de HEC Lausanne, avec leurs modules et leurs seuils de crédits.",
    h1: "Choisis ton master",
    intro: (annee: string) =>
      `Les dix masters de HEC Lausanne, tels que les décrivent les plans d'études officiels ${annee}.`,
    resume: (ects: number, modules: number, cours: number) =>
      `${ects} ECTS · ${modules} modules · ${cours} cours`,
  },

  master: {
    introuvable: "Master introuvable · MYP",
    description: (long: string, ects: number) =>
      `Compose ton ${long} : ${ects} crédits ECTS, minimums par module vérifiés en direct.`,
    retour: "Tous les masters",
    sousTitreAvant: (long: string, ects: number) =>
      `${long} · ${ects} crédits ECTS · règles selon le plan d'études `,
    sousTitreApres: ", le dernier publié par HEC",
  },

  plan: {
    tonPlan: "Ton plan",
    toutDecocher: "Tout décocher",
    partager: "Copier le lien de ce plan",
    lienCopie: "Lien copié",
    lienEchec: "La copie a échoué, copie l'adresse à la main",
    planRecu:
      "Tu regardes un plan qu'on t'a partagé. Il ne remplace le tien que si tu y touches.",
    rechercher: "Rechercher un cours",
    recherchePlaceholder: "Rechercher un cours, un enseignant, un type d'évaluation…",
    obligatoire: " · obligatoire",
    semestreInconnu: "semestre non précisé",
    examenMinutes: (min: number) => `examen ${min} min`,
    aucunResultat: (q: string) => `Aucun cours ne correspond à « ${q} ».`,
    releveAvant: "Horaires relevés le ",
    releveMilieu: " sur l'",
    releveLien: "agenda officiel de l'UNIL",
    releveApres: ". Recoupe les avant de t'inscrire : un horaire peut changer.",
    mascotteNormale: "La mascotte de MYP",
    mascotteAlerte: "La mascotte de MYP, qui signale un problème",
    aRegler: (n: number) =>
      `${n} point${n > 1 ? "s" : ""} à régler avant que ton plan soit conforme.`,
    aReglerCourt: (n: number) => `${n} point${n > 1 ? "s" : ""} à régler`,
    rienASignaler: "Rien à signaler pour l'instant.",
    rienASignalerCourt: "Rien à signaler pour l'instant",
    jeVerifie: "Je vérifie ton plan au fur et à mesure.",
    cocheUnCours: "Coche un cours pour commencer",
    cocheDesCours: "Coche des cours pour voir apparaître les vérifications.",
    noteAvecHoraires:
      "Les créneaux affichés viennent d'un relevé humain de l'horaire officiel. Recoupe les avant de t'inscrire, sur le ",
    noteSansHoraires:
      "Aucun horaire n'est encore relevé pour ce master, donc les chevauchements ne sont pas détectés. Vérifie les créneaux sur le ",
    catalogueOfficiel: "catalogue officiel",
    langueOfficielle:
      "Les intitulés de cours et les notes de module restent dans la langue où HEC les publie, donc certains sont en anglais.",
    semestreAVenir: (annee: string) => `année ${annee}`,
    creneau: (jour: string, debut: string, fin: string) => `${jour} ${debut} à ${fin}`,
    horaireNonReleve: "horaire non relevé",
    resoudre: "Choisir lequel garder",
    arbitrageTitre: "Deux cours au même moment",
    arbitrageIntro: (jour: string, semestre: string) =>
      `Le ${jour} en ${semestre}, ces deux cours se donnent en même temps. Tu ne peux pas suivre les deux.`,
    siTuLEnleves: "Si tu l'enlèves :",
    aucuneConsequence: "Aucun module ne passe sous son minimum.",
    totalApres: (n: number, requis: number) => `Ton total passerait à ${n} sur ${requis}.`,
    enleverCeCours: "Enlever ce cours",
    garderLesDeux: "Garder les deux pour l'instant",
    fermer: "Fermer",
    semestrePasse: (annee: string, aVenir: string) =>
      `relevé de l'année ${annee}, la dernière publiée. HEC n'a pas encore publié ce semestre pour ${aVenir}, donc ces créneaux sont indicatifs.`,
  },

  grille: {
    salleInconnue: "salle inconnue",
    sallePrecisee: "salle non précisée",
  },

  diagnostics: {
    moduleMin: (nom: string, obtenu: number, requis: number) =>
      `${nom} : ${obtenu} crédits sur ${requis}. Il t'en manque ${requis - obtenu}.`,
    moduleMax: (nom: string, exces: number) => `${nom} : tu dépasses de ${exces} crédits.`,
    moduleFait: (nom: string) => `${nom} complet.`,
    verrou: (nom: string, requis: number, modules: string, acquis: number) =>
      `${nom} verrouillé : il faut ${requis} crédits acquis aux modules ${modules}, tu en as ${acquis}.`,
    chevauchement: (jour: string, semestre: string, a: string, b: string) =>
      `Chevauchement le ${jour} en ${semestre} : ${a} et ${b}.`,
    horaireAucun:
      "Aucun horaire n'est encore relevé pour ce master, donc les chevauchements ne sont pas vérifiés.",
    horaireCertains: (sans: number, total: number) =>
      sans === 1
        ? `1 cours sur ${total} n'a pas d'horaire relevé : ses chevauchements ne sont pas vérifiés.`
        : `${sans} cours sur ${total} n'ont pas d'horaire relevé : leurs chevauchements ne sont pas vérifiés.`,
    totalDepasse: (total: number, exces: number, requis: number) =>
      `Total : ${total} crédits, soit ${exces} de plus que les ${requis} du diplôme.`,
    totalManque: (total: number, requis: number) =>
      `Total : ${total} crédits sur ${requis}. Il t'en manque ${requis - total}.`,
    planValide: (total: number) =>
      `Plan complet et conforme. ${total} crédits, tous les modules satisfaits.`,
    et: " et ",
  },

  pied: {
    projet: "Le projet",
    codeSource: "Code source",
    provenance: "D'où viennent les données",
    cadreLegal: "Cadre légal et non affiliation",
    documents: "Les documents officiels",
    plansEtReglements: "Plans d'études et règlements",
    horairesSyllabus: "Horaires, syllabus, Moodle",
    catalogue: "Catalogue des enseignements",
    questionAcademique: "Une question académique",
    tousLesContacts: "Tous les contacts HEC",
    reception: "Réception NEF 261, 14h à 16h",
    anneeDeReference: "Année de référence",
    planPublie: (annee: string) => `Plan d'études ${annee}, le dernier publié par HEC`,
    horairesReleves: "Horaires relevés sur l'agenda officiel de l'UNIL",
    ceQueCeNestPas: "Ce que MYP n'est pas",
    miseAuPointFort: "MYP est un projet indépendant d'Omniscient.",
    miseAuPoint1:
      " Il n'est ni affilié à l'Université de Lausanne, ni approuvé, ni relu par elle. Les informations proviennent des ",
    miseAuPointLien: "plans d'études officiels",
    miseAuPoint2:
      " de HEC Lausanne et peuvent contenir des erreurs. Seuls le plan d'études et le règlement officiels font foi. MYP ne répond à aucune question académique : pour ça, écris à l'administration des cursus de Master.",
    miseAJour:
      "Quand HEC publiera le plan d'études 2026-2027, il y aura peut-être une mise à jour. Si j'ai le temps.",
    mascotte: "La mascotte de MYP, qui se dessine toute seule",
  },
};

export type Textes = typeof fr;

const en: Textes = {
  locale: "en-GB",
  htmlLang: "en",
  nomAutreLangue: "Français",
  versAutreLangue: "Lire cette page en français",

  accueil: {
    titre: "MYP, Master Your Plan",
    description:
      "Build your master's study plan at HEC Lausanne, check your credits module by module and see your timetable.",
  },

  choix: {
    titre: "Choose your master · MYP",
    description:
      "The ten master's programmes at HEC Lausanne, with their modules and credit thresholds.",
    h1: "Choose your master",
    intro: (annee: string) =>
      `The ten master's programmes at HEC Lausanne, as described by the official ${annee} study plans.`,
    resume: (ects: number, modules: number, cours: number) =>
      `${ects} ECTS · ${modules} modules · ${cours} courses`,
  },

  master: {
    introuvable: "Programme not found · MYP",
    description: (long: string, ects: number) =>
      `Build your ${long}: ${ects} ECTS credits, module minimums checked as you go.`,
    retour: "All programmes",
    sousTitreAvant: (long: string, ects: number) =>
      `${long} · ${ects} ECTS credits · rules from the `,
    sousTitreApres: " study plan, the latest one published by HEC",
  },

  plan: {
    tonPlan: "Your plan",
    toutDecocher: "Clear all",
    partager: "Copy the link to this plan",
    lienCopie: "Link copied",
    lienEchec: "Copying failed, copy the address by hand",
    planRecu:
      "You are looking at a plan someone shared with you. It only replaces yours if you change something.",
    rechercher: "Search for a course",
    recherchePlaceholder: "Search a course, a teacher, a type of assessment…",
    obligatoire: " · compulsory",
    semestreInconnu: "semester not stated",
    examenMinutes: (min: number) => `${min} min exam`,
    aucunResultat: (q: string) => `No course matches "${q}".`,
    releveAvant: "Timetables read on ",
    releveMilieu: " from the ",
    releveLien: "official UNIL agenda",
    releveApres: ". Check them again before you enrol: a timetable can change.",
    mascotteNormale: "The MYP mascot",
    mascotteAlerte: "The MYP mascot, flagging a problem",
    aRegler: (n: number) =>
      `${n} thing${n > 1 ? "s" : ""} to fix before your plan complies.`,
    aReglerCourt: (n: number) => `${n} thing${n > 1 ? "s" : ""} to fix`,
    rienASignaler: "Nothing to report so far.",
    rienASignalerCourt: "Nothing to report so far",
    jeVerifie: "I check your plan as you go.",
    cocheUnCours: "Tick a course to start",
    cocheDesCours: "Tick some courses to see the checks appear.",
    noteAvecHoraires:
      "The slots shown come from a human reading of the official timetable. Check them again before you enrol, on the ",
    noteSansHoraires:
      "No timetable has been read for this programme yet, so clashes are not detected. Check the slots on the ",
    catalogueOfficiel: "official course catalogue",
    langueOfficielle:
      "Course titles and module notes stay in the language HEC publishes them in, so some of them are in French.",
    semestreAVenir: (annee: string) => `${annee} academic year`,
    creneau: (jour: string, debut: string, fin: string) => `${jour} ${debut} to ${fin}`,
    horaireNonReleve: "timetable not on record",
    resoudre: "Choose which one to keep",
    arbitrageTitre: "Two courses at the same time",
    arbitrageIntro: (jour: string, semestre: string) =>
      `On ${jour} in ${semestre}, these two courses run at the same time. You cannot take both.`,
    siTuLEnleves: "If you remove it:",
    aucuneConsequence: "No module falls below its minimum.",
    totalApres: (n: number, requis: number) => `Your total would go to ${n} out of ${requis}.`,
    enleverCeCours: "Remove this course",
    garderLesDeux: "Keep both for now",
    fermer: "Close",
    semestrePasse: (annee: string, aVenir: string) =>
      `read from the ${annee} academic year, the latest published. HEC has not published this semester for ${aVenir} yet, so these slots are indicative.`,
  },

  grille: {
    salleInconnue: "room unknown",
    sallePrecisee: "room not stated",
  },

  diagnostics: {
    moduleMin: (nom: string, obtenu: number, requis: number) =>
      `${nom}: ${obtenu} credits out of ${requis}. You are ${requis - obtenu} short.`,
    moduleMax: (nom: string, exces: number) => `${nom}: you are ${exces} credits over.`,
    moduleFait: (nom: string) => `${nom} complete.`,
    verrou: (nom: string, requis: number, modules: string, acquis: number) =>
      `${nom} locked: you need ${requis} credits earned in modules ${modules}, you have ${acquis}.`,
    chevauchement: (jour: string, semestre: string, a: string, b: string) =>
      `Clash on ${jour} in ${semestre}: ${a} and ${b}.`,
    horaireAucun:
      "No timetable has been read for this programme yet, so clashes are not checked.",
    horaireCertains: (sans: number, total: number) =>
      sans === 1
        ? `1 course out of ${total} has no timetable on record: its clashes are not checked.`
        : `${sans} courses out of ${total} have no timetable on record: their clashes are not checked.`,
    totalDepasse: (total: number, exces: number, requis: number) =>
      `Total: ${total} credits, which is ${exces} more than the ${requis} of the degree.`,
    totalManque: (total: number, requis: number) =>
      `Total: ${total} credits out of ${requis}. You are ${requis - total} short.`,
    planValide: (total: number) =>
      `Plan complete and compliant. ${total} credits, every module satisfied.`,
    et: " and ",
  },

  pied: {
    projet: "The project",
    codeSource: "Source code",
    provenance: "Where the data comes from",
    cadreLegal: "Legal notice and non affiliation",
    documents: "The official documents",
    plansEtReglements: "Study plans and regulations",
    horairesSyllabus: "Timetables, syllabi, Moodle",
    catalogue: "Course catalogue",
    questionAcademique: "An academic question",
    tousLesContacts: "All HEC contacts",
    reception: "Front desk NEF 261, 2 pm to 4 pm",
    anneeDeReference: "Reference year",
    planPublie: (annee: string) => `${annee} study plan, the latest one published by HEC`,
    horairesReleves: "Timetables read from the official UNIL agenda",
    ceQueCeNestPas: "What MYP is not",
    miseAuPointFort: "MYP is an independent project by Omniscient.",
    miseAuPoint1:
      " It is not affiliated with the University of Lausanne, nor approved, nor reviewed by it. The information comes from the ",
    miseAuPointLien: "official study plans",
    miseAuPoint2:
      " of HEC Lausanne and may contain errors. Only the official study plan and regulations are authoritative. MYP answers no academic question: for that, write to the Master's programmes administration.",
    miseAJour:
      "When HEC publishes the 2026-2027 study plan, there may be an update. If I have the time.",
    mascotte: "The MYP mascot, drawing itself",
  },
};

const TEXTES: Record<Langue, Textes> = { fr, en };

export const textes = (langue: Langue): Textes => TEXTES[langue];
