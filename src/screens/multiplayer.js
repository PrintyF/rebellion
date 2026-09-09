export function renderMultiplayer(container, { goTo }) {
  container.innerHTML = `
    <div class="screen multiplayer">
      <h1>Multijoueur</h1>
      <p>Multijoueur — bientôt disponible.</p>
      <button type="button" data-action="back">Retour au menu principal</button>
    </div>
  `;

  container.querySelector('[data-action="back"]').addEventListener("click", () => goTo("main-menu"));
}
