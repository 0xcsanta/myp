# -*- coding: utf-8 -*-
"""
Range allmaster/ : identifie chaque PDF, supprime les doublons exacts,
renomme lisiblement, et ecrit un index que les analyseurs consomment.

Rien n'est telecharge ici. Tous ces documents ont ete recuperes a la main
depuis les pages publiques de l'UNIL. Voir docs/SOURCES.md et docs/LEGAL.md.

ATTENTION, lecon apprise : ne JAMAIS deduire le programme du corps du
document. Une grille de plan d'etudes contient les intitules de ses cours, et
« Strategy in Digital Markets » dans le plan du MScIS le faisait etiqueter
comme le master en strategie. Le programme se lit dans le nom de fichier, ou
dans l'en-tete « votre selection > » des annuaires, et nulle part ailleurs.
"""
import glob, hashlib, io, json, os, re, sys, unicodedata
import pypdf

SRC = 'allmaster'
INDEX = 'data/raw/_allmaster_index.json'

# codes tels qu'ils apparaissent dans les noms de fichiers officiels de HEC
CODES = [
    (r'\bmscis\b|systemes d information|info systems', 'mscis'),
    (r'\bmscc+f\b|comptabilite',                       'msccf'),
    (r'\bmscas\b|sciences actuarielles',               'mscas'),
    (r'\bmde\b|droit et economie|droit eco',           'mde'),
    (r'business analytics',                            'mscm-business-analytics'),
    (r'behaviour|comportement',                        'mscm-behaviour'),
    (r'marketing',                                     'mscm-marketing'),
    (r'strategy|strategie',                            'mscm-strategy'),
    (r'\bsmt\b|durable|sustainable',                   'msc-smt'),
    (r'criminalite|\bmldcs\b',                         'mldcs'),
    (r'reglement faculte hec|hec faculte|hautes etudes commerciales r', 'hec-faculte'),
    (r'\bmscm\b|\bmanagement\b',                       'mscm'),
    (r'\bmscf\b|\bfinance\b',                          'mscf'),
    (r'\bmsce\b|\beconomie\b|economics|economie',      'msce'),
]

def fold(s):
    """Minuscules sans accents. NFKD seul ne suffit pas : sans retirer les
    marques combinantes, « economie » ne matche jamais « économie »."""
    n = unicodedata.normalize('NFKD', s)
    n = ''.join(c for c in n if not unicodedata.combining(c)).lower()
    # les separateurs deviennent des espaces, sinon « master_finance_web » ne
    # declenche jamais une limite de mot autour de « finance »
    return re.sub(r'[^a-z0-9]+', ' ', n)

def code_in(text):
    f = fold(text)
    for pat, slug in CODES:
        if re.search(pat, f):
            return slug
    return None

def read_head(path, pages=2):
    r = pypdf.PdfReader(path)
    t = ''.join((p.extract_text() or '') for p in r.pages[:pages])
    return re.sub(r'\s+', ' ', t), len(r.pages)

def kind_of(name, txt):
    # un nom deja normalise porte son type : le rangement doit etre idempotent,
    # sinon une seconde execution reclasse les plans renommes en brochures
    already = re.search(r'--(plan|annuaire|reglement|brochure)--|--(plan|annuaire|reglement|brochure)\.pdf$', name)
    if already:
        return already.group(1) or already.group(2)
    if 'Annuaire des cours' in txt:                        return 'annuaire'
    if re.search(r'reglement', fold(name)):                return 'reglement'
    if re.search(r"plan d |orientation ", fold(name)):     return 'plan'
    if re.search(r'Entr[eé]e en vigueur', txt):            return 'reglement'
    return 'brochure'

def restore():
    """Remet les noms d'origine, pour rejouer le rangement sur une base saine."""
    if not os.path.exists(INDEX):
        print('pas d\'index, rien a restaurer'); return
    idx = json.load(io.open(INDEX, encoding='utf-8'))
    n = 0
    for r in idx:
        cur, orig = f"{SRC}/{r.get('file','')}", r.get('original')
        if orig and os.path.exists(cur) and not os.path.exists(f'{SRC}/{orig}'):
            os.rename(cur, f'{SRC}/{orig}'); n += 1
    print(f'{n} fichiers remis a leur nom d\'origine')

def organise():
    os.makedirs(os.path.dirname(INDEX), exist_ok=True)
    seen, index, removed, doubtful = {}, [], [], []

    for f in sorted(glob.glob(f'{SRC}/*.pdf')):
        digest = hashlib.md5(open(f, 'rb').read()).hexdigest()
        if digest in seen:
            os.remove(f); removed.append(os.path.basename(f)); continue
        seen[digest] = f

        name = os.path.basename(f)
        try:
            txt, pages = read_head(f)
        except Exception as e:
            index.append({'file': name, 'error': str(e)}); continue

        kind = kind_of(name, txt)

        # en-tete fiable des annuaires ; sinon, uniquement le nom de fichier
        label = ''
        if kind == 'annuaire':
            m = re.search(r'votre s[eé]lection\s*>\s*(.{0,160})', txt, re.I)
            label = (m.group(1) if m else '').strip()
        slug = code_in(label) or code_in(name)
        if not slug:
            doubtful.append(name)

        # l'annee vient du nom de fichier pour les plans, de l'en-tete pour
        # les annuaires : le corps d'une grille cite d'autres annees
        src_year = name if kind != 'annuaire' else txt[:200]
        y = re.search(r'(20\d\d)[.\-/](20\d\d)', src_year)
        year = f'{y.group(1)}-{y.group(2)}' if y else None

        mod = re.search(r'Modules?\s*([\d,\s&et]+)', label)
        modules = re.findall(r'\d+', mod.group(1)) if mod else []

        stem = f'{slug or "a-identifier"}--{kind}' + (f'--{year}' if year else '')
        if modules:
            stem += '--m' + ''.join(modules)
        target, n = f'{SRC}/{stem}.pdf', 2
        while os.path.exists(target) and os.path.abspath(target) != os.path.abspath(f):
            target, n = f'{SRC}/{stem}-{n}.pdf', n + 1
        if os.path.abspath(target) != os.path.abspath(f):
            os.rename(f, target)

        index.append({'file': os.path.basename(target), 'original': name, 'kind': kind,
                      'slug': slug, 'year': year, 'modules': modules, 'pages': pages,
                      'label': label[:140], 'md5': digest})

    json.dump(index, io.open(INDEX, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'{len(index)} documents uniques, {len(removed)} doublons supprimes\n')
    by_kind = {}
    for r in index:
        by_kind.setdefault(r.get('kind', '?'), []).append(r)
    for k in ('plan', 'annuaire', 'reglement', 'brochure'):
        rs = by_kind.get(k, [])
        print(f'--- {k} ({len(rs)}) ---')
        for r in sorted(rs, key=lambda x: (x.get('slug') or 'zz', x.get('year') or '')):
            print(f"  {str(r.get('slug')):26} {str(r.get('year')):10} {r['pages']:>3}p  {r['file']}")
        print()
    if doubtful:
        print('A identifier a la main :')
        for d in doubtful:
            print('  ', d)

if __name__ == '__main__':
    if '--restore' in sys.argv:
        restore()
    else:
        organise()
