// Contenu complet à implémenter en US13.3 (liste des sauvegardes, charger/renommer/supprimer).
export function renderLoadGame(container, { goTo }) {
  container.innerHTML = `
    <div class="screen load-game">
      <h1>Sauvegardes</h1>
      <p>Gestion des sauvegardes à venir (US13.3).</p>
      <button type="button" data-action="back">Retour au menu principal</button>
    </div>
  `;

  container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
}
