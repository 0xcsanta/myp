# -*- coding: utf-8 -*-
"""
Assemble ce que le site publiera des fiches de cours de l'UNIL.

Deux sources, et la frontière entre les deux est le sujet de ce fichier.

D'un côté sources-brutes/fiches/decoupe.json, qui contient encore la prose de
l'UNIL mot pour mot. Ce dossier n'est pas versionné, et rien de ce texte ne
part dans data/.

De l'autre data/cours-resumes.json, écrit pour ce site, dans nos propres mots.

Ce script prend les résumés, y ajoute les seuls faits de la fiche, qui se
citent librement parce qu'ils ne sont l'expression de personne (prérequis,
modalité d'évaluation, bibliographie, langue, crédits, salle, cadence, lien
Moodle), et écrit data/cours-details.json.

Chaque entrée porte l'adresse de sa fiche officielle. Le site l'affiche
toujours, et le bot a l'obligation de la donner à chaque réponse : ce qui est
publié ici est une aide à la lecture, la fiche de l'UNIL fait seule foi.

    python tools_fiches_publier.py
"""
from __future__ import annotations

import io
import re
import json
import os

ICI = os.path.dirname(os.path.abspath(__file__))
DECOUPE = os.path.join(ICI, "sources-brutes", "fiches", "decoupe.json")
RESUMES = os.path.join(ICI, "data", "cours-resumes.json")
SORTIE = os.path.join(ICI, "data", "cours-details.json")

# Les faits repris tels quels de la fiche. Tout le reste, c'est-à-dire
# l'objectif et le contenu, est de la prose : il ne franchit jamais cette
# ligne, le résumé le remplace.
FAITS_PAR_LANGUE = ("prerequis", "evaluation", "bibliographie")
FAITS_COMMUNS = (
    "langues",
    "credits",
    "heuresParSemaine",
    "saisons",
    "responsables",
    "moodle",
    "creneaux",
    "rattachements",
)


def decouper_evaluation(texte: str) -> dict | None:
    """
    Le bloc d'évaluation, en clair.

    La page le rend sans séparateur, « Exam : Oral 0h20/0h20Documentation :
    LimitedCalculator : Not allowed », parce que les étiquettes sont des
    cellules de tableau que la mise à plat colle bout à bout. On les rétablit,
    et on jette les paragraphes qui avertissent d'un éventuel passage à l'écrit
    « selon l'évolution du Covid » : ils datent de 2020 et ne disent plus rien
    à un étudiant de 2026.
    """
    if not texte:
        return None

    ETIQUETTES = [
        ("mode", r"(?:Exam|Examen)\s*:"),
        ("documentation", r"Documentation\s*:"),
        ("calculatrice", r"(?:Calculator|Calculatrice)\s*:"),
        ("detail", r"(?:Evaluation|Évaluation)\s*:"),
    ]

    def une_session(bloc: str) -> dict:
        coupe = bloc
        for _, motif in ETIQUETTES:
            coupe = re.sub(f"({motif})", r"\n\1", coupe)
        out: dict[str, str] = {}
        champ = None
        for ligne in coupe.split("\n"):
            t = ligne.strip()
            if not t:
                continue
            for nom, motif in ETIQUETTES:
                m = re.match(f"^{motif}", t)
                if m:
                    champ = nom
                    t = t[m.end() :].strip()
                    break
            if champ and t:
                out[champ] = (out.get(champ, "") + " " + t).strip()

        if "detail" in out:
            d = re.sub(
                r"(?:WARNING|ATTENTION)\s*:?\s*(?:Depending on the evolution|Selon l'évolution)"
                r".*?(?:examination\.|écrit\.|written examination\.)",
                "",
                out["detail"],
                flags=re.S | re.I,
            )
            d = re.sub(r"\s{2,}", " ", d).strip()
            if d:
                out["detail"] = d
            else:
                out.pop("detail")
        return {k: v for k, v in out.items() if v}

    # Première tentative et rattrapage sont deux blocs successifs, aux
    # conditions parfois différentes. Les fondre donnerait « Oral 0h20 Oral
    # 0h20 » et une note de 85 pour cent qui vaudrait 100 pour cent.
    parts = re.split(r"(?:First try|Premi[èe]re tentative|Retake|Rattrapage)", texte)
    noms = re.findall(r"First try|Premi[èe]re tentative|Retake|Rattrapage", texte)

    if not noms:
        seule = une_session(texte)
        return {"premiere": seule} if seule else None

    out: dict[str, dict] = {}
    for nom, bloc in zip(noms, parts[1:]):
        clef = "rattrapage" if re.match(r"Retake|Rattrapage", nom) else "premiere"
        session = une_session(bloc)
        if session and clef not in out:
            out[clef] = session
    return out or None


def main() -> None:
    with io.open(DECOUPE, encoding="utf-8") as f:
        fiches = json.load(f)
    with io.open(RESUMES, encoding="utf-8") as f:
        resumes = json.load(f)["resumes"]

    sortie, sans_resume = {}, 0
    for ens, fiche in fiches.items():
        resume = resumes.get(ens)
        if not resume:
            sans_resume += 1

        # Une fiche sans resume est publiee quand meme. Le lien vers la page
        # officielle est ce qui compte le plus, et le faire attendre qu'un
        # resume soit ecrit priverait l'etudiant du seul document qui fasse
        # foi. Les prerequis, les salles et l'evaluation sont dans le meme cas.
        entree = {
            "titre": fiche["titre"],
            "source": fiche["source"],
        }
        if resume:
            entree["resume"] = resume
        for champ in FAITS_COMMUNS:
            if fiche.get(champ):
                entree[champ] = fiche[champ]

        faits: dict = {}
        for langue in ("fr", "en"):
            bloc = fiche.get(langue, {})
            pris = {c: bloc[c] for c in FAITS_PAR_LANGUE if bloc.get(c)}
            if "evaluation" in pris:
                decoupee = decouper_evaluation(pris.pop("evaluation"))
                if decoupee:
                    pris["evaluation"] = decoupee
            if pris:
                faits[langue] = pris
        # Un fait n'existant souvent que dans une langue, l'autre reprend la
        # version disponible : mieux vaut un prérequis en anglais sur la page
        # française que pas de prérequis du tout.
        for langue, autre in (("fr", "en"), ("en", "fr")):
            for champ in FAITS_PAR_LANGUE:
                if champ not in faits.get(langue, {}) and champ in faits.get(autre, {}):
                    faits.setdefault(langue, {})[champ] = faits[autre][champ]
        if faits:
            entree["faits"] = faits

        # Un même cours a plusieurs fiches, une par programme qui l'accueille,
        # et elles ne sont pas également remplies. Écraser à l'aveugle faisait
        # perdre le résumé dès qu'une fiche plus pauvre passait après lui. On
        # fusionne donc : le résumé l'emporte sur son absence, et chaque champ
        # manquant se complète depuis l'autre fiche.
        deja = sortie.get(fiche["titre"])
        if deja is None:
            sortie[fiche["titre"]] = entree
            continue
        for champ, valeur in entree.items():
            if champ == "faits":
                for langue, bloc in valeur.items():
                    for nom, v in bloc.items():
                        deja.setdefault("faits", {}).setdefault(langue, {}).setdefault(nom, v)
            elif not deja.get(champ):
                deja[champ] = valeur

    with io.open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(sortie, f, ensure_ascii=False, indent=1, sort_keys=True)

    print(f"{len(sortie)} cours publies dans data/cours-details.json")
    print(f"{sans_resume} fiches en attente d'un resume")


if __name__ == "__main__":
    main()
