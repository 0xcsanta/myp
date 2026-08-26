# -*- coding: utf-8 -*-
"""
Lit les plans d'etudes officiels 2025-2026 et en tire, pour chaque master,
un fichier de regles et une liste de cours.

Le plan d'etudes est une grille : une ligne par cours, des colonnes pour les
professeurs, les semestres, les credits, la langue et l'evaluation. Les
en-tetes de module portent les seuils de credits, qui n'existent nulle part
ailleurs. C'est la seule raison pour laquelle ce fichier existe.

Aucun telechargement : on lit les PDF deja presents dans allmaster/.
Voir docs/SOURCES.md et docs/LEGAL.md.
"""
import collections, glob, io, json, os, re, unicodedata
import pdfplumber

YEAR = '2025-2026'
OUT_RULES = 'data/rules'
OUT_COURSES = 'data/programmes'

BASE_URL = ('https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/'
            'enseignement-master/plan-d-etudes-et-reglements.html')

def fold(s):
    n = unicodedata.normalize('NFKD', s or '')
    return ''.join(c for c in n if not unicodedata.combining(c)).lower()

# ---------------------------------------------------------------- extraction

def rows_of(pdf_path):
    """Toutes les lignes du PDF, sous forme (y, [(x, mot), ...]), page par page."""
    out = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            buckets = collections.OrderedDict()
            for w in page.extract_words():
                key = next((k for k in buckets if abs(k - w['top']) < 3.5), round(w['top'], 1))
                buckets.setdefault(key, []).append((round(w['x0'], 1), w['text']))
            for y in sorted(buckets):
                out.append((y, sorted(buckets[y])))
    return out

def header_columns(rows):
    """
    Trouve la ligne d'en-tete et en deduit les bornes des colonnes.

    On ne devine rien : chaque borne vient de la position reelle du libelle
    dans le PDF, car la largeur des colonnes change d'un master a l'autre.
    """
    anchors = {
        'ects':   r'^ects$',
        'langue': r'^(langue|language)$',
        'eval':   r"^(d'evaluation|evaluation)$",
        'duree':  r"^(l'examen|examen|exam)$",
        'prof':   r'^(professeurs|professors)$',
        'cours':  r'^(cours|courses)$',
    }
    for y, cells in rows:
        flat = {re.sub(r'\s+', '', fold(t)): x for x, t in cells}
        found = {}
        for key, pat in anchors.items():
            for txt, x in flat.items():
                if re.match(pat, txt):
                    found[key] = x
                    break
        if 'ects' in found and 'langue' in found:
            # les puces de semestre vivent entre la colonne prof et ECTS
            return found, y
    return None, None

def semester_columns(rows, x_prof, x_ects):
    """Position x de chaque colonne de semestre, deduite des puces elles memes."""
    xs = []
    for _, cells in rows:
        for x, t in cells:
            if t.strip() in ('•', '●', '·') and x_prof < x < x_ects:
                xs.append(x)
    if not xs:
        return []
    xs.sort()
    cols, cur = [], [xs[0]]
    for x in xs[1:]:
        if x - cur[-1] < 8:
            cur.append(x)
        else:
            cols.append(sum(cur) / len(cur)); cur = [x]
    cols.append(sum(cur) / len(cur))
    return cols

MODULE_RE = re.compile(
    r'^(SOUS-?MODULE|MODULE)\s*([\d.]+)\s*:?\s*(.*?)'
    r'(?:[-–—]\s*)?(\d+)\s*(?:credits?|crédits?)\s*ECTS',
    re.I)

def parse_plan(pdf_path, slug):
    rows = rows_of(pdf_path)
    cols, hdr_y = header_columns(rows)
    if not cols:
        return None, f'en-tete de grille introuvable dans {os.path.basename(pdf_path)}'

    sem_x = semester_columns(rows, cols.get('prof', 200), cols['ects'])
    modules, courses = [], []
    current = None

    for y, cells in rows:
        line = ' '.join(t for _, t in cells).strip()
        if not line:
            continue

        m = MODULE_RE.match(line)
        if m:
            kind, code, label, ects = m.groups()
            is_sub = not kind.upper().startswith('MODULE')
            code = ('SM' if is_sub else 'M') + code
            # « Sous-module 4.1 » est une subdivision de « Module 4 » : ses
            # credits sont DEJA comptes dans le parent. Sans ce lien, le MScIS
            # totalise 120 ECTS au lieu de 90.
            parent = 'M' + code[2:].split('.')[0] if is_sub else None
            current = {
                'code': code,
                'parent': parent,
                'label': f'{kind.title()} {m.group(2)}',
                'minEcts': int(ects),
                'kind': 'all_required' if re.search(r'obligatoire|compulsory', fold(label))
                        else 'thesis' if re.search(r'memoire|thesis', fold(label))
                        else 'free_choice',
                'note': re.sub(r'\s+', ' ', label).strip(' -–—:'),
            }
            avg = re.search(r'([\d.]+)\s*\)', label)
            if re.search(r'moyenne|average', fold(label)) and avg:
                current['avgMin'] = float(avg.group(1))
            modules.append(current)
            continue

        # une ligne de cours porte un nombre de credits dans la colonne ECTS
        ects_cell = [t for x, t in cells if cols['ects'] - 6 <= x <= cols['ects'] + 22]
        ects = next((int(t) for t in ects_cell if t.isdigit()), None)
        if ects is None or current is None:
            continue

        left = [(x, t) for x, t in cells if x < cols.get('prof', 200) - 4]
        title = re.sub(r'\s+', ' ', ' '.join(t for _, t in left)).strip()
        if not title or fold(title).startswith(('cours', 'courses')):
            continue

        prof = ' '.join(
            t for x, t in cells
            if cols.get('prof', 200) - 4 <= x < (sem_x[0] - 10 if sem_x else cols['ects'] - 40)
        ).strip()

        bullets = [x for x, t in cells if t.strip() in ('•', '●', '·')]
        semesters = []
        for i, cx in enumerate(sem_x, start=1):
            if any(abs(bx - cx) < 8 for bx in bullets):
                semesters.append(i)

        right = [(x, t) for x, t in cells if x > cols['ects'] + 12]
        right_txt = ' '.join(t for _, t in right)
        lang = re.search(r'\b(F/A|A/F|F|A|E|E/F|FR|EN)\b', right_txt)
        evalu = re.search(r'((?:VCN|VM|M|E|O|ENEP)(?:\s*\+\s*(?:ENEP|E|O))?)', right_txt)
        duree = re.search(r'\b(\d{2,3}|N/A|TBD)\b\s*$', right_txt.strip())

        courses.append({
            'title': title,
            'teachers': prof,
            'module': current['code'],
            'ects': ects,
            'semesters': semesters,
            'language': lang.group(1) if lang else None,
            'evalType': evalu.group(1).replace(' ', '') if evalu else None,
            'examMinutes': (int(duree.group(1)) if duree and duree.group(1).isdigit() else None),
            'raw': right_txt.strip()[:60],
        })

    # Le verrou du memoire ne vit pas dans la grille mais dans les notes de bas
    # de page : « Seuls les etudiants ayant prealablement acquis 60 credits ECTS
    # du Module 1, 2 et 3 sont autorises a presenter leur memoire. »
    full = ' '.join(' '.join(t for _, t in cells) for _, cells in rows)
    full = re.sub(r'\s+', ' ', full)
    lock = re.search(
        r'(\d+)\s*(?:credits?|crédits?)\s*ECTS\s*(?:du|des|of)\s*Modules?\s*([\d,\s]+(?:et\s*\d+)?)',
        full, re.I)
    if lock:
        need = int(lock.group(1))
        froms = ['M' + n for n in re.findall(r'\d+', lock.group(2))]
        for mod in modules:
            if mod['kind'] == 'thesis' and mod.get('parent'):
                mod['unlockedBy'] = {'ectsFrom': froms, 'atLeast': need}
                mod['unlockedNote'] = lock.group(0).strip()

    return {'modules': modules, 'courses': courses, 'semesterColumns': len(sem_x)}, None

# ---------------------------------------------------------------------- main

def main():
    os.makedirs(OUT_RULES, exist_ok=True)
    os.makedirs(OUT_COURSES, exist_ok=True)
    index = json.load(io.open('data/raw/_allmaster_index.json', encoding='utf-8'))
    plans = [r for r in index if r.get('kind') == 'plan' and r.get('year') == YEAR and r.get('slug')]

    print(f'{len(plans)} plans d\'etudes {YEAR}\n')
    summary = []
    for r in sorted(plans, key=lambda x: x['slug']):
        path = os.path.join('allmaster', r['file'])
        data, err = parse_plan(path, r['slug'])
        if err:
            print(f"  {r['slug']:26} ECHEC  {err}")
            summary.append({'slug': r['slug'], 'error': err})
            continue

        # seuls les modules racines comptent dans le total du diplome
        roots = [m for m in data['modules'] if not m.get('parent')]
        total = sum(m['minEcts'] for m in roots)
        rules = {
            'programme': r['slug'],
            'year': YEAR,
            'totalEcts': total,
            'modules': data['modules'],
            'checks': ['module_min', 'module_max', 'total_ects', 'time_clash',
                       'semester_offered', 'prereq_met', 'capacity_limited'],
            'source': {'document': r['file'], 'page': BASE_URL, 'checkedOn': '2026-08-26'},
        }
        json.dump(rules, io.open(f'{OUT_RULES}/{r["slug"]}-{YEAR}.json', 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
        json.dump({'programme': r['slug'], 'year': YEAR, 'courses': data['courses'],
                   'source': rules['source']},
                  io.open(f'{OUT_COURSES}/{r["slug"]}-{YEAR}.json', 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)

        flag = '' if total in (90, 120) else f'  <-- total {total}, a verifier'
        print(f"  {r['slug']:26} {len(data['modules'])} modules, "
              f"{len(data['courses']):3} cours, {total} ECTS{flag}")
        summary.append({'slug': r['slug'], 'modules': len(data['modules']),
                        'courses': len(data['courses']), 'total': total})

    print()
    bad = [s for s in summary if 'error' in s or s.get('total') not in (90, 120)]
    if bad:
        print('A regarder de pres :')
        for s in bad:
            print('  ', s)

main()
