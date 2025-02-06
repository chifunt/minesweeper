/**
 * @module game
 * Handles the main game logic for Minesweeper.
 */

import {
  createEmptyBoard,
  placeMines,
  calculateNumbers,
  floodFill,
} from "./minefield.js";
import { showScreen } from "./screens.js";
import { playSound } from "./sound.js";

/** @type {Array<Array<{revealed: boolean, flagged: boolean, mine: boolean, number: number}>>} */
let board = null;
let rows = 0;
let cols = 0;
let minesCount = 0;
let firstClickDone = false;
let currentDifficulty = null;
let timerInterval = null;
let startTime = null;
let gameOver = false;
let activeTile = null;

const gridContainer = document.getElementById("minesweeper-grid");

/**
 * Initializes game event listeners.
 */
export function initGame() {
  document.addEventListener("startGame", (e) => {
    currentDifficulty = e.detail;
    startNewGame(currentDifficulty.rows, currentDifficulty.cols, currentDifficulty.mines);
  });

  document.getElementById("reset-button").addEventListener("click", () => {
    document.getElementById("reset-button").classList.remove("gameover");
    playSound("uiClick");
    if (currentDifficulty) {
      startNewGame(currentDifficulty.rows, currentDifficulty.cols, currentDifficulty.mines);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      document.getElementById("reset-button").click();
    }
  });
}

/**
 * Starts a new game with the given configuration.
 * @param {number} r - Number of rows.
 * @param {number} c - Number of columns.
 * @param {number} mines - Number of mines.
 */
const startNewGame = (r, c, mines) => {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("mine-counter").textContent = mines.toString();

  rows = r;
  cols = c;
  minesCount = mines;
  firstClickDone = false;
  gameOver = false;
  activeTile = null;

  // Create a new, empty board (data only)
  board = createEmptyBoard(rows, cols);
  renderGrid(rows, cols);
  showScreen("screen-game");
};

/**
 * Updates the game timer display.
 */
const updateTimer = () => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
};

/**
 * Calculates the optimal tile size based on viewport dimensions.
 * @param {number} rows
 * @param {number} cols
 * @returns {number} Tile size in pixels.
 */
const getTileSize = (rows, cols) => {
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight * 0.8; // Reserve some vertical space for UI
  const tileWidth = availableWidth / cols;
  const tileHeight = availableHeight / rows;
  return Math.floor(Math.min(tileWidth, tileHeight));
};

/**
 * Renders the Minesweeper grid in the DOM.
 * @param {number} r - Number of rows.
 * @param {number} c - Number of columns.
 */
const renderGrid = (r, c) => {
  gridContainer.innerHTML = ""; // Clear any previous grid

  const tileSize = getTileSize(r, c);
  gridContainer.style.setProperty("--tile-size", `${tileSize}px`);
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateRows = `repeat(${r}, ${tileSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${c}, ${tileSize}px)`;

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", "tile-hidden");
      tile.dataset.row = i.toString();
      tile.dataset.col = j.toString();

      // Prevent the default right-click context menu.
      tile.addEventListener("contextmenu", (e) => e.preventDefault());
      tile.addEventListener("mousedown", handleMouseDown);
      tile.addEventListener("mouseup", handleMouseUp);

      // Add hover effect only for hidden tiles.
      tile.addEventListener("mouseenter", () => {
        if (!gameOver && tile.classList.contains("tile-hidden")) {
          playSound("tileHover");
        }
      });

      gridContainer.appendChild(tile);
    }
  }
};

/**
 * Handles the mousedown event on a tile.
 * @param {MouseEvent} e
 */
const handleMouseDown = (e) => {
  if (gameOver) return;

  activeTile = e.currentTarget;
  const row = parseInt(activeTile.dataset.row, 10);
  const col = parseInt(activeTile.dataset.col, 10);

  if (board[row][col].flagged) return;

  // If the tile is already revealed and shows a number, highlight its neighbors.
  if (board[row][col].revealed && board[row][col].number > 0) {
    getNeighbors(row, col).forEach(([r, c]) => {
      if (!board[r][c].revealed && !board[r][c].flagged) {
        const neighborTile = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
        neighborTile?.classList.add("tile-highlight");
      }
    });
  }
  // Otherwise, if the tile is unrevealed but has a nonzero number, highlight it.
  else if (!board[row][col].revealed && board[row][col].number !== 0) {
    activeTile.classList.add("tile-highlight");
  }
};

/**
 * Handles the mouseup event on a tile.
 * @param {MouseEvent} e
 */
const handleMouseUp = (e) => {
  if (gameOver) return;

  // Ensure mouseup occurred on the same tile that received mousedown.
  if (e.currentTarget !== activeTile) {
    e.currentTarget.classList.remove("tile-highlight");
    return;
  }
  activeTile.classList.remove("tile-highlight");

  const row = parseInt(activeTile.dataset.row, 10);
  const col = parseInt(activeTile.dataset.col, 10);

  // Left-click on a flagged tile does nothing.
  if (e.button === 0 && board[row][col].flagged) return;

  if (e.button === 0) {
    // On first left-click, place mines (excluding the clicked cell and its neighbors)
    if (!firstClickDone) {
      board = placeMines(board, minesCount, row, col);
      board = calculateNumbers(board);
      firstClickDone = true;
    }
    // If the tile is already revealed, perform a chord reveal.
    if (board[row][col].revealed) {
      chordReveal(row, col);
    } else {
      revealTile(row, col);
    }
  } else if (e.button === 2) {
    // Right-click toggles a flag.
    toggleFlag(row, col);
  }

  updateMineCounter();
  // Check win condition after a short delay to allow the UI to update.
  setTimeout(checkWinCondition, 0);
};

/**
 * Reveals the tile at (row, col). For blank tiles, a flood-fill is used.
 * @param {number} row
 * @param {number} col
 */
const revealTile = (row, col) => {
  if (board[row][col].flagged || board[row][col].revealed) return;

  if (board[row][col].mine) {
    board[row][col].revealed = true;
    updateTileDOM(row, col, true);
    playSound("explosion");
    revealAllMines();
    clearInterval(timerInterval);
    gameOver = true;
  } else if (board[row][col].number > 0) {
    board[row][col].revealed = true;
    updateTileDOM(row, col);
    playSound("tileReveal");
  } else {
    // For blank (zero) cells, reveal adjacent blank areas.
    const revealedCells = floodFill(board, row, col);
    revealedCells.forEach(([r, c]) => updateTileDOM(r, c));
    playSound("tileReveal");
  }
};

/**
 * If a revealed numbered tile has the correct number of flagged neighbors,
 * reveal all adjacent non-flagged tiles.
 * @param {number} row
 * @param {number} col
 */
const chordReveal = (row, col) => {
  const cell = board[row][col];
  if (cell.number === 0) return;

  const flaggedCount = getNeighbors(row, col).reduce(
    (acc, [r, c]) => acc + (board[r][c].flagged ? 1 : 0),
    0
  );

  if (flaggedCount === cell.number) {
    getNeighbors(row, col).forEach(([r, c]) => {
      if (!board[r][c].revealed && !board[r][c].flagged) {
        revealTile(r, c);
      }
    });
  }
};

/**
 * Toggles the flagged state on the tile at (row, col).
 * @param {number} row
 * @param {number} col
 */
const toggleFlag = (row, col) => {
  if (gameOver || board[row][col].revealed) return;
  board[row][col].flagged = !board[row][col].flagged;
  updateTileDOM(row, col);
  playSound("flagPlace");
};

/**
 * Returns an array of valid [row, col] neighbors for the given cell.
 * @param {number} row
 * @param {number} col
 * @returns {Array<[number, number]>}
 */
const getNeighbors = (row, col) => {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        neighbors.push([r, c]);
      }
    }
  }
  return neighbors;
};

/**
 * Updates the mine counter UI element.
 */
const updateMineCounter = () => {
  let flagsPlaced = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].flagged) flagsPlaced++;
    }
  }
  document.getElementById("mine-counter").textContent = (minesCount - flagsPlaced).toString();
};

/**
 * Updates the DOM element for the tile at (row, col) based on its state.
 * @param {number} row
 * @param {number} col
 * @param {boolean} [hit=false] - Indicates if this tile was the mine that was hit.
 */
const updateTileDOM = (row, col, hit = false) => {
  const cell = board[row][col];
  const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
  if (!tile) return;

  if (cell.revealed) {
    tile.classList.remove("tile-hidden");
    tile.classList.add("tile-revealed");
    tile.innerHTML = "";

    if (cell.mine) {
      tile.classList.add("tile-bomb");
      if (hit) tile.classList.add("tile-hit");
      tile.innerHTML = `<img src="assets/images/mine.png" alt="mine" draggable="false">`;
    } else if (cell.number > 0) {
      tile.classList.add("tile-number", `tile-number-${cell.number}`);
      tile.textContent = cell.number.toString();
    }
  } else {
    tile.classList.add("tile-hidden");
    tile.classList.remove("tile-revealed", "tile-number", "tile-bomb");
    if (cell.flagged) {
      tile.classList.add("tile-flagged");
      tile.innerHTML = `<img src="assets/images/flag.png" alt="flag" draggable="false">`;
    } else {
      tile.classList.remove("tile-flagged");
      tile.innerHTML = "";
    }
  }
};

/**
 * Reveals all mines on the board (called when the player loses).
 */
const revealAllMines = () => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine && !board[r][c].revealed) {
        board[r][c].revealed = true;
        updateTileDOM(r, c);
      }
    }
  }
  // Highlight misflagged tiles (flagged but not mines).
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].flagged && !board[r][c].mine) {
        const tile = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
        tile?.classList.add("tile-misflag");
      }
    }
  }
};

/**
 * Checks whether all non-mine cells have been revealed (win condition).
 */
const checkWinCondition = () => {
  let won = true;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine && !board[r][c].revealed) {
        won = false;
        break;
      }
    }
    if (!won) break;
  }
  if (won) {
    document.getElementById("reset-button").classList.add("gameover");
    playSound("gameWon");
    clearInterval(timerInterval);
    gameOver = true;
  }
};

/**
 * Updates the grid layout on window resize.
 */
const updateGrid = () => {
  const tileSize = getTileSize(rows, cols);
  gridContainer.style.setProperty("--tile-size", `${tileSize}px`);
  gridContainer.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      updateTileDOM(i, j);
    }
  }
};

window.addEventListener("resize", () => {
  if (board && !gameOver) {
    updateGrid();
  }
});

document.addEventListener("mouseup", () => {
  activeTile = null;
  document.querySelectorAll(".tile-highlight").forEach((tile) => tile.classList.remove("tile-highlight"));
});
