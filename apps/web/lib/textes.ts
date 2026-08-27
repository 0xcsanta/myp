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
    exporter: "Ajouter à mon agenda",
    exporterFait: (n: number) => (n > 1 ? `${n} cours exportés.` : "1 cours exporté."),
    exporterRien: "Rien à exporter : aucun cours coché n'a d'horaire relevé pour sa première année.",
    exporterHorsCalendrier: (n: number) =>
      n > 1
        ? `${n} cours ne sont pas dans le fichier : ils tombent en 3e ou 4e semestre, et l'UNIL n'a pas encore publié le calendrier 2027-2028.`
        : "1 cours n'est pas dans le fichier : il tombe en 3e ou 4e semestre, et l'UNIL n'a pas encore publié le calendrier 2027-2028.",
    exporterSansHoraire: (n: number) =>
      n > 1
        ? `${n} cours ne sont pas dans le fichier : leur horaire n'est pas relevé.`
        : "1 cours n'est pas dans le fichier : son horaire n'est pas relevé.",
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
    choixSemestre: "Choisir le semestre à afficher",
    choixDuSemestreDuCours: "À quel semestre suis tu ce cours",
    choixDuGroupe: "Quel créneau suis tu",
    ogAlt: "MYP, Master Your Plan. Compose ton plan d'études de master à HEC Lausanne.",
    deplierAutres: (n: number) =>
      n > 1
        ? `Voir les ${n} cours des autres orientations`
        : "Voir le cours de l'autre orientation",
    replierAutres: (n: number) =>
      n > 1 ? `Masquer les ${n} cours des autres orientations` : "Masquer ce cours",
    fondTitre: "Le fond de ton plan",
    fondNote: "Gardé dans ton navigateur, pour toi seul. Ça ne change rien aux crédits.",
    fondNom: (f: string) =>
      ({
        blanc: "Blanc",
        bleu: "Bleu MYP",
        papier: "Papier",
        ardoise: "Ardoise",
        aube: "Aube",
        menthe: "Menthe",
      })[f] ?? f,
    comparerMettreDeCote: "Mettre ce plan de côté",
    comparerOublier: "Oublier le plan de côté",
    comparerMisDeCote: "Plan mis de côté",
    comparerTitre: "Ce plan, comparé à celui que tu as mis de côté",
    comparerIdentiques: "Les deux plans retiennent exactement les mêmes cours.",
    comparerTotal: (a: number, b: number) => `${a} ECTS de côté, ${b} maintenant`,
    comparerEntrants: (n: number) => (n > 1 ? `${n} cours en plus` : "1 cours en plus"),
    comparerSortants: (n: number) => (n > 1 ? `${n} cours en moins` : "1 cours en moins"),
    comparerModules: "Ce qui change par module",
    comparerSemestres: "Ce qui change par semestre",
    comparerAide:
      "Mets un plan de côté, modifie le, et le site te dit ce qui change. Rien ne quitte ton navigateur.",
    bilanTitre: "Ton plan, semestre par semestre",
    bilanCredits: (n: number) => `${n} ECTS`,
    bilanCours: (n: number) => (n > 1 ? `${n} cours` : "1 cours"),
    bilanHeures: (h: string) => `${h} de cours par semaine`,
    bilanSansHoraire: (n: number) =>
      n > 1
        ? `${n} cours sans horaire relevé, la charge est donc sous estimée`
        : "1 cours sans horaire relevé, la charge est donc sous estimée",
    bilanIrreguliers: (n: number) =>
      n > 1
        ? `${n} cours à rythme irrégulier, hors du compte hebdomadaire`
        : "1 cours à rythme irrégulier, hors du compte hebdomadaire",
    bilanExamens: (n: number) => (n > 1 ? `${n} évaluations` : "1 évaluation"),
    bilanDetailExamen: (n: number, quoi: string) => `${n} × ${quoi}`,
    bilanDuree: (h: string) => `${h} d'examen`,
    bilanDesequilibre: (fort: string, faible: string) =>
      `Tes semestres sont déséquilibrés : ${fort} d'un côté, ${faible} de l'autre. Rien ne l'interdit, mais ça se vit.`,
    autresOrientationsTitre: (n: number) =>
      `${n} de ces cours viennent du Module 5 des trois autres orientations. Selon le plan :`,
    venantDe: (o: string[]) =>
      o.length === 1 ? `orientation ${o[0]}` : "autres orientations",
    venantDeExplique: (o: string[]) =>
      o.length === 1
        ? `Cours du Module 5 de l'orientation ${o[0]}. Ton plan l'accepte en option.`
        : `Cours du Module 5 des orientations ${o.join(" et ")}. Ton plan l'accepte en option.`,
    horaireReprisDe: (master: string) =>
      `horaire relevé sur l'agenda du master en ${master}, où le même cours est donné`,
    groupePasChoisi: (n: number) => `${n} créneaux, dis lequel tu suis`,
    semestreSansHoraire:
      "Aucun horaire n'est relevé pour ce semestre. Le relevé de ce master ne couvre que l'autre saison, donc ces cours existent bien, mais leurs créneaux ne sont pas encore connus.",
    semestreSansHoraireCourt: "horaire non relevé",
    orientationTitre: "Ton orientation",
    orientationAucune: "Pas encore choisie",
    orientationExplication:
      "Les cours de ton orientation comptent ici. Ceux des autres orientations comptent en option, dans le module qui les accueille.",
    orientationSelonLePlan: "Ce que dit le plan d'études :",
    externesTitre: "Un enseignement d'un autre master",
    externesChamp: "Crédits pris hors du plan",
    externesPlafond: (max: number) => `${max} crédits au maximum.`,
    externesSansPlafond: "Le plan ne chiffre aucun maximum sur cette ligne.",
    externesAccord:
      "L'accord de la direction du programme est obligatoire. MYP compte les crédits, il ne peut pas donner cet accord ni le prévoir.",
    externesSelonLePlan: "Ce que dit le plan d'études :",
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
    creneauxMultiples: (n: number) =>
      n === 1
        ? "1 cours a plusieurs créneaux relevés. Dis lequel tu suis pour que ses chevauchements soient vérifiés : le plan ne dit pas s'il s'agit de groupes au choix ou de plusieurs séances."
        : `${n} cours ont plusieurs créneaux relevés. Dis lesquels tu suis pour que leurs chevauchements soient vérifiés : le plan ne dit pas s'il s'agit de groupes au choix ou de plusieurs séances.`,
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
    orientations: (nom: string, n: number) =>
      `${nom} : tu prends des cours dans ${n} orientations à la fois. Le plan demande d'en choisir une seule.`,
    externesMax: (nom: string, pris: number, max: number) =>
      `${nom} : ${pris} crédits pris hors du plan, le maximum est de ${max}.`,
    externesAccord: (nom: string, pris: number) =>
      `${nom} : ${pris} crédits pris hors du plan. L'accord de la direction du programme est obligatoire, écris à HECmaster@unil.ch.`,
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
    exporter: "Add to my calendar",
    exporterFait: (n: number) => (n > 1 ? `${n} courses exported.` : "1 course exported."),
    exporterRien: "Nothing to export: none of the ticked courses has a timetable for its first year.",
    exporterHorsCalendrier: (n: number) =>
      n > 1
        ? `${n} courses are not in the file: they fall in semester 3 or 4, and UNIL has not published the 2027-2028 calendar yet.`
        : "1 course is not in the file: it falls in semester 3 or 4, and UNIL has not published the 2027-2028 calendar yet.",
    exporterSansHoraire: (n: number) =>
      n > 1
        ? `${n} courses are not in the file: their timetable has not been read.`
        : "1 course is not in the file: its timetable has not been read.",
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
    choixSemestre: "Choose which semester to show",
    choixDuSemestreDuCours: "Which semester you take this course in",
    choixDuGroupe: "Which slot you attend",
    ogAlt: "MYP, Master Your Plan. Build your HEC Lausanne master's study plan.",
    deplierAutres: (n: number) =>
      n > 1 ? `Show the ${n} courses from other tracks` : "Show the course from the other track",
    replierAutres: (n: number) =>
      n > 1 ? `Hide the ${n} courses from other tracks` : "Hide this course",
    fondTitre: "Your plan's background",
    fondNote: "Kept in your browser, for you alone. It changes nothing about the credits.",
    fondNom: (f: string) =>
      ({
        blanc: "White",
        bleu: "MYP blue",
        papier: "Paper",
        ardoise: "Slate",
        aube: "Dawn",
        menthe: "Mint",
      })[f] ?? f,
    comparerMettreDeCote: "Set this plan aside",
    comparerOublier: "Forget the plan set aside",
    comparerMisDeCote: "Plan set aside",
    comparerTitre: "This plan, against the one you set aside",
    comparerIdentiques: "Both plans keep exactly the same courses.",
    comparerTotal: (a: number, b: number) => `${a} ECTS set aside, ${b} now`,
    comparerEntrants: (n: number) => (n > 1 ? `${n} courses added` : "1 course added"),
    comparerSortants: (n: number) => (n > 1 ? `${n} courses removed` : "1 course removed"),
    comparerModules: "What changes by module",
    comparerSemestres: "What changes by semester",
    comparerAide:
      "Set a plan aside, change it, and the site tells you what moved. Nothing leaves your browser.",
    bilanTitre: "Your plan, semester by semester",
    bilanCredits: (n: number) => `${n} ECTS`,
    bilanCours: (n: number) => (n > 1 ? `${n} courses` : "1 course"),
    bilanHeures: (h: string) => `${h} of class per week`,
    bilanSansHoraire: (n: number) =>
      n > 1
        ? `${n} courses have no timetable read, so the load is understated`
        : "1 course has no timetable read, so the load is understated",
    bilanIrreguliers: (n: number) =>
      n > 1
        ? `${n} courses run irregularly, outside the weekly count`
        : "1 course runs irregularly, outside the weekly count",
    bilanExamens: (n: number) => (n > 1 ? `${n} assessments` : "1 assessment"),
    bilanDetailExamen: (n: number, quoi: string) => `${n} × ${quoi}`,
    bilanDuree: (h: string) => `${h} of exams`,
    bilanDesequilibre: (fort: string, faible: string) =>
      `Your semesters are lopsided: ${fort} on one side, ${faible} on the other. Nothing forbids it, but you will feel it.`,
    autresOrientationsTitre: (n: number) =>
      `${n} of these courses come from Module 5 of the three other tracks. According to the plan:`,
    venantDe: (o: string[]) => (o.length === 1 ? `${o[0]} track` : "other tracks"),
    venantDeExplique: (o: string[]) =>
      o.length === 1
        ? `Course from Module 5 of the ${o[0]} track. Your plan accepts it as an option.`
        : `Course from Module 5 of the ${o.join(" and ")} tracks. Your plan accepts it as an option.`,
    horaireReprisDe: (master: string) =>
      `slot read from the ${master} timetable, where the same course is taught`,
    groupePasChoisi: (n: number) => `${n} slots, tell me which one you attend`,
    semestreSansHoraire:
      "No timetable has been read for this semester. This programme's record only covers the other season, so these courses do exist, but their slots are not known yet.",
    semestreSansHoraireCourt: "timetable not on record",
    orientationTitre: "Your orientation",
    orientationAucune: "Not chosen yet",
    orientationExplication:
      "Courses from your orientation count here. Courses from the other orientations count as electives, in the module that takes them.",
    orientationSelonLePlan: "What the study plan says:",
    externesTitre: "A course from another master's",
    externesChamp: "Credits taken outside the plan",
    externesPlafond: (max: number) => `${max} credits at most.`,
    externesSansPlafond: "The plan states no maximum on this line.",
    externesAccord:
      "Approval by the programme direction is required. MYP counts the credits, it can neither give that approval nor predict it.",
    externesSelonLePlan: "What the study plan says:",
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
    creneauxMultiples: (n: number) =>
      n === 1
        ? "1 course has several slots on record. Tell me which one you attend so its clashes get checked: the plan does not say whether these are parallel groups or several sessions."
        : `${n} courses have several slots on record. Tell me which ones you attend so their clashes get checked: the plan does not say whether these are parallel groups or several sessions.`,
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
    orientations: (nom: string, n: number) =>
      `${nom}: you are picking from ${n} orientations at once. The plan asks you to choose one.`,
    externesMax: (nom: string, pris: number, max: number) =>
      `${nom}: ${pris} credits taken outside the plan, the maximum is ${max}.`,
    externesAccord: (nom: string, pris: number) =>
      `${nom}: ${pris} credits taken outside the plan. Approval by the programme direction is required, write to HECmaster@unil.ch.`,
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
