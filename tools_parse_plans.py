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
VERROUS = json.load(io.open('data/verrous-memoire.json', encoding='utf-8'))['verrous']
OUT_RULES = 'data/rules'
OUT_COURSES = 'data/programmes'

BASE_URL = ('https://www.unil.ch/hec/fr/home/ressources/intranet/espace-etudiant/'
            'enseignement-master/plan-d-etudes-et-reglements.html')

def fold(s):
    n = unicodedata.normalize('NFKD', s or '')
    return ''.join(c for c in n if not unicodedata.combining(c)).lower()

# ---------------------------------------------------------------- extraction

def rows_of(pdf_path):
    """
    Toutes les lignes du PDF, sous forme (y, [(x, mot), ...]), page par page.

    Deux mots colles sont recolles. Certains titres sont composes lettre par
    lettre, chacune posee separement, et pdfplumber rend alors un jeton par
    glyphe : « Situating Humans » sortait en « S it u a t in g H u m a n s ».
    L'ecart le dit sans ambiguite, mesure sur le plan du MScE : a l'interieur
    d'un mot les glyphes se touchent, l'ecart vaut 0,03 point ; entre deux mots
    il vaut 1,3. Un demi point tranche largement, une espace typographique a
    cette taille en faisant environ deux.
    """
    out = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            buckets = collections.OrderedDict()
            for w in page.extract_words():
                key = next((k for k in buckets if abs(k - w['top']) < 3.5), round(w['top'], 1))
                buckets.setdefault(key, []).append((w['x0'], w['x1'], w['text']))
            for y in sorted(buckets):
                mots = []
                for x0, x1, t in sorted(buckets[y]):
                    if mots and x0 - mots[-1][1] < 0.5:
                        g, d, txt = mots[-1]
                        mots[-1] = (g, max(d, x1), txt + t)
                    else:
                        mots.append((x0, x1, t))
                out.append((y, [(round(x0, 1), t) for x0, _, t in mots]))
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

# L'en-tete d'un module, dans les deux langues et a trois profondeurs.
#
# Quatre pieges, tous rencontres pour de vrai.
#
# Les plans rediges en anglais ecrivent SUBMODULE et SUB-SUBMODULE. Ne chercher
# que le francais faisait rater les sous-modules de six masters sur dix, dont
# les trois orientations du MScF et les deux niveaux de son sous-module 3.2.
#
# Le MScE ecrit SUBMODULES au pluriel : « SUBMODULES 1.2: Choose A, B or C ».
#
# Les credits ne sont pas toujours sur l'en-tete. « SUBMODULE 3.1: Asset and
# Risk Management » n'en porte aucun, le module parent les donnant pour tous.
# Les exiger faisait rejeter l'en-tete entier.
#
# Et ils ne sont pas toujours entiers : le MScE a des seuils a 22,5 et 7,5.
MODULE_RE = re.compile(
    r'^(SUB-?SUB-?MODULES?|SOUS-?SOUS-?MODULES?|SUB-?MODULES?|SOUS-?MODULES?|MODULES?)'
    r'\s*([\d.]+[a-zA-Z]?)\s*\**\s*(:)?\s*(.*)$',
    re.I)

# Les credits d'un en-tete, quel que soit leur tour de phrase :
# « - 21 credits ECTS », « (select 2 ECTS) », « (select at least 6 ECTS) ».
ECTS_ENTETE = re.compile(
    r'(?:select(?:\s+at\s+least)?\s*)?(\d+(?:[.,]\d+)?)\s*(?:credits?|crédits?)?\s*ECTS',
    re.I)

# Les mots par lesquels une phrase commence, et jamais un intitule de cours.
# Volontairement courte : elle n'est la que pour ecarter la prose, pas pour
# juger des titres. « The Evolution of Cooperation » commence par « the » et
# doit passer, donc « the » n'y figure pas ; le rejet vient alors de la
# virgule finale ou de rien du tout.
AMORCES_DE_PHRASE = {
    'from', 'and', 'or', 'is', 'are', 'was', 'were', 'that', 'which', 'who',
    'this', 'these', 'those', 'there', 'they', 'it', 'we', 'you', 'if',
    'when', 'while', 'because', 'however', 'therefore',
    'et', 'ou', 'qui', 'que', 'dont', 'ce', 'cette', 'ces', 'il', 'elle',
    'ils', 'elles', 'nous', 'vous', 'si', 'lorsque', 'donc', 'car',
}


def parse_plan(pdf_path, slug):
    rows = rows_of(pdf_path)
    cols, hdr_y = header_columns(rows)
    if not cols:
        return None, f'en-tete de grille introuvable dans {os.path.basename(pdf_path)}'

    sem_x = semester_columns(rows, cols.get('prof', 200), cols['ects'])
    modules, courses = [], []
    current = None
    # Un intitule trop long pour la colonne passe a la ligne, et la ligne du
    # dessus ne porte alors ni credits ni puce. Elle etait purement perdue :
    # « Situating Humans in Time: From the Beginning of Life to / the
    # Anthropocene » entrait au catalogue sous le seul mot « the Anthropocene »,
    # que le releve d'horaire ne pouvait plus reconnaitre.
    #
    # On garde donc la ligne precedente quand elle tient entierement dans la
    # colonne des intitules. Mais elle n'est recollee que si le cours qui suit
    # commence par une minuscule : c'est ce qui distingue la fin d'une phrase
    # coupee d'un vrai debut de titre. Sans cette condition, les intertitres
    # « Concours juridiques », « B. Economic Policy », « Pre-approved courses »
    # se collaient au premier cours de leur section, et « Cours FGSE » y faisait
    # meme disparaitre le cours, le filtre des lignes « Cours... » l'ecartant
    # ensuite tout entier.
    debut_titre = None

    for y, cells in rows:
        line = ' '.join(t for _, t in cells).strip()
        if not line:
            debut_titre = None
            continue

        m = MODULE_RE.match(line)
        if m:
            kind, code_brut, deux_points, label = m.groups()

            # Un en-tete porte un deux-points juste apres son numero, ou un
            # nombre de credits. Sans ce garde-fou, des phrases du corps du
            # texte passaient pour des modules : « Module 4 can be any course
            # listed above... » creait un second M4 fantome dans les quatre
            # orientations du MScM.
            if not deux_points and not ECTS_ENTETE.search(label):
                continue

            k = fold(kind)
            is_sub = k.startswith('sous') or k.startswith('sub')
            code = ('SM' if is_sub else 'M') + code_brut

            e = ECTS_ENTETE.search(label)
            ects = float(e.group(1).replace(',', '.')) if e else 0.0
            if ects == int(ects):
                ects = int(ects)

            # Le parent se lit dans le code lui meme, ce qui gere les deux
            # niveaux : « 3.1 » depend de « M3 », « 3.2.1 » de « SM3.2 ». Ses
            # credits sont DEJA comptes dans le parent ; sans ce lien, le MScIS
            # totalise 120 ECTS au lieu de 90.
            parent = None
            if is_sub:
                bouts = code_brut.split('.')
                if len(bouts) > 2:
                    parent = 'SM' + '.'.join(bouts[:-1])
                else:
                    parent = 'M' + re.match(r'\d+', code_brut).group(0)
            current = {
                'code': code,
                'parent': parent,
                'label': f'{kind.title()} {code_brut}',
                'minEcts': ects,
                # l'ordre compte : « Master thesis (compulsory) » porte les deux
                # mots, et tester « obligatoire » en premier en faisait un module
                # de cours obligatoires au lieu du memoire
                'kind': 'thesis' if re.search(r'memoire|thesis', fold(label))
                        else 'all_required' if re.search(r'obligatoire|compulsory', fold(label))
                        else 'free_choice',
                'note': re.sub(r'\s+', ' ', label).strip(' -–—:'),
            }
            # « MODULE 3: Choose the submodule of your orientation » : l'etudiant
            # en prend UN, pas les trois. Sans cette marque, le site accepterait
            # un plan qui pioche dans deux orientations a la fois.
            if re.search(r'choose the sub-?module|choisir le sous-?module', fold(label)):
                current['choisirUn'] = True

            avg = re.search(r'([\d.]+)\s*\)', label)
            if re.search(r'moyenne|average', fold(label)) and avg:
                current['avgMin'] = float(avg.group(1))
            modules.append(current)
            debut_titre = None
            continue

        # une ligne de cours porte un nombre de credits dans la colonne ECTS
        ects_cell = [t for x, t in cells if cols['ects'] - 6 <= x <= cols['ects'] + 22]
        ects = next((int(t) for t in ects_cell if t.isdigit()), None)
        x_prof = cols.get('prof', 200) - 4
        if ects is None or current is None:
            # Sans credits, la ligne peut etre le debut d'un intitule coupe.
            # Elle ne porte alors que du texte dans la colonne des intitules,
            # et parfois les puces de semestre : le plan du MScE met la puce
            # sur la premiere ligne et les credits sur la seconde.
            reste = [t for x, t in cells if x >= x_prof and t.strip() not in ('•', '●', '·')]
            debut_titre = cells if (current is not None and cells and not reste) else None
            continue

        left = [(x, t) for x, t in cells if x < x_prof]
        title = re.sub(r'\s+', ' ', ' '.join(t for _, t in left)).strip()

        # Le debut du titre precede la suite, quelle que soit son abscisse : les
        # deux lignes commencent a la meme, et les trier ensemble entrelacait
        # « Situating the Anthropocene Humans in Time ».
        if debut_titre and title[:1].islower():
            tete = ' '.join(t for x, t in debut_titre if x < x_prof)
            if tete:
                title = re.sub(r'\s+', ' ', f'{tete} {title}').strip()
                cells = debut_titre + cells
        debut_titre = None
        # Le plan du Droit et Economie porte des marqueurs de note dans la marge,
        # une lettre seule collee devant l'intitule : « f Fiscalite de
        # l'entreprise ». Sans ce nettoyage, le titre stocke ne correspond plus a
        # celui de l'agenda et l'horaire ne se rattache jamais au cours.
        title = re.sub(r"^[a-zA-Z]\s+(?=[A-ZÀ-Ý])", '', title)
        # Le meme plan use aussi de symboles et de lettres redoublees :
        # « #Strategy of Innovation », « °°°Contrôle stratégique »,
        # « xxDroit et éthique ». Huit intitules du MDE les portaient, et un
        # etudiant lisait « °°°Contrôle stratégique » a l'ecran. Pire, le
        # marqueur brisait le rapprochement d'un master a l'autre : le MScM
        # ecrit « Strategy of Innovation » sans diese, donc le meme cours ne se
        # reconnaissait pas et son horaire ne circulait pas.
        title = re.sub(r"^[#°*†‡§~]+\s*(?=[A-ZÀ-Ý0-9])", '', title)
        # l'espace est facultatif : le PDF pose parfois le marqueur dans sa
        # propre cellule, « xx Droit et éthique », parfois colle, « xxDroit »
        title = re.sub(r"^([a-z])\1{0,2}\s*(?=[A-ZÀ-Ý])", '', title)   # « bEconomie I », « xx Droit »
        if not title or fold(title).startswith(('cours', 'courses')):
            continue
        # Une phrase du corps du texte n'est pas un cours. Le paragraphe du
        # MScE « ...12 ECTS from the list of SUPP courses. For those taking the
        # BEE specialization, » portait un « 4 » tombe dans la colonne ECTS et
        # entrait au catalogue comme un enseignement de 4 credits du Module 3.
        # Deux marques suffisent a le reconnaitre, et aucun des intitules des
        # dix plans ne les porte : une virgule finale, ou un premier mot qui ne
        # commence pas un titre.
        if re.search(r'[,;]$', title):
            continue
        if fold(title).split(' ')[0] in AMORCES_DE_PHRASE:
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

    # Le verrou du memoire vient d'une table saisie a la main, pas d'une
    # expression reguliere.
    #
    # Pourquoi : la condition ne figure pas dans la grille mais dans une note de
    # bas de page, dont la formulation change d'un master a l'autre, « Module 1,
    # 2 et 3 », « Modules 1 and 2 », « Modules 1 to 5 ». Et un piege avere rode :
    # dans les plans de management, une autre phrase parle de 12 credits du
    # Module 2 pour CHANGER D'ORIENTATION. Une regex l'attrapait et en faisait
    # une fausse condition d'acces au memoire, affichee aux etudiants.
    #
    # Dix masters, dix phrases relues : la table est plus sure que le motif.
    verrou = VERROUS.get(slug)
    if verrou:
        for mod in modules:
            if mod['kind'] == 'thesis':
                mod['unlockedBy'] = {'ectsFrom': verrou['modules'],
                                     'atLeast': verrou['ectsRequis']}
                mod['unlockedNote'] = verrou['phrase']

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
