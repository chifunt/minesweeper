/**
 * @module screens
 * Handles switching between the various screens in the UI.
 */

/**
 * Displays the specified screen by its element ID.
 * @param {string} screenId - The ID of the screen to display.
 */
export function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "flex";
}

/**
 * Initializes event listeners for screen navigation.
 */
export function initScreens() {
  document.getElementById("beginner-button").addEventListener("click", () => {
    const config = { rows: 8, cols: 8, mines: 10 };
    document.dispatchEvent(new CustomEvent("startGame", { detail: config }));
  });
  document.getElementById("intermediate-button").addEventListener("click", () => {
    const config = { rows: 16, cols: 16, mines: 40 };
    document.dispatchEvent(new CustomEvent("startGame", { detail: config }));
  });
  document.getElementById("expert-button").addEventListener("click", () => {
    const config = { rows: 16, cols: 30, mines: 99 };
    document.dispatchEvent(new CustomEvent("startGame", { detail: config }));
  });

  document.getElementById("help-button").addEventListener("click", () => {
    showScreen("screen-help");
  });

  document.querySelectorAll(".mainmenu-return-button").forEach((button) => {
    button.addEventListener("click", () => {
      showScreen("screen-mainmenu");
    });
  });
}
