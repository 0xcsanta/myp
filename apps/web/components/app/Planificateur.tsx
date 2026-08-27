"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Cours, Master, Regles } from "@/lib/donnees";
import { libelleSemestre, semestresDe } from "@/lib/semestres";
import type { Langue } from "@/lib/langues";
import { textes } from "@/lib/textes";
import { nomCourt } from "@/lib/nomMaster";
import { evaluationDuCours, langueDuCours } from "@/lib/codes";
import { libelleCreneaux } from "@/lib/creneaux";
import { anneeAcademique, libelleSaison } from "@/lib/semestres";
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
  const pct = Math.min(100, requis ? Math.round((obtenu / requis) * 100) : 0);
  const etat = obtenu > requis ? "trop" : obtenu === requis ? "fait" : "";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-ink">{nom}</span>
        <span className="tnum font-mono text-[11.5px] text-muted">
          {obtenu} / {requis}
        </span>
      </div>
      <div className="mt-1.5 h-[7px] overflow-hidden rounded-full bg-line/70">
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
  const [pret, setPret] = useState(false);
  const cle = `myp:${master.slug}`;

  /* reprise : l'adresse d'abord, le stockage local ensuite */
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("p");
    const source = url ?? window.localStorage.getItem(cle) ?? "";
    setSelection(decoder(source, catalogue));
    setPret(true);
  }, [cle, catalogue]);

  /* sauvegarde */
  useEffect(() => {
    if (!pret) return;
    const code = encoder(selection, catalogue);
    try {
      window.localStorage.setItem(cle, code);
    } catch {
      /* navigation privee : tant pis, l'adresse suffit */
    }
    const u = new URL(window.location.href);
    if (code) u.searchParams.set("p", code);
    else u.searchParams.delete("p");
    window.history.replaceState(null, "", u);
  }, [selection, pret, cle, catalogue]);

  const resultat = useMemo(
    () => valider(selection, regles, catalogue),
    [selection, regles, catalogue],
  );

  const basculer = (id: string) =>
    setSelection((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

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

  const dessine = (s: string) =>
    dessinerHoraire(avecHoraire, s, nomCourt(master, langue), enConflit, langue);
  /*
   * Le nom du fichier est translitteré plutôt que filtré : `\w` ignore les
   * accents, donc « Systèmes d'information » devenait « Systmes dinformation ».
   */
  const nomFichier = (s: string) =>
    `MYP ${nomCourt(master, langue)} ${libelleSemestre(s, langue)}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/['’]/g, " ")
      .replace(/[^A-Za-z0-9 \-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const feuilles = regles.modules.filter(
    (m) => !regles.modules.some((x) => x.parent === m.code),
  );

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
        {avecHoraire.length > 0 && (
          <div className="mb-10 grid grid-cols-1 gap-6">
            {semestres.map((s) => (
              <div key={s} className="min-w-0">
                <h2 className="font-display text-[20px] tracking-[-0.02em] text-ink">
                  {libelleSemestre(s, langue)}
                </h2>
                {/*
                  Une annee academique va de l'automne d'une annee civile au
                  printemps de la suivante. Le releve d'aout 2026 porte donc un
                  automne a venir et un printemps deja termine, celui de
                  l'annee precedente. Le dire evite qu'un etudiant qui prepare
                  2026-2027 prenne ce printemps la pour le sien.
                */}
                <p
                  className={`mb-3 mt-1 text-[11.5px] leading-relaxed ${
                    anneeAcademique(s) === ANNEE_VISEE ? "text-muted" : "text-warn"
                  }`}
                >
                  {anneeAcademique(s) === ANNEE_VISEE
                    ? T.semestreAVenir(anneeAcademique(s))
                    : T.semestrePasse(anneeAcademique(s), ANNEE_VISEE)}
                </p>
                <GrilleHoraire
                  cours={avecHoraire}
                  semestre={s}
                  enConflit={enConflit}
                  langue={langue}
                />
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-2">
              {semestres.map((s) => (
                <span key={s} className="contents">
                  <button
                    onClick={() => exporterPng(dessine(s), nomFichier(s))}
                    className="rounded-lg border border-line-2 px-3 py-1.5 text-[12.5px] font-medium
                      text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                      hover:border-unil-400 hover:text-unil-400"
                  >
                    PNG · {libelleSemestre(s, langue)}
                  </button>
                  <button
                    onClick={() => exporterPdf(dessine(s), nomFichier(s))}
                    className="rounded-lg border border-line-2 px-3 py-1.5 text-[12.5px] font-medium
                      text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                      hover:border-unil-400 hover:text-unil-400"
                  >
                    PDF · {libelleSemestre(s, langue)}
                  </button>
                </span>
              ))}
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
            .filter((m) => parModule.has(m.code))
            .map((m) => {
              const cours = parModule.get(m.code)!;
              return (
                <section key={m.code}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h2 className="font-display text-[22px] tracking-[-0.02em] text-ink">
                      {nomModule(m, langue)}
                    </h2>
                    <p className="tnum font-mono text-[11.5px] text-muted">
                      {resultat.parModule[m.code] ?? 0} / {m.minEcts} ECTS
                      {m.kind === "all_required" ? T.obligatoire : ""}
                    </p>
                  </div>
                  {m.note && (
                    <p className="mt-1 max-w-[70ch] text-[12.5px] text-muted">{m.note}</p>
                  )}

                  <ul className="mt-4 grid gap-1.5">
                    {cours.map((c) => {
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
                                <span className="shrink-0 rounded-full border border-line bg-surface-2 px-2 py-[1px] text-[10.5px] font-semibold uppercase tracking-[0.04em] text-ink-2">
                                  {c.saisons.length
                                    ? c.saisons
                                        .map((x) => libelleSaison(x, langue))
                                        .join(langue === "fr" ? " ou " : " or ")
                                    : T.semestreInconnu}
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

          {selection.size > 0 && (
            <button
              onClick={() => setSelection(new Set())}
              className="mt-6 w-full rounded-lg border border-line-2 py-2 text-[13px]
                font-medium text-ink-2 transition-colors duration-150 ease-[var(--ease-out-std)]
                hover:border-muted hover:bg-surface-2"
            >
              Tout décocher
            </button>
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
