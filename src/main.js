import "./style.css";
import { registerScreen, initRouter } from "./router.js";
import { renderMainMenu } from "./screens/mainMenu.js";
import { renderLoadGame } from "./screens/loadGame.js";
import { renderMultiplayer } from "./screens/multiplayer.js";
import { renderQuit } from "./screens/quit.js";
import { renderGalaxyMapPlaceholder } from "./screens/galaxyMapPlaceholder.js";

registerScreen("main-menu", renderMainMenu);
registerScreen("load-game", renderLoadGame);
registerScreen("multiplayer", renderMultiplayer);
registerScreen("quit", renderQuit);
registerScreen("galaxy-map", renderGalaxyMapPlaceholder);

const app = document.getElementById("app");
initRouter(app, "main-menu");
