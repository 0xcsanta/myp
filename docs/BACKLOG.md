# À décider, à faire

## Demandé, pas encore construit

- [ ] **Export du calendrier en PDF et en PNG.** En plus de l'export `.ics`.
      Le PNG sert au partage rapide entre étudiants, le PDF à l'impression et à
      l'entretien de conseil aux études. Piste : rendu du calendrier dans un
      canevas, puis `toBlob` pour le PNG et une mise en page dédiée pour le PDF,
      le tout côté client pour éviter tout serveur de rendu.

- [ ] **Plusieurs styles de calendrier, avec fond personnalisable.**
      *À rediscuter avec Clément avant de construire.* Questions ouvertes :
      combien de styles, un fond image ou seulement des thèmes de couleur, est
      ce que le style choisi se retrouve dans l'export PNG, est ce qu'il se
      partage avec l'URL. Attention à ne pas rendre le calendrier illisible :
      la lisibilité prime sur la décoration.

## Décisions en attente

- [ ] **Le nom.** Cursus, ou une alternative.
- [ ] **Périmètre de la version 1.** Les dix masters, ou le seul MScIS pour
      tester auprès des camarades.
- [ ] **Supabase tout de suite ou à l'étape 3.**
- [ ] **Envoyer la demande d'accès à l'UNIL** (brouillon prêt dans
      [LEGAL.md](./LEGAL.md), section 5). C'est ce qui débloquerait la mise à
      jour automatique.

## Crédits Higgsfield

Solde : 10. Réservation décidée avec Clément :

- 2 crédits pour l'image Open Graph, à générer **après** l'arrivée de la
  section d'accueil Figma, pour que la vignette suive la même direction.
- 2 crédits gardés pour le visuel de lancement.
- 6 crédits libres.

Pas de génération pour le favicon, le logo, ni les états vides : typographie et
SVG font mieux et ne coûtent rien.
