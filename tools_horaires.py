# -*- coding: utf-8 -*-
"""
Transforme un relevé d'horaire écrit en texte simple vers le JSON du site.

Pourquoi ce détour : les captures d'écran contiennent environ quatre cents
créneaux, et chaque cours est identifié par un slug de 46 caractères. Les
saisir à la main serait la meilleure façon d'introduire des fautes muettes.
Ici on écrit le TITRE tel qu'il apparaît à l'écran, et le script le résout
contre le catalogue du master. Toute résolution douteuse est signalée, jamais
devinée en silence.

Format d'entrée, un fichier par master dans data/horaires/brut/<slug>.txt :

    # commentaire
    @semestre automne-2026
    Lundi | 08:30 | 12:00 | Software Architectures | Internef/237 | hebdomadaire | note
    @semestre printemps-2026
    Mardi  | 14:15 | 18:00 | Management of AI in Organizations | Internef/126

La note et la cadence sont facultatives, la cadence vaut « hebdomadaire » par
défaut. Le titre peut être abrégé : la résolution accepte un préfixe unique.

    python tools_horaires.py            construit tous les fichiers
    python tools_horaires.py mscis      un seul master
"""
import difflib, glob, io, json, os, re, sys, unicodedata

BRUT = 'data/horaires/brut'
SORTIE = 'data/horaires'
ANNEE_REGLES = '2025-2026'

CADENCES = {'hebdomadaire', 'quinzaine', 'bloc', 'irregulier'}
JOURS = {'lundi': 'Lundi', 'mardi': 'Mardi', 'mercredi': 'Mercredi',
         'jeudi': 'Jeudi', 'vendredi': 'Vendredi', 'samedi': 'Samedi'}


def nettoyer(t):
    """
    Repare les intitules haches par la mise en page du PDF.

    Quand plusieurs cours se chevauchent le meme jour, l'agenda les dessine dans
    des colonnes tres etroites et le texte part lettre par lettre :
    « Financial A-ccounting », « c i v ile e t c o m m e ». On recolle donc les
    lettres isolees et on retire les fragments de salle ou d'enseignant qui se
    sont glisses dans le titre.
    """
    t = re.sub(r'\s*/\s*$', '', t.strip())
    t = re.sub(r'C\s*-\s*', ' ', t)                 # marqueur de type de cours
    t = re.sub(r'(?<=[A-Za-zÀ-ÿ])-(?=[a-zà-ÿ])', '', t)  # « A-ccounting »
    # une suite de lettres isolees separees par des espaces se recolle
    t = re.sub(r'(?:(?<=\s)|^)((?:[A-Za-zÀ-ÿ]\s){2,}[A-Za-zÀ-ÿ]{1,3})(?=\s|$)',
               lambda m: m.group(1).replace(' ', ''), t)
    t = re.sub(r'\s*[-–]\s*(Internef|Anthropole|Amphimax|Amphipôle|Synathlon|Cubotron|IDHEAP).*$',
               '', t, flags=re.I)
    return re.sub(r'\s+', ' ', t).strip(' -–—/|')


def fold(t):
    n = unicodedata.normalize('NFKD', nettoyer(t))
    n = ''.join(c for c in n if not unicodedata.combining(c)).lower()
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', n)).strip()


def ident(titre, i=0):
    n = unicodedata.normalize('NFKD', titre)
    n = ''.join(c for c in n if not unicodedata.combining(c)).lower()
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', n))[:46] or f'cours-{i}'


def catalogue(slug):
    """Les identifiants du master, calcules comme le fait le site."""
    cours = json.load(io.open(f'data/programmes/{slug}-{ANNEE_REGLES}.json',
                              encoding='utf-8'))['courses']
    ids, vus = {}, {}
    for i, c in enumerate(cours):
        k = ident(c['title'], i)
        n = vus.get(k, 0)
        if n:
            k = f'{k}-{n + 1}'
        vus[k] = vus.get(k, 0) + 1
        ids[k] = c['title']
    return ids


def resoudre(titre, ids):
    """
    Titre affiche vers identifiant.

    Trois passes, de la plus stricte a la plus souple, et un echec explicite
    plutot qu'un choix arbitraire quand plusieurs cours correspondent.
    """
    cible = fold(titre)
    exact = [k for k, v in ids.items() if fold(v) == cible]
    if len(exact) == 1:
        return exact[0], None
    if len(exact) > 1:
        # Le meme cours figure dans deux modules du plan. Ce n'est pas une
        # ambiguite a trancher : c'est le meme enseignement a la meme heure,
        # et il recoit donc le creneau dans les deux entrees.
        return exact, None

    prefixe = [k for k, v in ids.items() if fold(v).startswith(cible) or cible.startswith(fold(v))]
    if len(prefixe) == 1:
        return prefixe[0], None
    if len(prefixe) > 1:
        return None, 'ambigu : ' + ', '.join(sorted(prefixe)[:4])

    contenu = [k for k, v in ids.items() if cible in fold(v) or fold(v) in cible]
    if len(contenu) == 1:
        return contenu[0], None
    if len(contenu) > 1:
        return None, 'ambigu : ' + ', '.join(sorted(contenu)[:4])

    # Dernier recours : la similarite. Un intitule hache par la mise en page
    # reste tres proche du vrai. Le seuil est haut et chaque rapprochement de
    # ce type est journalise, pour rester verifiable.
    notes = [(difflib.SequenceMatcher(None, cible, fold(v)).ratio(), k) for k, v in ids.items()]
    notes.sort(reverse=True)
    if notes and notes[0][0] >= 0.86 and (len(notes) < 2 or notes[0][0] - notes[1][0] > 0.06):
        return notes[0][1], f'SIMILARITE {notes[0][0]:.2f}'

    # Le recouvrement de mots rattrape ce que la similarite caractere par
    # caractere manque : « Taxation o f e enterprises and t ransfer e pricing
    # policy » partage cinq mots longs avec « Taxation of Multinational
    # Enterprises and Transfer Pricing Policy », meme si les lettres sont hachees.
    mots = {w for w in cible.split() if len(w) >= 4}
    if len(mots) >= 3:
        rec = []
        for k, v in ids.items():
            autres = {w for w in fold(v).split() if len(w) >= 4}
            if not autres:
                continue
            rec.append((len(mots & autres) / max(len(mots), len(autres)), k))
        rec.sort(reverse=True)
        if rec and rec[0][0] >= 0.6 and (len(rec) < 2 or rec[0][0] - rec[1][0] > 0.12):
            return rec[0][1], f'MOTS COMMUNS {rec[0][0]:.2f}'

    proches = ', '.join(k for _, k in notes[:3])
    return None, f'introuvable (meilleure similarite {notes[0][0]:.2f}), proches : {proches}'



def lire_brut(chemin):
    semestre, lignes = None, []
    for n, ligne in enumerate(io.open(chemin, encoding='utf-8'), 1):
        t = ligne.strip()
        if not t or t.startswith('#'):
            continue
        if t.startswith('@semestre'):
            semestre = t.split(None, 1)[1].strip()
            continue
        parts = [p.strip() for p in t.split('|')]
        if len(parts) < 4:
            print(f'  ligne {n} ignoree, moins de 4 colonnes : {t[:60]}')
            continue
        jour, debut, fin, titre = parts[:4]
        salle = parts[4] if len(parts) > 4 and parts[4] else None
        cadence = parts[5].lower() if len(parts) > 5 and parts[5] else 'hebdomadaire'
        note = parts[6] if len(parts) > 6 else ''
        if cadence not in CADENCES:
            print(f'  ligne {n} : cadence inconnue « {cadence} », remise a hebdomadaire')
            cadence = 'hebdomadaire'
        lignes.append({'n': n, 'semestre': semestre, 'jour': JOURS.get(fold(jour), jour),
                       'debut': debut, 'fin': fin, 'titre': titre,
                       'salle': salle, 'cadence': cadence, 'note': note})
    return lignes


def corrections(slug):
    """Intitules retablis a la main, indexes sur le creneau et non sur la ligne."""
    f = f'{SORTIE}/corrections.json'
    if not os.path.exists(f):
        return {}
    out = {}
    for c in json.load(io.open(f, encoding='utf-8'))['corrections']:
        if c['master'] == slug:
            out[(c['semestre'], c['jour'], c['debut'])] = c['titre']
    return out


def appoint(slug):
    """
    Creneaux releves a la main sur les fiches de cours officielles.

    Les PDF d'horaire ne couvrent pas tout : au MScF, tout le semestre de
    printemps y manquait. Ces creneaux vivent dans leur propre fichier plutot
    que dans les releves bruts, qui sont regeneres depuis les PDF et les
    effaceraient a la premiere execution.
    """
    f = f'{SORTIE}/appoint.json'
    if not os.path.exists(f):
        return []
    d = json.load(io.open(f, encoding='utf-8'))
    out = []
    for i, c in enumerate(d.get('creneaux', []), 1):
        if c.get('master') != slug:
            continue
        out.append({'n': f'appoint {i}', 'semestre': c['semestre'],
                    'jour': JOURS.get(fold(c['jour']), c['jour']),
                    'debut': c['debut'], 'fin': c['fin'], 'titre': c['titre'],
                    'salle': c.get('salle'), 'cadence': c.get('cadence', 'hebdomadaire'),
                    'note': c.get('note', '')})
    return out


def construire(slug):
    chemin = f'{BRUT}/{slug}.txt'
    ids = catalogue(slug)
    lignes = lire_brut(chemin)
    sup = appoint(slug)
    if sup:
        print(f"  {len(sup)} creneaux d'appoint, releves sur les fiches de cours")
    lignes = lignes + sup
    corr = corrections(slug)
    for l in lignes:
        cle = (l['semestre'], l['jour'], l['debut'])
        if cle in corr and l['titre'] != corr[cle]:
            # on ne corrige que ce qui resiste : un intitule deja resolu reste
            if resoudre(l['titre'], ids)[1]:
                l['titre'] = corr[cle]
    creneaux, soucis, approx = [], [], []
    for l in lignes:
        cid, err = resoudre(l['titre'], ids)
        if err and (err.startswith('SIMILARITE') or err.startswith('MOTS COMMUNS')):
            approx.append((l['n'], l['titre'], cid, err))
            err = None
        if err:
            soucis.append((l['n'], l['titre'], err))
            continue
        if not re.match(r'^\d{1,2}:\d{2}$', l['debut']) or not re.match(r'^\d{1,2}:\d{2}$', l['fin']):
            soucis.append((l['n'], l['titre'], f"heures illisibles : {l['debut']} / {l['fin']}"))
            continue
        for c in (cid if isinstance(cid, list) else [cid]):
            creneaux.append({'cours': c, 'semestre': l['semestre'], 'jour': l['jour'],
                             'debut': l['debut'], 'fin': l['fin'], 'salle': l['salle'],
                             'cadence': l['cadence'], 'note': l['note']})

    sem = {}
    for c in creneaux:
        sem[c['semestre']] = sem.get(c['semestre'], 0) + 1
    sans = sorted(k for k in ids if k not in {c['cours'] for c in creneaux})

    print(f"{slug:26} {len(creneaux):3} creneaux  {dict(sorted(sem.items()))}")
    if soucis:
        print(f"{'':26} A CORRIGER ({len(soucis)}) :")
        for n, titre, err in soucis:
            print(f"{'':28} ligne {n} « {titre[:44]} » -> {err}")
    if approx:
        print(f"{'':26} rapproches par similarite ({len(approx)}) :")
        for n, titre, cid, note in approx:
            print(f"{'':28} ligne {n} « {titre[:40]} » -> {cid}  [{note}]")
    if sans:
        print(f"{'':26} {len(sans)} cours du plan sans creneau")

    rapport = {'programme': slug, 'nonResolus': [
        {'ligne': n, 'titre': t, 'raison': e} for n, t, e in soucis],
        'rapprochesParSimilarite': [
        {'ligne': n, 'titre': t, 'retenu': c, 'note': e} for n, t, c, e in approx]}
    json.dump(rapport, io.open(f'{SORTIE}/rapport-{slug}.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

    if creneaux:
        out = {
            'programme': slug,
            'source': {
                'document': "Horaire type officiel du programme, relevé par capture d'écran de l'agenda UNIL",
                'url': 'https://applicationspub.unil.ch/interpub/noauth/php/Ud/index.php?v_ueid=173&v_langue=fr',
                'releveLe': '2026-08-26',
                'releveParUnHumain': True,
                'note': "Extrait des PDF officiels par géométrie. Les heures sont calées automatiquement sur la grille du document. Les intitulés sont recoupés avec le catalogue ; ceux que la mise en page du PDF a hachés au point de les rendre méconnaissables sont exclus et listés dans rapport-<master>.json.",
            },
            'creneaux': creneaux,
        }
        json.dump(out, io.open(f'{SORTIE}/{slug}.json', 'w', encoding='utf-8'),
                  ensure_ascii=False, indent=1)
    return len(soucis)


def main():
    os.makedirs(BRUT, exist_ok=True)
    cibles = sys.argv[1:] or [os.path.basename(f)[:-4] for f in sorted(glob.glob(f'{BRUT}/*.txt'))]
    total = 0
    for slug in cibles:
        if not os.path.exists(f'{BRUT}/{slug}.txt'):
            print(f'{slug:26} pas de releve brut')
            continue
        total += construire(slug)
    print()
    print('OK' if not total else f'{total} ligne(s) a corriger avant ecriture')
    sys.exit(1 if total else 0)


main()
