# -*- coding: utf-8 -*-
"""
Découpe les fiches de cours officielles de l'UNIL en données exploitables.

La récolte, faite par tools_fiches_recolte.mjs, dépose le texte brut de chaque
page dans sources-brutes/fiches/fiches.json, qui n'est pas versionné : ce sont
les pages de l'UNIL, le dépôt ne les redistribue pas. Ce script en tire les
seuls faits, qui eux se citent librement : prérequis, évaluation, langue,
crédits, salle, cadence, rattachement officiel aux modules, lien Moodle.

Le texte de présentation, lui, n'est jamais recopié. Il sert de matière à un
résumé écrit à part, dans nos propres mots, et le site renvoie vers la fiche
officielle pour le reste. Voir docs/SOURCES.md.

    python tools_fiches.py                 découpe et écrit sources-brutes/fiches/decoupe.json
    python tools_fiches.py --rapport       montre ce qui n'a pas été reconnu

Le découpage ne devine rien. Une section absente reste absente, et le rapport
dit lesquelles manquent : mieux vaut un champ vide qu'un champ inventé.
"""
from __future__ import annotations

import difflib
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

ICI = os.path.dirname(os.path.abspath(__file__))
BRUT = os.path.join(ICI, "sources-brutes", "fiches", "fiches.json")
PROGRAMMES = os.path.join(ICI, "data", "programmes")
# Le découpage reste dans sources-brutes, qui n'est pas versionné : il contient
# encore la prose de l'UNIL mot pour mot. Ce qui part dans data/, et donc dans
# le dépôt public, est assemblé par tools_fiches_publier.py, qui ne garde que
# les faits et les résumés écrits pour le site.
SORTIE = os.path.join(ICI, "sources-brutes", "fiches", "decoupe.json")

BASE_UNIL = "https://applicationspub.unil.ch/interpub/noauth/php/Ud/ficheCours.php"

# Les intitulés de section, dans les deux langues. Une section court jusqu'au
# prochain intitulé connu : c'est la seule façon fiable de la borner, la page
# n'ayant aucun balisage exploitable une fois passée en texte.
SECTIONS = {
    "objectif": ["Objectif", "Objectives", "Objective"],
    "contenu": ["Contenu", "Content"],
    "evaluation": ["Evaluation", "Évaluation", "Assessment"],
    "prerequis": [
        "Exigences du cursus d'études",
        "Study programme requirements",
        "Prérequis",
        "Prerequisites",
    ],
    "bibliographie": ["Bibliographie", "Bibliography"],
    "complement": ["Informations supplémentaires", "Additional information"],
}

# Ce qui borne une section sans en ouvrir une : en-têtes de tableaux et pied de
# page. Sans eux, la bibliographie avalerait tout ce qui la suit.
BORNES = [
    "Utilisation\tCode faculté\tStatut\tCrédits",
    "Use context\tFaculty code\tStatus\tCredits",
    "Date\tLieu\tRemarque\tThématique\tIntervenant(s)",
    "Date\tLocation\tNotice\tTopics\tLecturer(s)",
    "PARTENAIRES",
    "PARTNERS",
]

DEBUT = ("Fiche de cours", "Card-index course")


def plier(s: str) -> str:
    """Un titre réduit à ce qui permet de le reconnaître d'une source à l'autre."""
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower()
    s = re.sub(r"\(.*?\)", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def _etiquettes() -> dict[str, str]:
    """Chaque intitulé connu, associé au champ qu'il ouvre."""
    out = {}
    for champ, noms in SECTIONS.items():
        for n in noms:
            out[n] = champ
    for b in BORNES:
        out[b] = ""  # ferme la section courante sans en ouvrir d'autre
    return out


ETIQUETTES = _etiquettes()


def decouper(texte: str) -> dict:
    """Le corps de la fiche, section par section."""
    lignes = texte.split("\n")

    # tout ce qui précède « Fiche de cours » est de la navigation
    depart = 0
    for i, l in enumerate(lignes):
        if l.strip() in DEBUT:
            depart = i + 1
            break

    out: dict[str, list[str]] = defaultdict(list)
    courant = None
    for l in lignes[depart:]:
        t = l.strip()
        if t in ETIQUETTES:
            courant = ETIQUETTES[t] or None
            continue
        if courant:
            out[courant].append(l.rstrip())

    return {k: re.sub(r"\n{3,}", "\n\n", "\n".join(v)).strip() for k, v in out.items()}


def entete(texte: str) -> dict:
    """Les faits que la page écrit en clair, hors sections."""
    faits: dict = {}

    m = re.search(r"Responsable\(s\)\s*:\s*(.+)", texte)
    if not m:
        m = re.search(r"Person in charge\s*:\s*(.+)", texte)
    if m:
        faits["responsables"] = m.group(1).strip()

    m = re.search(r"Langue\(s\) d'enseignement\s*:\s*(.+)", texte) or re.search(
        r"Teaching language\(s\)\s*:\s*(.+)", texte
    )
    if m:
        faits["langues"] = m.group(1).strip()

    m = re.search(r"^Crédits\s*:\s*([\d.]+)", texte, re.M) or re.search(
        r"^Credits\s*:\s*([\d.]+)", texte, re.M
    )
    if m and float(m.group(1)) > 0:
        faits["credits"] = float(m.group(1))

    m = re.search(r"(\d+)\s+heures? par semaine", texte) or re.search(
        r"(\d+)\s+hours? per week", texte
    )
    if m:
        faits["heuresParSemaine"] = int(m.group(1))

    saisons = []
    if re.search(r"Semestre d'automne|Autumn semester", texte):
        saisons.append("automne")
    if re.search(r"Semestre de printemps|Spring semester", texte):
        saisons.append("printemps")
    if saisons:
        faits["saisons"] = saisons

    m = re.search(r"(https?://moodle[^\s]+)", texte)
    if m:
        faits["moodle"] = m.group(1).rstrip(".,;")

    return faits


def creneaux(texte: str) -> list[dict]:
    """Le tableau des horaires : jour, heure, salle, groupe, intervenant."""
    out = []
    for l in texte.split("\n"):
        # « 2025/2026 : Lundi 12:30-14:00 (Hebdomadaire)\tAmphipôle/A\t... »
        if not re.match(r"^\s*\d{4}/\d{4}\s*:", l):
            continue
        cases = [c.strip() for c in l.split("\t")]
        quand = cases[0]
        m = re.search(
            r":\s*(\S+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(?:\((.+?)\))?", quand
        )
        if not m:
            continue
        out.append(
            {
                "jour": m.group(1),
                "debut": m.group(2),
                "fin": m.group(3),
                "cadence": (m.group(4) or "").lower() or None,
                "lieu": cases[1] if len(cases) > 1 and cases[1] else None,
                "note": cases[2] if len(cases) > 2 and cases[2] else None,
                "intervenants": cases[4] if len(cases) > 4 and cases[4] else None,
            }
        )
    return out


def rattachements(texte: str) -> list[dict]:
    """
    Le tableau « Utilisation », qui dit à quel module de quel master le cours
    appartient officiellement. C'est de quoi vérifier nos propres plans.
    """
    out = []
    dedans = False
    for l in texte.split("\n"):
        t = l.strip()
        if t.startswith("Utilisation\t") or t.startswith("Utilisation "):
            dedans = True
            continue
        if not dedans:
            continue
        if not t or t in ("PARTENAIRES", "PARTNERS"):
            break
        cases = [c.strip() for c in l.split("\t")]
        if not cases[0]:
            continue
        e = {"programme": cases[0]}
        if len(cases) > 2 and cases[2]:
            e["statut"] = cases[2]
        if len(cases) > 3 and cases[3]:
            try:
                e["credits"] = float(cases[3])
            except ValueError:
                pass
        out.append(e)
    return out


def lire_brut() -> dict:
    if not os.path.exists(BRUT):
        sys.exit(f"récolte introuvable : {BRUT}\nlance d'abord tools_fiches_recolte.mjs")
    with open(BRUT, encoding="utf-8") as f:
        return json.load(f)


def titres_du_site() -> dict[str, str]:
    """Les titres des cours que le site affiche, pliés pour la comparaison."""
    out = {}
    for nom in sorted(os.listdir(PROGRAMMES)):
        if not nom.endswith(".json"):
            continue
        with open(os.path.join(PROGRAMMES, nom), encoding="utf-8") as f:
            for c in json.load(f)["courses"]:
                out.setdefault(plier(c["title"]), c["title"])
    return out


def construire() -> tuple[dict, Counter]:
    brut = lire_brut()
    connus = titres_du_site()
    fiches, manques = {}, Counter()

    cles = list(connus)
    approches: list[tuple[str, str]] = []

    for ens, paquet in brut.items():
        cle = plier(paquet.get("titre", ""))
        if cle in connus:
            titre = connus[cle]
        else:
            # Le titre exact a echoue. Nos plans viennent de PDF, et l'extraction
            # y laisse des fautes : « restucturation » sans son r, un nom
            # d'enseignant colle au titre. On rapproche donc, mais on ne devine
            # pas : tout rapprochement approche est imprime pour relecture.
            proches = difflib.get_close_matches(cle, cles, n=1, cutoff=0.88)
            titre = connus[proches[0]] if proches else None
            if titre:
                approches.append((paquet.get("titre", ""), titre))
        if titre is None:
            manques["titre hors du site"] += 1
            continue

        entree = {
            "id": ens,
            "titre": titre,
            "source": f"{BASE_UNIL}?v_enstyid={ens}&v_ueid=173&v_etapeid1={paquet.get('etape','')}",
        }

        for langue in ("fr", "en"):
            texte = paquet.get(langue)
            if not texte:
                manques[f"page {langue} absente"] += 1
                continue
            corps = decouper(texte)
            bloc = {k: v for k, v in corps.items() if v}
            if langue == "fr":
                entree.update(entete(texte))
                cr = creneaux(texte)
                if cr:
                    entree["creneaux"] = cr
                ra = rattachements(texte)
                if ra:
                    entree["rattachements"] = ra
            entree[langue] = bloc

        # L'UNIL ne remplit souvent la description que dans une langue, et pas
        # toujours celle de l'enseignement. Ce n'est donc pas une anomalie : ce
        # qui compte est qu'au moins une des deux pages décrive le cours, le
        # résumé se rédigeant ensuite dans les deux langues à partir de là.
        decrit = [
            lg
            for lg in ("fr", "en")
            if entree.get(lg, {}).get("contenu") or entree.get(lg, {}).get("objectif")
        ]
        if not decrit:
            manques["aucune description, ni fr ni en"] += 1
        elif len(decrit) == 1:
            manques[f"decrit seulement en {decrit[0]}"] += 1

        fiches[ens] = entree

    return fiches, manques, approches


def main() -> None:
    if "--lot" in sys.argv:
        imprimer_lot(int(sys.argv[sys.argv.index("--lot") + 1]))
        return
    if "--reste" in sys.argv:
        reste = a_rediger()
        print(f"{len(reste)} fiches attendent encore un resume")
        return

    fiches, manques, approches = construire()
    rapport = "--rapport" in sys.argv

    with open(SORTIE, "w", encoding="utf-8") as f:
        json.dump(fiches, f, ensure_ascii=False, indent=1, sort_keys=True)

    def a(v, champ):
        return any(v.get(lg, {}).get(champ) for lg in ("fr", "en"))

    decrites = sum(1 for v in fiches.values() if a(v, "contenu") or a(v, "objectif"))
    print(f"{len(fiches)} fiches écrites dans sources-brutes/fiches/decoupe.json")
    print(f"  décrites             : {decrites}")
    print(f"  avec des prérequis   : {sum(1 for v in fiches.values() if a(v, 'prerequis'))}")
    print(f"  avec une évaluation  : {sum(1 for v in fiches.values() if a(v, 'evaluation'))}")
    print(f"  avec une bibliographie : {sum(1 for v in fiches.values() if a(v, 'bibliographie'))}")
    print(f"  avec des créneaux    : {sum(1 for v in fiches.values() if v.get('creneaux'))}")
    print(f"  avec un rattachement : {sum(1 for v in fiches.values() if v.get('rattachements'))}")

    if approches:
        print(f"\n{len(approches)} titres rapproches, a relire (fiche UNIL -> notre titre) :")
        for officiel, notre in sorted(approches):
            print(f"  {officiel}")
            print(f"    -> {notre}")

    if rapport and manques:
        print("\nce qui manque :")
        for k, n in manques.most_common():
            print(f"  {n:4}  {k}")



# --------------------------------------------------------------------- lots
#
# Les résumés ne sont pas produits par une machine appelée à l'exécution : ils
# sont écrits une fois, relus, et livrés en dur. Ce mode imprime la matière
# d'un lot de fiches, sans le décor de la page, pour qu'on puisse la lire et
# rédiger. Chaque fiche est identifiée par son numéro d'enseignement UNIL, qui
# sert de clef dans data/cours-resumes.json.
#
#     python tools_fiches.py --lot 0        le premier paquet de 30
#     python tools_fiches.py --reste        combien il en manque encore

TAILLE_DU_LOT = 30
RESUMES = os.path.join(ICI, "data", "cours-resumes.json")


def charger_resumes() -> dict:
    if not os.path.exists(RESUMES):
        return {}
    with open(RESUMES, encoding="utf-8") as f:
        return json.load(f).get("resumes", {})


def a_rediger() -> list[dict]:
    """
    Les cours décrits qui n'ont pas encore de résumé, dans un ordre stable.

    Un même cours a plusieurs fiches, une par programme qui l'accueille, et
    elles portent des numéros différents pour un titre identique. On compte
    donc par titre : écrire deux fois le même résumé serait du travail perdu,
    et le site n'affiche de toute façon qu'une entrée par titre.
    """
    with open(SORTIE, encoding="utf-8") as f:
        fiches = json.load(f)
    faits = charger_resumes()
    couverts = {v["titre"] for k, v in fiches.items() if k in faits}

    reste, vus = [], set()
    for k, v in sorted(fiches.items()):
        titre = v["titre"]
        if k in faits or titre in couverts or titre in vus:
            continue
        if not any(
            v.get(lg, {}).get("contenu") or v.get(lg, {}).get("objectif") for lg in ("fr", "en")
        ):
            continue
        vus.add(titre)
        reste.append(v)
    return reste


def imprimer_lot(n: int) -> None:
    reste = a_rediger()
    lot = reste[n * TAILLE_DU_LOT : (n + 1) * TAILLE_DU_LOT]
    print(f"LOT {n} — {len(lot)} fiches, {len(reste)} restantes en tout\n")
    for v in lot:
        print("=" * 72)
        print(f"CLEF {v['id']} | {v['titre']}")
        if v.get("langues"):
            print(f"langue : {v['langues']}")
        if v.get("credits"):
            print(f"credits : {v['credits']}")
        for lg in ("fr", "en"):
            bloc = v.get(lg, {})
            for champ in ("objectif", "contenu", "prerequis"):
                t = bloc.get(champ)
                if not t:
                    continue
                # au delà, c'est du remplissage : le résumé n'en a pas besoin
                print(f"\n[{lg}.{champ}] {t[:520]}")
            if bloc.get("objectif") or bloc.get("contenu"):
                break  # une seule langue suffit à écrire les deux résumés
        print()

if __name__ == "__main__":
    main()
