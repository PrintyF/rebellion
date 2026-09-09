// Contenu complet à implémenter en US13.2 (config galaxie/difficulté/faction).
export function renderNewGame(container, { goTo }) {
  container.innerHTML = `
    <div class="screen new-game">
      <h1>Nouvelle partie</h1>
      <p>Configuration à venir (US13.2).</p>
      <button type="button" data-action="back">Retour au menu principal</button>
    </div>
  `;

  container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
}
