// Mock en mémoire en attendant une vraie persistance (EP10). Isolé dans son
// propre module pour que le remplacement par la vraie sauvegarde se limite à
// réécrire ce fichier, sans toucher l'écran des sauvegardes.
let saves = [
  {
    id: "save-1",
    name: "Partie de Mon Mothma",
    turn: 12,
    savedAt: "2026-08-20T10:15:00Z",
    gameConfig: { galaxySize: "medium", difficulty: "medium", faction: "alliance" },
  },
  {
    id: "save-2",
    name: "Campagne Impériale",
    turn: 34,
    savedAt: "2026-09-01T18:42:00Z",
    gameConfig: { galaxySize: "large", difficulty: "hard", faction: "empire" },
  },
];

export function listSaves() {
  return saves;
}

export function getSave(id) {
  return saves.find((save) => save.id === id) ?? null;
}

export function renameSave(id, newName) {
  const save = getSave(id);
  if (save) save.name = newName;
}

export function deleteSave(id) {
  saves = saves.filter((save) => save.id !== id);
}
