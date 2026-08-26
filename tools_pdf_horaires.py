# -*- coding: utf-8 -*-
"""
Lit les PDF d'horaire de l'UNIL et en tire les creneaux, par geometrie.

Le PDF n'est pas une liste mais une grille : les jours en colonnes, les heures
en lignes, et chaque cours est un rectangle de couleur pose dessus. Extraire le
texte naivement melange tout. On lit donc les rectangles :

  - la position horizontale du rectangle donne le jour ;
  - sa position verticale donne l'heure de debut et de fin ;
  - les mots qu'il contient donnent l'intitule, la salle et la cadence.

L'echelle des heures est calibree sur les etiquettes de la gouttiere, pas
supposee : elle change selon la plage horaire du programme.

    python tools_pdf_horaires.py            analyse tout horaires/*.pdf
    python tools_pdf_horaires.py --brut     ecrit aussi les releves texte
"""
import collections, glob, io, json, os, re, sys, unicodedata
import pdfplumber

DOSSIER = 'horaires'
SORTIE_BRUT = 'data/horaires/brut'

JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
FOND_COURS = (0.8667, 0.9294, 0.9725)   # le bleu pale des blocs de cours


def fold(t):
    n = unicodedata.normalize('NFKD', t or '')
    n = ''.join(c for c in n if not unicodedata.combining(c)).lower()
    return re.sub(r'\s+', ' ', n).strip()


def proche(a, b, tol=0.02):
    """Compare deux couleurs. pdfplumber rend parfois un flottant seul pour un
    gris, parfois un triplet : il faut accepter les deux sans exploser."""
    if not isinstance(a, (list, tuple)) or not isinstance(b, (list, tuple)):
        return False
    return len(a) == len(b) and all(abs(x - y) < tol for x, y in zip(a, b))


# ------------------------------------------------------------------ reperage

def colonnes_jours(page):
    """Bornes horizontales de chaque colonne, deduites des en-tetes de jours."""
    entetes = {}
    for m in page.extract_words():
        if m['text'] in JOURS and m['top'] < 120 and m['text'] not in entetes:
            entetes[m['text']] = (m['x0'] + m['x1']) / 2
    if len(entetes) < 2:
        return {}
    centres = sorted(entetes.items(), key=lambda kv: kv[1])
    pas = (centres[-1][1] - centres[0][1]) / (len(centres) - 1)
    return {nom: (c - pas / 2, c + pas / 2) for nom, c in centres}


def echelle_heures(page):
    """
    Convertit une ordonnee en minutes, par regression sur les heures pleines.

    On ne suppose ni l'origine ni le pas : selon le programme la grille commence
    a 8h ou a 9h, et sa hauteur varie.
    """
    pts = []
    for m in page.extract_words():
        r = re.match(r'^(\d{1,2}):00$', m['text'])
        if r and m['x0'] < 70:
            pts.append((int(r.group(1)) * 60, (m['top'] + m['bottom']) / 2))
    if len(pts) < 3:
        return None
    n = len(pts)
    sx = sum(y for _, y in pts); sy = sum(mn for mn, _ in pts)
    sxy = sum(y * mn for mn, y in pts); sxx = sum(y * y for _, y in pts)
    denom = n * sxx - sx * sx
    if not denom:
        return None
    a = (n * sxy - sx * sy) / denom      # minutes par point
    b = (sy - a * sx) / n
    return lambda y: a * y + b


def arrondi_quart(minutes):
    """Les creneaux de l'UNIL tombent sur des quarts d'heure."""
    return int(round(minutes / 15.0) * 15)


def caler(bornes):
    """
    Trouve le decalage a appliquer a l'echelle des heures.

    Les etiquettes de la gouttiere ne sont pas centrees sur leur trait : mesuree
    sur leur milieu, l'echelle tombe systematiquement a cote, ici de sept
    minutes et demie, ce qui suffit a transformer un cours de 8h30 en cours de
    8h45. Plutot que de coder ce nombre en dur, on cherche le decalage qui aligne
    le mieux TOUTES les bornes de la page sur des quarts d'heure. Le PDF se
    calibre ainsi lui meme, quelle que soit sa mise en page.
    """
    if not bornes:
        return 0.0
    meilleur, score = 0.0, None
    d = -15.0
    while d <= 15.0:
        s = sum(abs((b + d) - round((b + d) / 15.0) * 15) for b in bornes)
        if score is None or s < score:
            meilleur, score = d, s
        d += 0.5
    return meilleur


# ------------------------------------------------------------------- lecture

def entete(page):
    """Semestre et intitule du programme, tels qu'ecrits en tete du PDF."""
    txt = re.sub(r'\s+', ' ', page.extract_text() or '')
    sem = re.search(r'Votre horaire\s*\(([^)]+)\)', txt)
    prog = re.search(r'>\s*(.{10,190}?)(?:\s+commerciales \(HEC\)|\s+Lundi\b)', txt)
    return (sem.group(1).strip() if sem else None,
            re.sub(r'\s+', ' ', prog.group(1)).strip() if prog else None)


def blocs(page):
    """Les rectangles de cours de la page."""
    out = []
    for r in page.rects:
        if not proche(r.get('non_stroking_color'), FOND_COURS):
            continue
        if (r['bottom'] - r['top']) < 8 or (r['x1'] - r['x0']) < 30:
            continue
        if r['top'] < 80:          # le bandeau de titre porte le meme fond
            continue
        out.append(r)
    return out


def texte_du_bloc(page, r):
    mots = [m for m in page.extract_words()
            if m['x0'] >= r['x0'] - 2 and m['x1'] <= r['x1'] + 2
            and m['top'] >= r['top'] - 2 and m['bottom'] <= r['bottom'] + 2]
    lignes = collections.OrderedDict()
    for m in sorted(mots, key=lambda m: (m['top'], m['x0'])):
        cle = next((k for k in lignes if abs(k - m['top']) < 4), round(m['top'], 1))
        lignes.setdefault(cle, []).append(m['text'])
    return ' '.join(' '.join(v) for _, v in sorted(lignes.items()))


SALLE = re.compile(
    r'\b((?:Internef|Anthropole|Amphimax|Amphipole|Amphipôle|Synathlon|Geopolis|Géopolis|'
    r'Batochime|Unithèque|Unitheque|Genopode|Cubotron|Extranef|IDHEAP|Biophore|Amphimax)'
    r'\s*/?\s*[\w.\-]{1,10})', re.I)

CADENCES = [
    (r'tous les 15 jours|toutes les 2 semaines|quinzaine', 'quinzaine'),
    (r'hebdomadaire', 'hebdomadaire'),
    (r'cours bloc|semaine bloc', 'bloc'),
]


def decouper(texte):
    """Separe l'intitule, la salle, la cadence et la note d'un bloc."""
    t = re.sub(r'\s+', ' ', texte).strip()
    t = re.sub(r'^C\s*-\s*', '', t)                  # « C - » = type cours

    cadence = 'irregulier'
    for motif, nom in CADENCES:
        if re.search(motif, t, re.I):
            cadence = nom
            break
    reste = re.sub(r'\b(Hebdomadaire|Tous les 15 jours|Toutes les 2 semaines)\b', '', t, flags=re.I)

    salle = None
    ms = SALLE.search(reste)
    if ms:
        salle = re.sub(r'\s*/\s*', '/', ms.group(1)).strip()
        reste = reste[:ms.start()] + ' | ' + reste[ms.end():]

    morceaux = [p.strip(' -–—|') for p in reste.split('|')]
    tete = morceaux[0] if morceaux else reste
    # « Titre / Débute le 22 septembre » : la note suit la barre oblique
    note = ''
    if ' / ' in tete:
        titre, note = tete.split(' / ', 1)
    else:
        titre = tete
    if len(morceaux) > 1:
        suite = ' '.join(morceaux[1:]).strip(' -–—')
        # l'enseignant suit la salle : on ne le garde pas, le catalogue l'a deja
        note = (note + ' ' + suite).strip() if not re.match(r'^[A-ZÀ-Ý][\w’\'-]+ [A-ZÀ-Ý]', suite) else note
    return titre.strip(' -–—'), salle, cadence, re.sub(r'\s+', ' ', note).strip(' -–—')


def lire_pdf(chemin):
    with pdfplumber.open(chemin) as pdf:
        creneaux, sem, prog = [], None, None
        for page in pdf.pages:
            s, p = entete(page)
            sem = sem or s
            prog = prog or p
            cols = colonnes_jours(page)
            ech = echelle_heures(page)
            if not cols or not ech:
                continue
            rs = blocs(page)
            decalage = caler([ech(r['top']) for r in rs] + [ech(r['bottom']) for r in rs])
            for r in rs:
                centre = (r['x0'] + r['x1']) / 2
                jour = next((j for j, (a, b) in cols.items() if a <= centre <= b), None)
                if not jour:
                    continue
                d = arrondi_quart(ech(r['top']) + decalage)
                f = arrondi_quart(ech(r['bottom']) + decalage)
                if f <= d:
                    continue
                titre, salle, cadence, note = decouper(texte_du_bloc(page, r))
                if not titre:
                    continue
                creneaux.append({'jour': jour, 'debut': f'{d//60:02d}:{d%60:02d}',
                                 'fin': f'{f//60:02d}:{f%60:02d}', 'titre': titre,
                                 'salle': salle, 'cadence': cadence, 'note': note})
    return sem, prog, creneaux


# --------------------------------------------------------------------- main

CODES = [
    (r"systemes d information", 'mscis'), (r'comptabilite', 'msccf'),
    (r'sciences actuarielles', 'mscas'), (r'droit et economie', 'mde'),
    (r'business analytics', 'mscm-business-analytics'),
    (r'comportement|behaviour', 'mscm-behaviour'), (r'marketing', 'mscm-marketing'),
    (r'strategie|strategy', 'mscm-strategy'), (r'\bmanagement\b', 'mscm'),
    (r'\bfinance\b', 'mscf'), (r'\beconomie\b|economics', 'msce'),
]


def slug_de(prog):
    f = fold(prog)
    for motif, s in CODES:
        if re.search(motif, f):
            return s
    return None


def cle_semestre(sem):
    f = fold(sem)
    m = re.search(r'(automne|printemps)\D*(\d{4})', f)
    return f'{m.group(1)}-{m.group(2)}' if m else None


def main():
    par_master = collections.defaultdict(list)
    for chemin in sorted(glob.glob(f'{DOSSIER}/*.pdf')):
        sem, prog, creneaux = lire_pdf(chemin)
        slug, cle = slug_de(prog or ''), cle_semestre(sem or '')
        nom = os.path.basename(chemin)
        if not slug or not cle:
            print(f'{nom:22} NON IDENTIFIE  semestre={sem!r} programme={(prog or "")[:60]!r}')
            continue
        print(f'{nom:22} {slug:26} {cle:16} {len(creneaux):3} creneaux')
        for c in creneaux:
            c['semestre'] = cle
        par_master[slug].extend(creneaux)

    print()
    os.makedirs(SORTIE_BRUT, exist_ok=True)
    for slug, cr in sorted(par_master.items()):
        sem = collections.Counter(c['semestre'] for c in cr)
        print(f'{slug:26} {len(cr):3} creneaux  {dict(sem)}')
        if '--brut' in sys.argv:
            lignes = [f'# {slug} : releve automatique des PDF d\'horaire officiels.',
                      "# Genere par tools_pdf_horaires.py, ne pas editer a la main sans raison.", '']
            for cle in sorted(sem):
                lignes.append(f'@semestre {cle}')
                for c in sorted([x for x in cr if x['semestre'] == cle],
                                key=lambda x: (JOURS.index(x['jour']) if x['jour'] in JOURS else 9, x['debut'])):
                    lignes.append(' | '.join([c['jour'], c['debut'], c['fin'], c['titre'],
                                              c['salle'] or '', c['cadence'], c['note']]))
                lignes.append('')
            io.open(f'{SORTIE_BRUT}/{slug}.txt', 'w', encoding='utf-8').write('\n'.join(lignes))
    print()
    print(f'{sum(len(v) for v in par_master.values())} creneaux au total, {len(par_master)} masters')


main()
