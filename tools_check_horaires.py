# -*- coding: utf-8 -*-
"""
Recoupe les creneaux releves avec le catalogue du master.

Les intitules sont verifiables automatiquement, pas les heures ni les salles :
ce controle attrape donc les fautes de transcription sur les noms de cours, et
signale les cours du plan d'etudes qui n'ont encore aucun creneau.
"""
import glob, io, json, os, re, sys, unicodedata

def ident(t, i=0):
    n = unicodedata.normalize('NFKD', t)
    n = ''.join(c for c in n if not unicodedata.combining(c)).lower()
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', n))[:46] or f'cours-{i}'

erreurs = 0
for f in sorted(glob.glob('data/horaires/*.json')):
    if os.path.basename(f).startswith(('rapport-', 'corrections')):
        continue
    h = json.load(io.open(f, encoding='utf-8'))
    slug = h['programme']
    cat = json.load(io.open(f'data/programmes/{slug}-2025-2026.json', encoding='utf-8'))['courses']
    ids, vus = {}, {}
    for i, c in enumerate(cat):
        k = ident(c['title'], i)
        n = vus.get(k, 0)
        if n: k = f'{k}-{n+1}'
        vus[k] = vus.get(k, 0) + 1
        ids[k] = c['title']

    inconnus = sorted({x['cours'] for x in h['creneaux'] if x['cours'] not in ids})
    couverts = {x['cours'] for x in h['creneaux']}
    sans = sorted(k for k in ids if k not in couverts)
    sem = {}
    for x in h['creneaux']:
        sem[x['semestre']] = sem.get(x['semestre'], 0) + 1

    print(f"{slug:26} {len(h['creneaux']):3} creneaux  {dict(sorted(sem.items()))}")
    if inconnus:
        erreurs += len(inconnus)
        print(f"{'':26} INTITULES INCONNUS ({len(inconnus)}) :")
        for k in inconnus:
            proche = sorted(ids, key=lambda a: -len(os.path.commonprefix([a, k])))[:2]
            print(f"{'':28} {k}   proche de -> {', '.join(proche)}")
    if sans:
        print(f"{'':26} sans creneau ({len(sans)}) : {', '.join(sans[:6])}{' ...' if len(sans) > 6 else ''}")

print()
print('OK, aucun intitule inconnu' if not erreurs else f'{erreurs} intitule(s) a corriger')
sys.exit(1 if erreurs else 0)
