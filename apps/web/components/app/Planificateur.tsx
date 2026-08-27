"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Cours, Master, Regles } from "@/lib/donnees";
import { libelleSemestre, semestresDe } from "@/lib/semestres";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { nomCourt } from "@/lib/nomMaster";
import { evaluationDuCours, langueDuCours } from "@/lib/codes";
import { libelleCreneaux } from "@/lib/creneaux";
import {
  anneeAcademique,
  libelleColonnes,
  libelleRang,
  libelleSaison,
  rangsDe,
  saisonDuRang,
} from "@/lib/semestres";
import { ANNEE_VISEE } from "@/lib/annee";
import {
  coursEnConflit,
  messageDiagnostic,
  nomModule,
  valider,
  type Diagnostic,
} from "@/lib/valider";
import { Mascotte } from "@/components/brand/Mascotte";
import { GrilleHoraire } from "./GrilleHoraire";
import { Arbitrage } from "./Arbitrage";
import { dessinerHoraire, exporterPdf, exporterPng } from "@/lib/exporter";

/**
 * Le planificateur.
 *
 * Tout tourne dans le navigateur : la selection ne part sur aucun serveur, il
 * n'y a ni compte ni cookie. Elle vit dans l'adresse de la page, ce qui la
 * rend partageable, et dans le stockage local, ce qui la fait survivre a une
 * fermeture d'onglet.
 */

/* ---------------------------------------------------------------- partage */

/*
 * La selection est encodee en champ de bits sur l'ordre du catalogue, puis en
 * base 64 compatible URL. Un plan de trente cours tient en une dizaine de
 * caracteres, la ou une liste d'identifiants en ferait plusieurs centaines.
 * L'ordre du catalogue vient du plan d'etudes et ne bouge pas dans l'annee.
 *
 * Un champ d'octets plutot qu'un entier long : pas de litteral BigInt, donc
 * aucune contrainte sur la cible de compilation, et le code reste lisible.
 */
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function encoder(selection: Set<string>, catalogue: Cours[]): string {
  if (!selection.size) return "";
  const octets = new Uint8Array(Math.ceil(catalogue.length / 8));
  catalogue.forEach((c, i) => {
    if (selection.has(c.id)) octets[i >> 3] |= 1 << (i & 7);
  });
  let out = "";
  for (let i = 0; i < octets.length; i += 3) {
    const n = (octets[i] << 16) | ((octets[i + 1] ?? 0) << 8) | (octets[i + 2] ?? 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63] + B64[(n >> 6) & 63] + B64[n & 63];
  }
  return out.replace(/A+$/, "");
}

/*
 * Les credits pris hors du plan ne correspondent a aucun cours du catalogue :
 * ils ne peuvent pas tenir dans le champ de bits. Ils sont donc ecrits en clair
 * apres un tilde, qui n'appartient pas a l'alphabet base 64 et ne peut donc pas
 * etre confondu avec lui. Un ancien lien, sans tilde, reste lisible.
 */
export function assembler(
  bits: string,
  externes: number,
  orientation: string | null,
): string {
  if (!externes && !orientation) return bits;
  return `${bits}~${externes || 0}${orientation ? `~${orientation}` : ""}`;
}

export function separer(code: string): {
  bits: string;
  externes: number;
  orientation: string | null;
} {
  const [bits, ext, orient] = code.split("~");
  const n = Number.parseInt(ext ?? "", 10);
  return {
    bits: bits ?? "",
    externes: Number.isFinite(n) && n > 0 ? n : 0,
    // un code ecrit avant l'arrivee de l'orientation n'en porte pas : c'est
    // normal, et le lien reste lisible
    orientation: orient || null,
  };
}

function decoder(code: string, catalogue: Cours[]): Set<string> {
  const s = new Set<string>();
  if (!code) return s;
  const octets = new Uint8Array(Math.ceil(catalogue.length / 8));
  for (let i = 0, o = 0; i < code.length; i += 4, o += 3) {
    const v = [0, 1, 2, 3].map((k) => Math.max(0, B64.indexOf(code[i + k] ?? "A")));
    const n = (v[0] << 18) | (v[1] << 12) | (v[2] << 6) | v[3];
    if (o < octets.length) octets[o] = (n >> 16) & 255;
    if (o + 1 < octets.length) octets[o + 1] = (n >> 8) & 255;
    if (o + 2 < octets.length) octets[o + 2] = n & 255;
  }
  catalogue.forEach((c, i) => {
    if (octets[i >> 3] & (1 << (i & 7))) s.add(c.id);
  });
  return s;
}

/* --------------------------------------------------------------- affichage */

function Jauge({
  nom,
  obtenu,
  requis,
}: {
  nom: string;
  obtenu: number;
  requis: number;
}) {
  /*
   * Un module dont le plan ne chiffre aucun seuil n'a rien a comparer : les
   * orientations du MScF sont dans ce cas, leur exigence vivant sur le module
   * parent. Afficher « 21 / 0 » et une barre pleine serait un contresens.
   */
  const sansSeuil = requis <= 0;
  const pct = sansSeuil ? 0 : Math.min(100, Math.round((obtenu / requis) * 100));
  const etat = sansSeuil ? "" : obtenu > requis ? "trop" : obtenu === requis ? "fait" : "";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink">{nom}</span>
        <span className="tnum font-mono text-[11.5px] text-muted">
          {obtenu}
          {sansSeuil ? " ECTS" : ` / ${requis}`}
        </span>
      </div>
      <div
        className={`mt-1.5 h-[7px] overflow-hidden rounded-full bg-line/70 ${
          sansSeuil ? "opacity-0" : ""
        }`}
      >
        <i
          className={`block h-full rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-pop)] ${
            etat === "trop"
              ? "bg-warn"
              : etat === "fait"
                ? "bg-ok"
                : "bg-unil-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- ecran */

export function Planificateur({
  master,
  regles,
  catalogue,
  releve,
  langue,
}: {
  master: Master;
  regles: Regles;
  catalogue: Cours[];
  releve: { releveLe: string; url: string; note?: string } | null;
  langue: Langue;
}) {
  const TT = textes(langue);
  const T = TT.plan;
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [recherche, setRecherche] = useState("");
  /* les credits pris hors du plan, quand le plan l'autorise */
  const [externes, setExternes] = useState(0);
  /* l'orientation suivie, quand le plan demande d'en choisir une */
  const [orientation, setOrientation] = useState<string | null>(null);
  const [pret, setPret] = useState(false);
  /*
   * Un plan ouvert depuis un lien recu n'est pas encore le sien : tant que le
   * lecteur n'y touche pas, il ne remplace pas ce qu'il avait enregistre.
   */
  const [recu, setRecu] = useState(false);
  const [modifie, setModifie] = useState(false);
  const [copie, setCopie] = useState<"copie" | "echec" | null>(null);
  const partageInitial = useRef<string | null | undefined>(undefined);
  const cle = `myp:${master.slug}`;

  /*
   * Reprise. Un plan passe dans l'adresse l'emporte, c'est un lien qu'on a
   * recu ; sinon on reprend celui du navigateur.
   *
   * L'adresse est ensuite nettoyee, et ce n'est pas cosmetique. La selection y
   * etait autrefois reecrite a chaque case cochee : il suffisait de copier
   * l'adresse de la barre pour envoyer son propre plan a quelqu'un qui voulait
   * partir de zero. Le partage est desormais un geste, pas un effet de bord.
   */
  useEffect(() => {
    /*
     * Le plan recu est lu une fois pour toutes, et retenu.
     *
     * React execute cet effet deux fois en mode strict. En lisant l'adresse a
     * chaque passage, le premier trouvait le plan puis nettoyait l'adresse, et
     * le second ne trouvait plus rien et remettait tout a zero : le lien recu
     * s'annulait lui meme. La reference survit aux deux passages, donc la
     * lecture n'a lieu qu'une fois et le nettoyage ne detruit plus la reprise.
     */
    if (partageInitial.current === undefined) {
      const u = new URL(window.location.href);
      const p = u.searchParams.get("p");
      partageInitial.current = p;
      if (p) {
        u.searchParams.delete("p");
        window.history.replaceState(null, "", u);
      }
    }
    const partage = partageInitial.current;
    const source = partage ?? window.localStorage.getItem(cle) ?? "";
    const { bits, externes: horsPlan, orientation: orient } = separer(source);
    setSelection(decoder(bits, catalogue));
    setExternes(regles.externes ? horsPlan : 0);
    setOrientation(
      orient && regles.modules.some((m) => m.code === orient) ? orient : null,
    );
    setRecu(Boolean(partage));
    setPret(true);
  }, [cle, catalogue]);

  /*
   * Sauvegarde, dans le navigateur et nulle part ailleurs : la selection ne
   * part sur aucun serveur, il n'y a ni compte ni identifiant. Chaque
   * navigateur a son propre stockage, donc deux personnes sont isolees l'une
   * de l'autre sans que le site ait a savoir qui elles sont.
   *
   * On n'ecrit qu'apres une action, sans quoi ouvrir le lien d'un camarade
   * ecraserait son propre plan avant meme de l'avoir regarde.
   */
  useEffect(() => {
    if (!pret || !modifie) return;
    try {
      window.localStorage.setItem(
        cle,
        assembler(encoder(selection, catalogue), externes, orientation),
      );
    } catch {
      /* navigation privee : le stockage est refuse, tant pis */
    }
  }, [selection, externes, orientation, pret, modifie, cle, catalogue]);

  const resultat = useMemo(
    () => valider(selection, regles, catalogue, externes, orientation),
    [selection, externes, orientation, regles, catalogue],
  );

  const basculer = (id: string) => {
    setModifie(true);
    setRecu(false);
    setSelection((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toutDecocher = () => {
    setModifie(true);
    setRecu(false);
    setSelection(new Set());
    setExternes(0);
    setOrientation(null);
  };

  const changerOrientation = (code: string | null) => {
    setModifie(true);
    setRecu(false);
    setOrientation(code);
  };

  const changerExternes = (n: number) => {
    setModifie(true);
    setRecu(false);
    setExternes(Math.max(0, Math.min(120, Math.round(n) || 0)));
  };

  /*
   * Le lien de partage se fabrique a la demande et ne touche pas l'adresse de
   * la page. C'est tout l'interet : on partage quand on le decide.
   */
  const partager = async () => {
    const u = new URL(window.location.href);
    u.searchParams.set(
      "p",
      assembler(encoder(selection, catalogue), externes, orientation),
    );
    try {
      await navigator.clipboard.writeText(u.toString());
      setCopie("copie");
    } catch {
      setCopie("echec");
    }
    window.setTimeout(() => setCopie(null), 2600);
  };

  const q = recherche.trim().toLowerCase();
  const parModule = useMemo(() => {
    const groupes = new Map<string, Cours[]>();
    for (const c of catalogue) {
      if (
        q &&
        ![c.titre, c.enseignants ?? "", c.evaluation ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        continue;
      const l = groupes.get(c.module) ?? [];
      l.push(c);
      groupes.set(c.module, l);
    }
    return groupes;
  }, [catalogue, q]);

  const erreurs = resultat.diagnostics.filter((x) => x.niveau === "erreur");

  /*
   * Sur telephone le rail passe sous le catalogue, donc le compteur de credits
   * et les alertes se retrouvent apres une quarantaine de cours : on ne voit
   * plus ce qu'on est en train de faire. Une barre de resume vient donc se
   * coller en bas de l'ecran, mais seulement tant que le vrai rail n'est pas
   * visible. Elle disparait des qu'il arrive, ce qui evite de recouvrir le pied
   * de page et de dire deux fois la meme chose.
   */
  /* le chevauchement en cours d'arbitrage, s'il y en a un */
  const [arbitrage, setArbitrage] = useState<
    Extract<Diagnostic, { code: "chevauchement" }> | null
  >(null);

  const rail = useRef<HTMLElement | null>(null);
  const [railVu, setRailVu] = useState(true);
  useEffect(() => {
    const el = rail.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const o = new IntersectionObserver(([e]) => setRailVu(e.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  /* les cours retenus, et ceux dont un creneau en heurte un autre */
  const retenus = useMemo(
    () => catalogue.filter((c) => selection.has(c.id)),
    [catalogue, selection],
  );
  const avecHoraire = retenus.filter((c) => c.horaireConnu);
  const enConflit = useMemo(
    () => coursEnConflit(resultat.diagnostics),
    [resultat.diagnostics],
  );
  const semestres = useMemo(() => semestresDe(avecHoraire), [avecHoraire]);

  /*
   * Un seul emploi du temps a la fois, celui du semestre qu'on regarde.
   *
   * Le site en affichait un par saison relevee, ce qui melangeait le premier et
   * le troisieme semestre dans la meme grille d'automne alors qu'ils sont a un
   * an d'ecart. On choisit desormais son rang, et la grille ne montre que les
   * cours de ce semestre la.
   */
  const rangs = useMemo(() => rangsDe(avecHoraire), [avecHoraire]);
  const [rangVoulu, setRangVoulu] = useState<number | null>(null);
  const rang = rangVoulu && rangs.includes(rangVoulu) ? rangVoulu : (rangs[0] ?? null);
  const semestreDuRang = rang
    ? (semestres.find((x) => x.startsWith(saisonDuRang(rang))) ?? null)
    : null;
  const coursDuRang = useMemo(
    () => (rang ? avecHoraire.filter((c) => c.colonnes.includes(rang)) : avecHoraire),
    [avecHoraire, rang],
  );

  const dessine = (s: string) =>
    dessinerHoraire(
      coursDuRang,
      s,
      nomCourt(master, langue),
      enConflit,
      langue,
      2,
      rang ? `${libelleRang(rang, langue)} · ${libelleSemestre(s, langue)}` : undefined,
    );
  /*
   * Le nom du fichier est translitteré plutôt que filtré : `\w` ignore les
   * accents, donc « Systèmes d'information » devenait « Systmes dinformation ».
   */
  const nomFichier = (s: string) =>
    `MYP ${nomCourt(master, langue)} ${rang ? libelleRang(rang, langue) + " " : ""}${libelleSemestre(s, langue)}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/['’]/g, " ")
      .replace(/[^A-Za-z0-9 \-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  /*
   * Ce que le rail montre.
   *
   * Les feuilles, comme avant, mais amputees des orientations qu'on ne suit
   * pas : celui qui prend l'orientation 3.3 du MScF n'a que faire des jauges
   * du 3.2.1 et du 3.2.2. En echange, le module qui porte le choix s'affiche
   * lui meme, puisque c'est lui qui porte le seuil des 21 credits.
   */
  const feuilles = regles.modules.filter((m) => {
    if (resultat.enSommeil.has(m.code)) return false;
    const aDesEnfants = regles.modules.some((x) => x.parent === m.code);
    return aDesEnfants ? m.choisirUn === true : true;
  });

  return (
    <div className="shell grid gap-10 pb-[clamp(64px,8vw,128px)] lg:grid-cols-[1fr_340px] lg:items-start lg:gap-12">
      {/*
        ---------------- le catalogue ----------------
        `min-w-0` n'est pas decoratif : une piste `1fr` vaut `minmax(auto, 1fr)`,
        et son minimum `auto` laisse un enfant large repousser la colonne au dela
        de l'ecran. La grille horaire porte un `min-width` de 720 pixels pour
        rester lisible, ce qui faisait deborder toute la page sur mobile au lieu
        de la faire defiler dans son propre cadre.
      */}
      <div className="min-w-0">
        {avecHoraire.length > 0 && semestreDuRang && rang && (
          <div className="mb-10 grid grid-cols-1 gap-4">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div className="min-w-0">
                <h2 className="font-display text-[20px] tracking-[-0.02em] text-ink">
                  {libelleRang(rang, langue)}
                </h2>
                {/*
                  Une annee academique va de l'automne d'une annee civile au
                  printemps de la suivante. Le releve d'aout 2026 porte donc un
                  automne a venir et un printemps deja termine, celui de
                  l'annee precedente. Le dire evite qu'un etudiant qui prepare
                  2026-2027 prenne ce printemps la pour le sien.
                */}
                <p
                  className={`mt-1 text-[11.5px] leading-relaxed ${
                    anneeAcademique(semestreDuRang) === ANNEE_VISEE
                      ? "text-muted"
                      : "text-warn"
                  }`}
                >
                  {libelleSemestre(semestreDuRang, langue)}
                  {" · "}
                  {anneeAcademique(semestreDuRang) === ANNEE_VISEE
                    ? T.semestreAVenir(anneeAcademique(semestreDuRang))
                    : T.semestrePasse(anneeAcademique(semestreDuRang), ANNEE_VISEE)}
                </p>
              </div>

              {/*
                Le choix du semestre. Seuls les rangs que la selection couvre
                sont proposes : offrir un quatrieme semestre a qui n'y a aucun
                cours afficherait une grille vide sans rien expliquer.
              */}
              {rangs.length > 1 && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={T.choixSemestre}>
                  {rangs.map((r) => {
                    const actif = r === rang;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRangVoulu(r)}
                        aria-pressed={actif}
                        className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-medium
                          transition-colors duration-150 ease-[var(--ease-out-std)] ${
                            actif
                              ? "border-unil-400 bg-unil-100 text-unil-500"
                              : "border-line-2 bg-white text-ink-2 hover:border-unil-400"
                          }`}
                      >
                        {libelleRang(r, langue)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <GrilleHoraire
                cours={coursDuRang}
                semestre={semestreDuRang}
                enConflit={enConflit}
                langue={langue}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exporterPng(dessine(semestreDuRang), nomFichier(semestreDuRang))}
                className="rounded-lg border border-line-2 px-3 py-1.5 text-[12.5px] font-medium
                  text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                  hover:border-unil-400 hover:text-unil-400"
              >
                PNG · {libelleRang(rang, langue)}
              </button>
              <button
                onClick={() => exporterPdf(dessine(semestreDuRang), nomFichier(semestreDuRang))}
                className="rounded-lg border border-line-2 px-3 py-1.5 text-[12.5px] font-medium
                  text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                  hover:border-unil-400 hover:text-unil-400"
              >
                PDF · {libelleRang(rang, langue)}
              </button>
            </div>

            {releve && (
              <p className="text-[11.5px] leading-relaxed text-muted">
                {T.releveAvant}
                {new Date(releve.releveLe).toLocaleDateString(TT.locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {T.releveMilieu}
                <a
                  href={releve.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-unil-400 underline underline-offset-2"
                >
                  {T.releveLien}
                </a>
                {T.releveApres}
              </p>
            )}
          </div>
        )}

        <label className="block">
          <span className="sr-only">{T.rechercher}</span>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={T.recherchePlaceholder}
            className="w-full rounded-xl border border-line-2 bg-white px-4 py-3 text-[14.5px]
              outline-none transition-colors duration-150 ease-[var(--ease-out-std)]
              placeholder:text-muted focus:border-unil-400"
          />
        </label>

        {/*
          Les intitules et les notes viennent des plans officiels et ne sont pas
          traduits : le dire evite que le lecteur prenne un titre reste dans
          l'autre langue pour un oubli. La remarque vaut dans les deux sens, la
          page francaise porte elle aussi des titres anglais.
        */}
        <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
          {T.langueOfficielle}
        </p>

        <div className="mt-8 grid gap-10">
          {regles.modules
            /*
             * Un module parent n'a souvent aucun cours en propre : au MScF, le
             * Module 3 ne fait que porter le seuil de 21 credits et la consigne
             * de choisir son orientation. Le masquer faisait disparaitre cette
             * consigne, et les trois orientations flottaient sans en-tete.
             */
            /*
              Le catalogue montre toutes les orientations, y compris celles
              qu'on ne suit pas : c'est la qu'on choisit la sienne, donc les
              masquer rendrait le choix impossible. Ce sont le rail et les
              verifications qui se taisent sur les orientations non suivies,
              pas la liste des cours.
            */
            .filter((m) => {
              if (parModule.has(m.code)) return true;
              const descendants = (code: string): string[] => {
                const fils = regles.modules.filter((x) => x.parent === code);
                return fils.flatMap((f) => [f.code, ...descendants(f.code)]);
              };
              return descendants(m.code).some((c) => parModule.has(c));
            })
            .map((m) => {
              /*
               * La profondeur se lit en remontant les parents, et non au
               * nombre de points du code : elle sert a decaler les
               * sous-modules vers la droite pour que la hierarchie du plan se
               * voie. Le MScF en a trois niveaux, son sous-module 3.2 se
               * divisant lui meme en obligatoire et electif.
               */
              let profondeur = 0;
              let parent = m.parent;
              while (parent && profondeur < 4) {
                profondeur += 1;
                parent = regles.modules.find((x) => x.code === parent)?.parent ?? null;
              }
              const cours = parModule.get(m.code) ?? [];
              return (
                <section
                  key={m.code}
                  className={
                    profondeur === 0
                      ? ""
                      : profondeur === 1
                        ? "border-l border-line pl-4 sm:pl-6"
                        : "border-l border-line pl-4 sm:pl-12"
                  }
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2
                      className={`font-display tracking-[-0.02em] text-ink ${
                        profondeur === 0 ? "text-[22px]" : "text-[17px]"
                      }`}
                    >
                      {nomModule(m, langue)}
                    </h2>
                    <p className="tnum font-mono text-[11.5px] text-muted">
                      {/*
                        Un module dont le plan ne chiffre aucun seuil affiche ce
                        qu'il totalise, sans barre : annoncer « 6 / 0 » serait
                        faux, le seuil vivant sur le module parent.
                      */}
                      {resultat.parModule[m.code] ?? 0}
                      {m.minEcts > 0 ? ` / ${m.minEcts}` : ""} ECTS
                      {m.kind === "all_required" ? T.obligatoire : ""}
                    </p>
                  </div>
                  {m.note && (
                    <p className="mt-1 max-w-[70ch] text-[12.5px] text-muted">{m.note}</p>
                  )}

                  <ul className="mt-4 grid gap-1.5">
                    {(cours ?? []).map((c) => {
                      const pris = selection.has(c.id);
                      return (
                        <li key={c.id}>
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3
                              transition-colors duration-150 ease-[var(--ease-out-std)]
                              ${
                                pris
                                  ? "border-unil-400 bg-unil-100"
                                  : "border-line bg-white hover:border-line-2 hover:bg-surface-2"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={pris}
                              onChange={() => basculer(c.id)}
                              className="mt-0.5 size-[17px] shrink-0 accent-[var(--color-unil-400)]"
                            />
                            <span className="min-w-0 flex-1">
                              {/*
                                La saison passe a cote du titre plutot qu'en
                                bout de ligne : c'est la premiere chose qu'on
                                cherche en composant un plan, et noyee dans la
                                liste des metadonnees elle se lisait mal.
                              */}
                              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <span className="text-[14.5px] font-medium leading-snug text-ink">
                                  {c.titre}
                                </span>
                                {/*
                                  Le rang du semestre, pas seulement la saison :
                                  un master de cent vingt credits compte deux
                                  automnes, et savoir lequel change tout.
                                */}
                                <span className="shrink-0 rounded-full border border-line bg-surface-2 px-2 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.04em] text-ink-2">
                                  {libelleColonnes(c.colonnes, langue) ?? T.semestreInconnu}
                                </span>
                              </span>
                              <span className="mt-1 block text-[12px] text-muted">
                                {[
                                  c.enseignants,
                                  langueDuCours(c.langue, langue),
                                  evaluationDuCours(c.evaluation, langue),
                                  c.dureeExamen ? T.examenMinutes(c.dureeExamen) : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                              {/*
                                L'horaire aussi, meme s'il figure deja dans la
                                grille : la grille ne montre que les cours
                                coches, donc c'est le seul endroit ou l'on voit
                                l'horaire d'un cours avant de le prendre.
                              */}
                              <span
                                className={`mt-1 block font-mono text-[11.5px] ${
                                  libelleCreneaux(c, langue) ? "text-unil-400" : "text-muted"
                                }`}
                              >
                                {libelleCreneaux(c, langue) ?? T.horaireNonReleve}
                              </span>
                            </span>
                            <span className="tnum shrink-0 font-mono text-[13px] font-semibold text-ink">
                              {c.ects}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>

                  {/*
                    Le choix de l'orientation. Le deviner d'apres les cours
                    coches serait arbitraire des qu'on en prend dans deux :
                    or le plan accepte justement les cours des autres
                    orientations au titre du module d'accueil, donc il faut
                    savoir laquelle est la sienne pour compter juste.
                  */}
                  {m.choisirUn && (
                    <div className="mt-4 rounded-xl border border-line-2 bg-surface-2 p-4">
                      <h3 className="text-[13.5px] font-semibold text-ink">
                        {T.orientationTitre}
                      </h3>
                      {regles.autresOrientations && (
                        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                          {T.orientationSelonLePlan}{" "}
                          <span className="italic">
                            « {regles.autresOrientations.citation} »
                          </span>
                        </p>
                      )}
                      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                        {T.orientationExplication}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {regles.modules
                          .filter((x) => x.parent === m.code)
                          .map((x) => {
                            const actif = orientation === x.code;
                            return (
                              <button
                                key={x.code}
                                type="button"
                                onClick={() => changerOrientation(actif ? null : x.code)}
                                aria-pressed={actif}
                                className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-medium
                                  transition-colors duration-150 ease-[var(--ease-out-std)] ${
                                    actif
                                      ? "border-unil-400 bg-unil-100 text-unil-500"
                                      : "border-line-2 bg-white text-ink-2 hover:border-unil-400"
                                  }`}
                              >
                                {x.note ? x.note.split(" - ")[0] : nomModule(x, langue)}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/*
                    Le module que le plan autorise a completer hors de son
                    catalogue. Deux masters sur dix seulement : l'encart
                    n'apparait donc que la ou le document l'ecrit, avec sa
                    phrase citee, et jamais ailleurs.
                  */}
                  {regles.externes?.module === m.code && (
                    <div className="mt-4 rounded-xl border border-dashed border-line-2 bg-surface-2 p-4">
                      <h3 className="text-[13.5px] font-semibold text-ink">
                        {T.externesTitre}
                      </h3>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                        {T.externesSelonLePlan}{" "}
                        <span className="italic">« {regles.externes.citation} »</span>
                      </p>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                        {regles.externes.maxEcts !== null
                          ? T.externesPlafond(regles.externes.maxEcts)
                          : T.externesSansPlafond}{" "}
                        {T.externesAccord}
                      </p>
                      <label className="mt-3 flex items-center gap-3">
                        <span className="text-[12.5px] text-ink-2">{T.externesChamp}</span>
                        <input
                          type="number"
                          min={0}
                          max={regles.externes.maxEcts ?? 120}
                          step={1}
                          inputMode="numeric"
                          value={externes}
                          onChange={(e) => changerExternes(Number(e.target.value))}
                          className="tnum w-[76px] rounded-lg border border-line-2 bg-white px-3 py-1.5
                            text-[13px] font-mono text-ink outline-none
                            transition-colors duration-150 ease-[var(--ease-out-std)]
                            focus:border-unil-400"
                        />
                      </label>
                    </div>
                  )}
                </section>
              );
            })}
        </div>

        {parModule.size === 0 && (
          <p className="mt-10 text-center text-[14px] text-muted">
            {T.aucunResultat(recherche)}
          </p>
        )}
      </div>

      {/* ---------------- le rail de credits ---------------- */}
      {/*
        Le rail est plus haut que la fenetre des qu'un master a beaucoup de
        modules : colle en haut, sa fin restait hors de portee et il fallait
        descendre toute la page pour la voir. Il defile donc dans sa propre
        hauteur. `overscroll-contain` evite qu'arrive en bas du rail, la roulette
        emporte la page entiere.
      */}
      <aside
        ref={rail}
        className="min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)]
          lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
      >
        <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(10,31,48,0.05),0_14px_40px_-28px_rgba(10,31,48,0.5)]">
          <div className="flex items-baseline justify-between">
            <span className="text-[12.5px] text-muted">{T.tonPlan}</span>
            <span className="tnum font-mono text-[28px] font-semibold tracking-[-0.02em] text-ink">
              {resultat.total}
              <span className="text-[16px] text-muted"> / {regles.totalEcts}</span>
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {feuilles.map((m) => (
              <Jauge
                key={m.code}
                nom={nomModule(m, langue)}
                obtenu={resultat.parModule[m.code] ?? 0}
                requis={m.minEcts}
              />
            ))}
          </div>

          {/*
            Les verifications changent a chaque case cochee. Sans region
            annoncee, un lecteur d'ecran ne dit rien : l'etudiant coche, et
            l'avertissement qui est la raison d'etre du site passe inapercu.
            « polite » attend une pause plutot que de couper la lecture en
            cours, ce qui convient a une liste qui se met a jour souvent.
          */}
          <div className="mt-6 grid gap-2" aria-live="polite" aria-atomic="false">
            {resultat.diagnostics.length === 0 && (
              <p className="text-[12.5px] text-muted">{T.cocheDesCours}</p>
            )}
            {resultat.diagnostics.map((x, i) => (
              <div
                key={`${x.code}-${i}`}
                className={`rounded-lg px-3 py-2 text-[12.5px] leading-snug ${
                  x.niveau === "erreur"
                    ? "bg-warn-soft text-warn"
                    : x.niveau === "ok"
                      ? "bg-ok-soft text-ok"
                      : "bg-unil-100 text-unil-500"
                }`}
              >
                {messageDiagnostic(x, regles, langue)}
                {/*
                  Un chevauchement ne se resout pas tout seul : il faut
                  renoncer a l'un des deux cours. Le bouton ouvre la comparaison
                  plutot que de trancher a la place de l'etudiant, car le choix
                  depend de ce que chaque renoncement coute en credits.
                */}
                {x.code === "chevauchement" && (
                  <button
                    type="button"
                    onClick={() => setArbitrage(x)}
                    className="mt-1.5 block font-medium underline underline-offset-2
                      transition-opacity duration-150 ease-[var(--ease-out-std)] hover:opacity-70
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warn"
                  >
                    {T.resoudre}
                  </button>
                )}
              </div>
            ))}
          </div>

          {recu && (
            <p className="mt-6 rounded-lg bg-unil-100 px-3 py-2 text-[12px] leading-snug text-unil-500">
              {T.planRecu}
            </p>
          )}

          {(selection.size > 0 || externes > 0 || orientation) && (
            <div className="mt-6 grid gap-2">
              <button
                onClick={partager}
                className="w-full rounded-lg border border-line-2 py-2 text-[13px]
                  font-medium text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                  hover:border-unil-400 hover:text-unil-400"
              >
                {copie === "copie"
                  ? T.lienCopie
                  : copie === "echec"
                    ? T.lienEchec
                    : T.partager}
              </button>
              <button
                onClick={toutDecocher}
                className="w-full rounded-lg border border-line-2 py-2 text-[13px]
                  font-medium text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                  hover:border-muted hover:bg-surface-2"
              >
                {T.toutDecocher}
              </button>
            </div>
          )}
        </div>

        {/* la mascotte s'inquiete quand quelque chose ne joue pas */}
        <div className="mt-6 flex items-center gap-4 px-2">
          <Mascotte
            taille={72}
            className={erreurs.length ? "text-warn" : "text-unil-400"}
            titre={
              erreurs.length
                ? T.mascotteAlerte
                : T.mascotteNormale
            }
          />
          <p className="text-[12px] leading-snug text-muted">
            {erreurs.length
              ? T.aRegler(erreurs.length)
              : selection.size
                ? T.rienASignaler
                : T.jeVerifie}
          </p>
        </div>

        <p className="mt-6 px-2 text-[11.5px] leading-relaxed text-muted">
          {catalogue.some((c) => c.horaireConnu)
            ? T.noteAvecHoraires
            : T.noteSansHoraires}
          <a
            href="https://applicationspub.unil.ch/interpub/noauth/php/Ud/index.php?v_ueid=173&v_langue=fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-unil-400 underline underline-offset-2"
          >
            {T.catalogueOfficiel}
          </a>
          .
        </p>
      </aside>

      {arbitrage && (
        <Arbitrage
          chevauchement={arbitrage}
          catalogue={catalogue}
          regles={regles}
          selection={selection}
          langue={langue}
          onEnlever={(id) => {
            basculer(id);
            setArbitrage(null);
          }}
          onFermer={() => setArbitrage(null)}
        />
      )}

      {/* ---------------- le resume colle en bas, sur petit ecran ---------------- */}
      <div
        aria-hidden={railVu}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur transition-[transform,opacity] duration-300 lg:hidden ${
          railVu ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={() => rail.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-[0.08em] text-muted">
              {T.tonPlan}
            </span>
            <span
              className={`block truncate text-[12.5px] ${
                erreurs.length ? "text-warn" : "text-muted"
              }`}
            >
              {erreurs.length
                ? T.aReglerCourt(erreurs.length)
                : selection.size
                  ? T.rienASignalerCourt
                  : T.cocheUnCours}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="tnum font-mono text-[20px] font-semibold tracking-[-0.02em] text-ink">
              {resultat.total}
              <span className="text-[13px] text-muted"> / {regles.totalEcts}</span>
            </span>
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full border border-line text-[12px] text-muted"
            >
              ↑
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
