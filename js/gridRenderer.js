/**
 * @module gridRenderer
 * Handles the rendering and updating of the game grid.
 */
import { GameState } from "./gameState.js";

/**
 * Calculates the optimal tile size (in pixels) for the given grid dimensions.
 * @param {number} rows
 * @param {number} cols
 * @returns {number} Tile size in pixels.
 */
export function getTileSize(rows, cols) {
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight * 0.8; // Reserve some space for UI.
  const tileWidth = availableWidth / cols;
  const tileHeight = availableHeight / rows;
  return Math.floor(Math.min(tileWidth, tileHeight));
}

/**
 * Renders the grid of tiles in the DOM.
 * @param {number} rows - Number of rows.
 * @param {number} cols - Number of columns.
 * @param {Object} tileEventHandlers - An object containing the event handlers for tiles.
 */
export function renderGrid(rows, cols, tileEventHandlers) {
  const gridContainer = document.getElementById("minesweeper-grid");
  gridContainer.innerHTML = "";

  const tileSize = getTileSize(rows, cols);
  gridContainer.style.setProperty('--tile-size', `${tileSize}px`);
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", "tile-hidden");
      tile.dataset.row = i.toString();
      tile.dataset.col = j.toString();

      // Prevent the default right-click context menu.
      tile.addEventListener("contextmenu", (e) => e.preventDefault());
      tile.addEventListener("mousedown", tileEventHandlers.handleMouseDown);
      tile.addEventListener("mouseup", tileEventHandlers.handleMouseUp);
      tile.addEventListener("mouseenter", () => {
        if (!GameState.gameOver && tile.classList.contains("tile-hidden")) {
          // Optionally play a hover sound here.
        }
      });
      gridContainer.appendChild(tile);
    }
  }
}

/**
 * Updates the DOM for a single tile based on its state.
 * @param {number} row
 * @param {number} col
 * @param {boolean} [hit=false] - If true, indicates that this mine was the hit mine.
 */
export function updateTileDOM(row, col, hit = false) {
  const { board } = GameState;
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
}

/**
 * Updates the mine counter display in the UI.
 */
export function updateMineCounter() {
  const { board, minesCount, rows, cols } = GameState;
  let flagsPlaced = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].flagged) flagsPlaced++;
    }
  }
  document.getElementById("mine-counter").textContent = (minesCount - flagsPlaced).toString();
}

/**
 * Recalculates the grid layout and updates all tiles (e.g., on window resize).
 */
export function updateGrid() {
  const gridContainer = document.getElementById("minesweeper-grid");
  const { rows, cols } = GameState;
  const tileSize = getTileSize(rows, cols);
  gridContainer.style.setProperty('--tile-size', `${tileSize}px`);
  gridContainer.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      updateTileDOM(i, j);
    }
  }
}
