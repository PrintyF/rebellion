import "./style.css";
import { registerScreen, initRouter } from "./router.js";
import { renderMainMenu } from "./screens/mainMenu.js";
import { renderNewGame } from "./screens/newGame.js";
import { renderLoadGame } from "./screens/loadGame.js";
import { renderMultiplayer } from "./screens/multiplayer.js";
import { renderQuit } from "./screens/quit.js";

registerScreen("main-menu", renderMainMenu);
registerScreen("new-game", renderNewGame);
registerScreen("load-game", renderLoadGame);
registerScreen("multiplayer", renderMultiplayer);
registerScreen("quit", renderQuit);

const app = document.getElementById("app");
initRouter(app, "main-menu");
