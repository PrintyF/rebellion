// État de la partie en cours de configuration/lancée. EP2 (carte galactique)
// lira `gameConfig` pour initialiser son propre état — voir US13.1/US13.2.
// Difficulté et taille de galaxie ont une valeur par défaut car le menu
// principal les affiche déjà pré-sélectionnées ("Partie standard") ; seule
// la faction reste à choisir, son choix déclenchant le lancement direct.
export const gameConfig = {
  galaxySize: "medium",
  difficulty: "medium",
  faction: null,
};

export function setGalaxySize(value) {
  gameConfig.galaxySize = value;
}

export function setDifficulty(value) {
  gameConfig.difficulty = value;
}

export function setFaction(value) {
  gameConfig.faction = value;
}
