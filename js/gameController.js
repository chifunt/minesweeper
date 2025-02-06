/**
 * @module gameController
 * Orchestrates the overall game flow.
 */
import { GameState } from "./gameState.js";
import { createEmptyBoard } from "./minefield.js";
import { showScreen } from "./screens.js";
import { renderGrid, updateGrid } from "./gridRenderer.js";
import { handleMouseDown, handleMouseUp } from "./inputHandler.js";
import { startTimer, stopTimer } from "./timer.js";
import { playSound } from "./sound.js";

/**
 * Initializes the game by setting up event listeners.
 */
export function initGame() {
  document.addEventListener("startGame", (e) => {
    GameState.currentDifficulty = e.detail;
    startNewGame(
      GameState.currentDifficulty.rows,
      GameState.currentDifficulty.cols,
      GameState.currentDifficulty.mines
    );
  });

  document.getElementById("reset-button").addEventListener("click", () => {
    const resetButton = document.getElementById("reset-button");
    // Remove any previous win or lose classes from reset button, mine counter, and timer.
    resetButton.classList.remove("win", "lose");
    document.getElementById("mine-counter").classList.remove("win", "lose");
    document.getElementById("timer").classList.remove("win", "lose");

    playSound("uiClick");
    if (GameState.currentDifficulty) {
      startNewGame(
        GameState.currentDifficulty.rows,
        GameState.currentDifficulty.cols,
        GameState.currentDifficulty.mines
      );
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      document.getElementById("reset-button").click();
    }
  });

  // Remove lingering tile highlights on mouseup.
  document.addEventListener("mouseup", () => {
    GameState.activeTile = null;
    document.querySelectorAll(".tile-highlight").forEach((tile) =>
      tile.classList.remove("tile-highlight")
    );
  });

  window.addEventListener("resize", () => {
    if (GameState.board && !GameState.gameOver) {
      updateGrid();
    }
  });
}

/**
 * Starts a new game with the specified configuration.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {number} mines - Number of mines.
 */
function startNewGame(rows, cols, mines) {
  stopTimer();
  // Set up and start the timer.
  const timerDisplayCallback = (elapsed) => {
    const minutes = String(Math.floor(elapsed / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0");
    document.getElementById("timer").textContent = `${minutes}:${seconds}`;
  };
  startTimer(timerDisplayCallback);
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("mine-counter").textContent = mines.toString();

  GameState.rows = rows;
  GameState.cols = cols;
  GameState.minesCount = mines;
  GameState.firstClickDone = false;
  GameState.gameOver = false;
  GameState.activeTile = null;
  GameState.board = createEmptyBoard(rows, cols);

  // Pass event handlers for tiles.
  const tileEventHandlers = {
    handleMouseDown,
    handleMouseUp,
  };

  renderGrid(rows, cols, tileEventHandlers);
  showScreen("screen-game");
}
