import {
  createEmptyBoard,
  placeMines,
  calculateNumbers,
  floodFill,
} from "./minefield.js";
import { showScreen } from "./screens.js";

let board = null; // the game board data (2D array of cells)
let rows = 0;
let cols = 0;
let minesCount = 0;
let firstClickDone = false;
let currentDifficulty = null; // stores the configuration (rows, cols, mines)
let timerInterval = null;
let startTime = null;
let gameOver = false; // when true, no further moves are allowed

// Cache the grid container
const gridContainer = document.getElementById("minesweeper-grid");

export function initGame() {
  // Listen for our custom "startGame" event
  document.addEventListener("startGame", (e) => {
    currentDifficulty = e.detail;
    startNewGame(
      currentDifficulty.rows,
      currentDifficulty.cols,
      currentDifficulty.mines
    );
  });

  // Reset button
  document.getElementById("reset-button").addEventListener("click", () => {
    // Restart the game with the same configuration
    if (currentDifficulty) {
      startNewGame(
        currentDifficulty.rows,
        currentDifficulty.cols,
        currentDifficulty.mines
      );
    }
  });

  // Spacebar resets the game
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      document.getElementById("reset-button").click();
    }
  });
}

function startNewGame(r, c, mines) {
  // Clear any running timer
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById("timer").textContent = "00:00";
  document.getElementById("mine-counter").textContent = mines;

  rows = r;
  cols = c;
  minesCount = mines;
  firstClickDone = false;
  gameOver = false; // allow moves in the new game

  // Create an empty board (data only)
  board = createEmptyBoard(rows, cols);

  // Render grid in DOM
  renderGrid(rows, cols);

  // Switch to game screen
  showScreen("screen-game");
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  document.getElementById("timer").textContent = `${minutes}:${seconds}`;
}

function getTileSize(rows, cols) {
  // You might reserve some vertical space for the UI (like the top UI)
  // For example, assume the grid can use 80% of the viewport height.
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight * 0.8;

  const tileWidth = availableWidth / cols;
  const tileHeight = availableHeight / rows;

  // Use the smaller value to keep a square tile (aspect-ratio 1:1).
  return Math.floor(Math.min(tileWidth, tileHeight));
}

function renderGrid(r, c) {
  gridContainer.innerHTML = ""; // Clear previous grid

  // Compute the optimal tile size using the helper function.
  const tileSize = getTileSize(r, c);

  // Set a custom property on the grid container.
  gridContainer.style.setProperty('--tile-size', tileSize + 'px');

  // Set up the grid container using the computed tile size.
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateRows = `repeat(${r}, ${tileSize}px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${c}, ${tileSize}px)`;

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", "tile-hidden");
      tile.dataset.row = i;
      tile.dataset.col = j;

      // Prevent default context menu on right-click.
      tile.addEventListener("contextmenu", (e) => e.preventDefault());

      // mousedown (for highlighting)
      tile.addEventListener("mousedown", handleMouseDown);
      // mouseup (for handling click actions)
      tile.addEventListener("mouseup", handleMouseUp);

      gridContainer.appendChild(tile);
    }
  }
}

function handleMouseDown(e) {
  if (gameOver) return;

  const tile = e.currentTarget;
  const row = parseInt(tile.dataset.row);
  const col = parseInt(tile.dataset.col);

  // If this tile is flagged, do nothing.
  if (board[row][col].flagged) return;

  // If the clicked tile is already revealed and is a number,
  // highlight all surrounding hidden (and unflagged) neighbors.
  if (board[row][col].revealed && board[row][col].number > 0) {
    const neighbors = getNeighbors(row, col);
    neighbors.forEach(([r, c]) => {
      if (!board[r][c].revealed && !board[r][c].flagged) {
        const neighborTile = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
        if (neighborTile) {
          neighborTile.classList.add("tile-highlight");
        }
      }
    });
  } else {
    // Otherwise, simply highlight the tile that was clicked.
    tile.classList.add("tile-highlight");
  }
}


function handleMouseUp(e) {
  // Do nothing if the game has ended.
  if (gameOver) return;

  const tile = e.currentTarget;
  tile.classList.remove("tile-highlight");

  const row = parseInt(tile.dataset.row);
  const col = parseInt(tile.dataset.col);

  // If left-click on a flagged tile, do nothing.
  if (e.button === 0 && board[row][col].flagged) return;

  if (e.button === 0) {
    // Left click
    if (!firstClickDone) {
      // On first left-click, place mines (avoiding the clicked cell and its neighbors)
      board = placeMines(board, minesCount, row, col);
      board = calculateNumbers(board);
      firstClickDone = true;
    }

    // If the tile is already revealed and is a number,
    // perform a “chord” (if number of flagged neighbors equals the number)
    if (board[row][col].revealed) {
      chordReveal(row, col);
    } else {
      revealTile(row, col);
    }
  } else if (e.button === 2) {
    // Right click – toggle flag
    toggleFlag(row, col);
  }

  updateMineCounter();
  // Defer win-condition check to allow final flag UI update.
  setTimeout(checkWinCondition, 0);
}

/**
 * Reveals the tile at (row, col). If the tile is blank (number === 0),
 * uses floodFill to reveal adjacent tiles.
 */
function revealTile(row, col) {
  if (board[row][col].flagged || board[row][col].revealed) return;
  if (board[row][col].mine) {
    // Hit a mine – game over.
    board[row][col].revealed = true;
    updateTileDOM(row, col, true);
    revealAllMines();
    clearInterval(timerInterval);
    gameOver = true;
    // Optionally, update the UI to display a "Game Over" message.
  } else if (board[row][col].number > 0) {
    board[row][col].revealed = true;
    updateTileDOM(row, col);
  } else {
    // Blank tile – perform flood fill.
    const revealedCells = floodFill(board, row, col);
    revealedCells.forEach(([r, c]) => updateTileDOM(r, c));
  }
}

/**
 * Chording: if a revealed numbered tile has the same number of flags around it,
 * reveal all adjacent non-flagged tiles.
 */
function chordReveal(row, col) {
  const cell = board[row][col];
  if (cell.number === 0) return;
  const neighbors = getNeighbors(row, col);
  const flaggedCount = neighbors.reduce((acc, [r, c]) => {
    return acc + (board[r][c].flagged ? 1 : 0);
  }, 0);

  if (flaggedCount === cell.number) {
    neighbors.forEach(([r, c]) => {
      if (!board[r][c].revealed && !board[r][c].flagged) {
        revealTile(r, c);
      }
    });
  }
}

/**
 * Toggle flag state on the cell at (row, col) and update its DOM.
 */
function toggleFlag(row, col) {
  if (gameOver) return;
  if (board[row][col].revealed) return;
  board[row][col].flagged = !board[row][col].flagged;
  updateTileDOM(row, col);
}

/**
 * Return an array of valid [row, col] neighbors of the cell at (row, col).
 */
function getNeighbors(row, col) {
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
}

/**
 * Update the mine counter in the UI.
 */
function updateMineCounter() {
  // Count how many flags are placed.
  let flagsPlaced = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].flagged) flagsPlaced++;
    }
  }
  document.getElementById("mine-counter").textContent =
    minesCount - flagsPlaced;
}

/**
 * Update the DOM element for the tile at (row, col) based on board state.
 */
function updateTileDOM(row, col, hit = false) {
  const cell = board[row][col];
  // Use a selector that uniquely identifies the tile.
  const tile = document.querySelector(
    `.tile[data-row="${row}"][data-col="${col}"]`
  );
  if (!tile) return;

  if (cell.revealed) {
    tile.classList.remove("tile-hidden");
    tile.classList.add("tile-revealed");
    tile.innerHTML = ""; // Clear any existing content.
    if (cell.mine) {
      tile.classList.add("tile-bomb");
      // If this is the hit mine, add an extra class.
      if (hit) tile.classList.add("tile-hit");
      tile.innerHTML = `<img src="assets/images/mine.png" alt="mine" draggable="false">`;
    } else if (cell.number > 0) {
      tile.classList.add("tile-number");
      tile.classList.add(`tile-number-${cell.number}`);
      tile.textContent = cell.number;
    }
  } else {
    // Still hidden – show flag if flagged.
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
 * Reveal all mines (called when the game is lost).
 */
function revealAllMines() {
  // Reveal all hidden mines.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine && !board[r][c].revealed) {
        board[r][c].revealed = true;
        updateTileDOM(r, c);
      }
    }
  }
  // Mark misflagged tiles (flagged but not mines).
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].flagged && !board[r][c].mine) {
        const tile = document.querySelector(
          `.tile[data-row="${r}"][data-col="${c}"]`
        );
        if (tile) {
          tile.classList.add("tile-misflag");
        }
      }
    }
  }
}

/**
 * Check if the player has won (all non-mine cells revealed).
 */
function checkWinCondition() {
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
    clearInterval(timerInterval);
    gameOver = true;
  }
}

window.addEventListener("resize", () => {
  if (board && !gameOver) {
    // Re-render the grid with the current rows and cols
    renderGrid(rows, cols);
  }
});

document.addEventListener("mouseup", () => {
  // Remove the highlight from any tile that might be highlighted.
  const highlightedTiles = document.querySelectorAll(".tile-highlight");
  highlightedTiles.forEach(tile => tile.classList.remove("tile-highlight"));
});