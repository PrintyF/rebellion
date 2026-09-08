# Environnements

Le projet est 100% front-end (Vite, pas de backend) au 2026-09-08. Pas d'hébergement staging/prod mis en place pour l'instant (décision explicite — à revoir avec l'utilisateur, notamment quand EP12 Multijoueur imposera un vrai backend/serveur de synchronisation).

## Dev (local)

- `npm install` puis `npm run dev` — serveur Vite avec hot reload, c'est l'environnement de travail par défaut pour toute story.
- `npm run build && npm run preview` — build de production servi localement. À utiliser avant merge pour vérifier qu'il n'y a pas de régression liée au bundling (imports cassés, chemins relatifs, etc.), notamment pour les stories QA/UI.
- Aucune variable d'environnement définie actuellement (pas de `.env`). En ajouter un si une story introduit une config sensible à l'environnement (ex: URL d'un serveur multijoueur en EP12) — décision Tech Lead.

## Staging / Production

Pas encore mis en place. Quand une cible d'hébergement sera choisie (GitHub Pages, Netlify/Vercel, ou autre — dépend des besoins d'EP12), ce document sera mis à jour avec :
- l'URL de chaque environnement,
- le déclencheur de déploiement (push sur `main` pour prod, PR pour preview),
- les variables d'environnement spécifiques à chaque cible.

## Branches comme proxy d'environnement (en attendant un vrai staging)

- `main` — toujours dans un état fonctionnel (build qui passe, stories mergées validées QA + review). C'est l'équivalent actuel de "production" : rien n'y arrive sans être passé par le workflow de review (voir `CLAUDE.md`).
- Branches de story (`us<epic>.<n>-slug`) — équivalent "dev" : espace de travail avant validation.

## Base de données / état de jeu

Pas de backend ni de base de données pour l'instant. L'état de jeu vit dans le navigateur (cf. EP10 Sauvegarde — stockage local prévu). Ce document sera étendu quand EP12 (multijoueur) introduira un serveur.
