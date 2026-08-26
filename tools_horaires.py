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
import glob, io, json, os, re, sys, unicodedata

BRUT = 'data/horaires/brut'
SORTIE = 'data/horaires'
ANNEE_REGLES = '2025-2026'

CADENCES = {'hebdomadaire', 'quinzaine', 'bloc', 'irregulier'}
JOURS = {'lundi': 'Lundi', 'mardi': 'Mardi', 'mercredi': 'Mercredi',
         'jeudi': 'Jeudi', 'vendredi': 'Vendredi', 'samedi': 'Samedi'}


def fold(t):
    n = unicodedata.normalize('NFKD', t)
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
        return None, f'ambigu, {len(exact)} cours portent ce titre exact'

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

    proches = sorted(ids, key=lambda k: -len(os.path.commonprefix([fold(ids[k]), cible])))[:3]
    return None, 'introuvable, proches : ' + ', '.join(proches)


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


def construire(slug):
    chemin = f'{BRUT}/{slug}.txt'
    ids = catalogue(slug)
    lignes = lire_brut(chemin)
    creneaux, soucis = [], []
    for l in lignes:
        cid, err = resoudre(l['titre'], ids)
        if err:
            soucis.append((l['n'], l['titre'], err))
            continue
        if not re.match(r'^\d{1,2}:\d{2}$', l['debut']) or not re.match(r'^\d{1,2}:\d{2}$', l['fin']):
            soucis.append((l['n'], l['titre'], f"heures illisibles : {l['debut']} / {l['fin']}"))
            continue
        creneaux.append({'cours': cid, 'semestre': l['semestre'], 'jour': l['jour'],
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
    if sans:
        print(f"{'':26} {len(sans)} cours du plan sans creneau")

    if not soucis:
        out = {
            'programme': slug,
            'source': {
                'document': "Horaire type officiel du programme, relevé par capture d'écran de l'agenda UNIL",
                'url': 'https://applicationspub.unil.ch/interpub/noauth/php/Ud/index.php?v_ueid=173&v_langue=fr',
                'releveLe': '2026-08-26',
                'releveParUnHumain': True,
                'note': "Transcription d'images. Les intitulés sont recoupés automatiquement avec le catalogue, mais les heures et les salles ne peuvent pas l'être : à vérifier sur l'horaire officiel avant de s'inscrire.",
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
