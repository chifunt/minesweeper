export function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "flex";
}

export function initScreens() {
  // Main Menu difficulty buttons:
  document.getElementById("beginner-button").addEventListener("click", () => {
    const config = { rows: 8, cols: 8, mines: 10 };
    const event = new CustomEvent("startGame", { detail: config });
    document.dispatchEvent(event);
  });
  document.getElementById("intermediate-button").addEventListener("click", () => {
    const config = { rows: 16, cols: 16, mines: 40 };
    const event = new CustomEvent("startGame", { detail: config });
    document.dispatchEvent(event);
  });
  document.getElementById("expert-button").addEventListener("click", () => {
    const config = { rows: 16, cols: 30, mines: 99 };
    const event = new CustomEvent("startGame", { detail: config });
    document.dispatchEvent(event);
  });

  // Help button – show the rules screen.
  document.getElementById("help-button").addEventListener("click", () => {
    showScreen("screen-help");
  });

  // All return-to-mainmenu buttons:
  document.querySelectorAll(".mainmenu-return-button").forEach((button) => {
    button.addEventListener("click", () => {
      showScreen("screen-mainmenu");
    });
  });
}
