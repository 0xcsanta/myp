# -*- coding: utf-8 -*-
"""
Verse un lot de résumés rédigés dans data/cours-resumes.json.

Le fichier de destination porte sa note et sa règle en tête, et l'écraser
entièrement à chaque lot les perdrait. On ne touche donc qu'à la table des
résumés, et on refuse d'écraser un résumé déjà écrit : un doublon est une
erreur de lot, pas une correction, et il doit se voir.

    python tools_fiches_verser.py chemin/du/lot.json
"""
from __future__ import annotations

import io
import json
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
CIBLE = os.path.join(ICI, "data", "cours-resumes.json")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage : python tools_fiches_verser.py <lot.json>")

    with io.open(sys.argv[1], encoding="utf-8") as f:
        lot = json.load(f)
    with io.open(CIBLE, encoding="utf-8") as f:
        cible = json.load(f)

    deja, ajoutes = [], 0
    for clef, valeur in lot.items():
        if clef in cible["resumes"]:
            deja.append(clef)
            continue
        for langue in ("fr", "en"):
            bloc = valeur.get(langue) or {}
            if not bloc.get("quoi") or not bloc.get("programme"):
                sys.exit(f"{clef} : il manque « quoi » ou « programme » en {langue}")
        cible["resumes"][clef] = valeur
        ajoutes += 1

    cible["resumes"] = dict(sorted(cible["resumes"].items()))
    with io.open(CIBLE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cible, f, ensure_ascii=False, indent=1)
        f.write("\n")

    print(f"{ajoutes} resumes verses, {len(cible['resumes'])} au total")
    if deja:
        print(f"deja presents, non ecrases : {', '.join(deja)}")


if __name__ == "__main__":
    main()
