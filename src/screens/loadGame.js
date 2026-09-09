import { listSaves, getSave, renameSave, deleteSave } from "../state/savesStore.js";
import { setGalaxySize, setDifficulty, setFaction } from "../state/gameState.js";

const FACTION_LABELS = { alliance: "Alliance Rebelle", empire: "Empire Galactique" };

// Le nom d'une sauvegarde est modifiable par l'utilisateur (Renommer) et
// réinjecté dans innerHTML à chaque render : sans échappement, un nom du
// type "<img src=x onerror=...>" s'exécuterait au prochain draw().
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function renderLoadGame(container, { goTo }) {
  let selectedId = null;
  let renaming = false;

  function draw() {
    const saves = listSaves();
    const selected = selectedId ? getSave(selectedId) : null;

    container.innerHTML = `
      <div class="screen load-game">
        <h1>Sauvegardes</h1>

        ${
          saves.length === 0
            ? `<p class="load-game__empty">Aucune sauvegarde disponible.</p>`
            : `
              <ul class="save-list">
                ${saves
                  .map(
                    (save) => `
                      <li>
                        <button
                          type="button"
                          class="save-list__item${save.id === selectedId ? " save-list__item--selected" : ""}"
                          data-action="select"
                          data-id="${save.id}"
                        >${escapeHtml(save.name)}</button>
                      </li>
                    `
                  )
                  .join("")}
              </ul>
            `
        }

        ${
          selected
            ? `
              <div class="save-details">
                <h2>${escapeHtml(selected.name)}</h2>
                <ul>
                  <li>Faction : ${FACTION_LABELS[selected.gameConfig.faction]}</li>
                  <li>Tour actuel : ${selected.turn}</li>
                  <li>Dernière sauvegarde : ${formatDate(selected.savedAt)}</li>
                </ul>

                ${
                  renaming
                    ? `
                      <form class="save-details__rename-form" data-action="rename-form">
                        <input type="text" name="name" value="${escapeHtml(selected.name)}" aria-label="Nouveau nom de la sauvegarde" />
                        <button type="submit" class="button--primary">Valider</button>
                        <button type="button" data-action="cancel-rename">Annuler</button>
                      </form>
                    `
                    : `
                      <div class="save-details__actions">
                        <button type="button" data-action="load">Charger</button>
                        <button type="button" data-action="rename">Renommer</button>
                        <button type="button" data-action="delete" class="button--danger">Supprimer</button>
                      </div>
                    `
                }
              </div>
            `
            : ""
        }

        <button type="button" class="load-game__back" data-action="back">Retour au menu principal</button>
      </div>
    `;

    container.querySelectorAll('[data-action="select"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedId = btn.dataset.id;
        renaming = false;
        draw();
        container.querySelector(`[data-id="${selectedId}"]`)?.focus();
      })
    );

    if (selected) {
      const loadBtn = container.querySelector('[data-action="load"]');
      if (loadBtn) {
        loadBtn.addEventListener("click", () => {
          setGalaxySize(selected.gameConfig.galaxySize);
          setDifficulty(selected.gameConfig.difficulty);
          setFaction(selected.gameConfig.faction);
          goTo("galaxy-map");
        });
      }

      const renameBtn = container.querySelector('[data-action="rename"]');
      if (renameBtn) {
        renameBtn.addEventListener("click", () => {
          renaming = true;
          draw();
          container.querySelector('input[name="name"]')?.focus();
        });
      }

      const deleteBtn = container.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          deleteSave(selected.id);
          selectedId = null;
          renaming = false;
          draw();
          // <h1> n'a de tabindex que via router.js (posé lors d'un goTo), pas
          // lors de ces re-render internes : cibler un élément nativement
          // focusable pour que le focus clavier ne se perde pas dans <body>.
          container.querySelector('[data-action="back"]')?.focus();
        });
      }

      const renameForm = container.querySelector('[data-action="rename-form"]');
      if (renameForm) {
        renameForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const newName = new FormData(renameForm).get("name").trim();
          if (newName) renameSave(selected.id, newName);
          renaming = false;
          draw();
          container.querySelector('[data-action="rename"]')?.focus();
        });
      }

      const cancelRenameBtn = container.querySelector('[data-action="cancel-rename"]');
      if (cancelRenameBtn) {
        cancelRenameBtn.addEventListener("click", () => {
          renaming = false;
          draw();
          container.querySelector('[data-action="rename"]')?.focus();
        });
      }
    }

    container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
  }

  draw();
}
