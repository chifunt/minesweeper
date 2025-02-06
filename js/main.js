/**
 * Main entry point for the Minesweeper game.
 */

import { initScreens, showScreen } from "./screens.js";
import { initGame } from "./game.js";
import { initSounds } from "./sound.js";
import { initUISounds } from "./uiSounds.js";

document.addEventListener("DOMContentLoaded", () => {
  initScreens();
  initGame();
  initSounds();
  initUISounds();
  // Initially display the main menu screen.
  showScreen("screen-mainmenu");
});
