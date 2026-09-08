# Roadmap — Epics & User Stories

Snapshot local des issues GitHub du repo PrintyF/rebellion (toutes ouvertes au moment de la génération, 2026-09-08). Ce fichier sert de carte de navigation hors-ligne pour éviter de re-fetch l'API GitHub à chaque session ; GitHub reste la source de vérité pour le statut réel (ouvert/fermé, commentaires, assignation). Pour rafraîchir : voir la commande curl dans CLAUDE.md.

**Ordre de traitement recommandé** (fondations avant systèmes avancés ; IA, sauvegarde, UX transverse et multijoueur en dernier car ils dépendent de tout le reste) :

## 1. EP1 — Extraction & modélisation des données
- [ ] #1 — En tant que dev, je veux un script d'extraction des données de StarWarsRebellion
- [ ] #2 — En tant que dev, je veux convertir l'export brut en JSON structuré et typé via d

## 2. EP13 — Menu principal & lancement de partie
- [ ] #3 — En tant que joueur, je veux un menu principal avec accès à la configuration de n
- [ ] #4 — En tant que joueur, je veux configurer une nouvelle partie (taille de galaxie, d
- [ ] #5 — En tant que joueur, je veux un menu des sauvegardes listant mes parties existant
- [ ] #6 — En tant que joueur, je veux un menu multijoueur accessible depuis le menu princi

## 3. EP2 — Carte galactique
- [ ] #7 — En tant que joueur, je veux voir la carte galactique intégrée dans l'interface (
- [ ] #8 — En tant que joueur, je veux voir les routes/connexions entre secteurs et système
- [ ] #9 — En tant que joueur, je veux voir un niveau de zoom "vue d'ensemble" affichant un
- [ ] #10 — En tant que joueur, je veux qu'un niveau de zoom plus poussé sur un secteur révè
- [ ] #11 — En tant que joueur, je veux cliquer sur une planète/secteur pour le sélectionner
- [ ] #12 — En tant que joueur, je veux que la carte se mette à jour automatiquement à chaqu
- [ ] #13 — En tant que joueur, je veux zoomer et me déplacer sur la carte afin de naviguer

## 4. EP3 — Moteur de tour avec timer auto-résolutif
- [ ] #14 — En tant que joueur, je veux qu'un tour dure une durée réelle réglable selon la v
- [ ] #15 — En tant que joueur, je veux que tous les ordres donnés pendant la fenêtre de tou
- [ ] #16 — En tant que joueur, je veux pouvoir mettre le jeu en pause afin de figer l'écran
- [ ] #17 — En tant que joueur, je veux pouvoir changer la vitesse de jeu en cours de tour a

## 5. EP4 — Gestion des personnages
- [ ] #18 — En tant que joueur, je veux qu'un roster de personnages (liste fixe de personnag
- [ ] #19 — En tant que joueur, je veux envoyer un personnage vers n'importe quel container

## 6. EP14 — Missions
- [ ] #20 — En tant que joueur, je veux qu'un personnage ayant la capacité "recrutement" pui
- [ ] #21 — En tant que joueur, je veux qu'un personnage ayant la capacité "espionnage" puis
- [ ] #22 — En tant que joueur, je veux qu'un personnage ayant la capacité "diplomatie" puis
- [ ] #23 — En tant que joueur, je veux qu'un personnage ayant la capacité "sabotage" puisse
- [ ] #24 — En tant que joueur, je veux qu'un personnage ayant la capacité "incitation à l'i
- [ ] #25 — En tant que joueur, je veux qu'un personnage ayant la capacité de recherche corr

## 7. EP15 — Installations planétaires
- [ ] #26 — En tant que joueur, je veux qu'une planète sous mon contrôle démarre avec des in
- [ ] #27 — En tant que joueur, je veux construire un nouveau bâtiment/installation sur une
- [ ] #28 — En tant que joueur, je veux construire un vaisseau sur une planète disposant du

## 8. EP5 — Gestion des flottes et vaisseaux
- [ ] #29 — En tant que joueur, je veux regrouper plusieurs vaisseaux en une flotte, et inve
- [ ] #30 — En tant que joueur, je veux déplacer une flotte vers n'importe quel secteur de l
- [ ] #31 — En tant que joueur, je veux stationner une flotte en orbite d'une planète afin q

## 9. EP6 — Économie & production
- [ ] #32 — En tant que joueur, je veux que mes Mines et Raffineries produisent respectiveme
- [ ] #33 — En tant que joueur, je veux disposer d'un pool de points de maintenance alimenté
- [ ] #34 — En tant que joueur, je veux qu'un ordre de construction lancé sans matériaux raf

## 10. EP7 — Combat spatial
- [ ] #35 — En tant que joueur, je veux qu'un combat spatial se déclenche et se résolve auto
- [ ] #36 — En tant que joueur, je veux consulter un rapport de bataille après un combat spa

## 11. EP8 — Combat terrestre / invasion
- [ ] #37 — En tant que joueur, je veux qu'une invasion se déclenche et se résolve automatiq
- [ ] #38 — En tant que joueur, je veux consulter un rapport d'invasion après une tentative

## 12. EP9 — IA adverse
- [ ] #39 — En tant que joueur, je veux qu'un adversaire IA prenne des décisions à chaque to

## 13. EP10 — Sauvegarde / chargement de partie
- [ ] #40 — En tant que joueur, je veux sauvegarder ma partie manuellement afin de la repren
- [ ] #41 — En tant que joueur, je veux qu'une auto-save périodique se déclenche sans action
- [ ] #42 — En tant que joueur, je veux charger une sauvegarde (depuis le stockage local ou
- [ ] #43 — En tant que joueur, je veux être averti clairement si une sauvegarde est corromp

## 14. EP11 — Interface utilisateur & UX
- [ ] #49 — En tant que joueur, je veux que l'écran de jeu assemble la carte galactique et l
- [ ] #50 — En tant que joueur, je veux un panneau de notifications (à gauche) afin d'être i
- [ ] #51 — En tant que joueur, je veux un panneau de containers favoris (à droite) afin d'a
- [ ] #52 — En tant que joueur, je veux un panneau de recherche (en bas) afin de retrouver r
- [ ] #53 — En tant que joueur, je veux un panneau supérieur affichant le temps, le contrôle

## 15. EP12 — Multijoueur
- [ ] #44 — En tant que joueur, je veux créer une partie multijoueur et obtenir un code/lien
- [ ] #45 — En tant que joueur, je veux rejoindre une partie multijoueur via un code/lien af
- [ ] #46 — En tant que joueur, je veux que mes ordres soumis pendant la fenêtre de tour soi
- [ ] #47 — En tant que joueur, je veux pouvoir me reconnecter à ma partie en cours après un
- [ ] #48 — En tant que joueur, je veux être informé si mon état de jeu diverge de celui du

