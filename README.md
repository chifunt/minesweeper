# Minesweeper

A classic Minesweeper game implemented with HTML, CSS, and JavaScript. This project features multiple difficulty levels, responsive design, and sound effects to enhance the gameplay experience.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [File Structure](#file-structure)
  - [Root Files](#root-files)
  - [Assets](#assets)
  - [CSS](#css)
  - [JavaScript](#javascript)
- [How to Play](#how-to-play)
- [Customization](#customization)

## Overview

This Minesweeper clone reproduces the classic game mechanics:
- **Left click** to reveal tiles.
- **Right click** to flag/unflag tiles.
- **Chording** (left click on a number) to reveal adjacent tiles when enough flags are placed.
- A timer and mine counter track your progress.

The game ensures that the first click is always safe by delaying mine placement until after the initial move.

## Features

- **Multiple Difficulty Levels:** Choose between Beginner, Intermediate, and Expert configurations.
- **Responsive Design:** The grid adjusts dynamically to fit the screen size.
- **Sound Effects:** Enjoy audio feedback for actions such as clicking, hovering, and game events.
- **Clean Modular Code:** Organized code structure with dedicated modules for game state, rendering, input handling, and more.

## File Structure

The project is organized as follows:

```
├── .gitattributes
├── .gitignore
├── README.md
├── assets
│   ├── audio
│   │   ├── explosion.mp3
│   │   ├── flag-place.mp3
│   │   ├── game-won.mp3
│   │   ├── tile-hover.mp3
│   │   ├── tile-reveal.mp3
│   │   ├── ui-click.mp3
│   │   └── ui-hover.mp3
│   ├── fonts
│   │   ├── iosevka-bold.ttf
│   │   └── iosevka-regular.ttf
│   └── images
│       ├── flag.png
│       └── mine.png
├── css
│   ├── base.css
│   ├── colors.css
│   ├── fonts.css
│   ├── mainmenu.css
│   ├── reset.css
│   ├── screens.css
│   ├── styles.css
│   ├── tiles.css
│   ├── topui.css
│   └── vignettes.css
├── index.html
└── js
    ├── gameController.js
    ├── gameState.js
    ├── gridRenderer.js
    ├── inputHandler.js
    ├── main.js
    ├── minefield.js
    ├── screens.js
    ├── sound.js
    ├── timer.js
    └── uiSounds.js
```

### Root Files

- **.gitattributes:** Configures Git to handle text files (e.g., LF normalization).
- **.gitignore:** Specifies files and directories for Git to ignore.
- **README.md:** This documentation file.
- **index.html:** The main HTML file that bootstraps the Minesweeper game.

### Assets

- **assets/audio/**
  Contains the sound effects:
  - `explosion.mp3`
  - `flag-place.mp3`
  - `game-won.mp3`
  - `tile-hover.mp3`
  - `tile-reveal.mp3`
  - `ui-click.mp3`
  - `ui-hover.mp3`

- **assets/fonts/**
  Contains the Iosevka font files used in the game:
  - `iosevka-bold.ttf`
  - `iosevka-regular.ttf`

- **assets/images/**
  Contains image assets for the game:
  - `flag.png`
  - `mine.png`

### CSS

- **base.css:**
  Defines base styling for the body, buttons, and general UI elements.

- **colors.css:**
  Sets up CSS custom properties (variables) for colors used throughout the game.

- **fonts.css:**
  Imports and defines the custom fonts used in the game.

- **mainmenu.css:**
  Styles specific to the main menu screen (e.g., large title and difficulty buttons).

- **reset.css:**
  Resets browser default styles for consistency across platforms.

- **screens.css:**
  Contains layout rules for different screens (main menu, help, game).

- **styles.css:**
  The main stylesheet that imports all the individual CSS files.

- **tiles.css:**
  Provides styling for the game grid tiles (hidden, revealed, flagged, etc.).

- **topui.css:**
  Styles the top UI elements such as the mine counter and timer.

- **vignettes.css:**
  Applies a vignette overlay effect to the game screen.

### JavaScript

- **main.js:**
  Entry point for the game. Initializes screens, game logic, and UI sounds when the document is ready.

- **gameController.js:**
  Orchestrates overall game flow:
  - Starts new games
  - Handles game resets
  - Integrates the timer and UI updates

- **gameState.js:**
  Holds a singleton object that maintains the current game state (e.g., board, rows, columns, mine count, timer).

- **gridRenderer.js:**
  Responsible for rendering the Minesweeper grid in the DOM and updating individual tiles based on game events.

- **inputHandler.js:**
  Handles user input on the game grid:
  - Mouse clicks (left/right)
  - Chording logic for number tiles
  - Delegates actions to reveal tiles or toggle flags

- **minefield.js:**
  Contains helper functions for:
  - Creating an empty game board
  - Placing mines (avoiding the first click and its neighbors)
  - Calculating numbers (adjacent mines)
  - Performing a flood-fill algorithm to reveal blank areas

- **screens.js:**
  Manages switching between different UI screens:
  - Main menu
  - Help/Instructions
  - Game screen

- **sound.js:**
  Initializes and plays sound effects for game events (e.g., tile reveal, explosion, UI interactions).

- **timer.js:**
  Provides functionality to start and stop the game timer and update the display.

- **uiSounds.js:**
  Enhances the UI with sound effects on button hovers and clicks.

## How to Play

- **Left Click:** Reveal a tile. If the tile is blank, a flood-fill reveals surrounding blank areas.
- **Right Click:** Toggle a flag on a tile to mark it as potentially containing a mine.
- **Chording:** Left click on a revealed number (with the correct number of adjacent flags) to reveal surrounding tiles.
- **Spacebar:** Reset the game.

## Customization

- **Difficulty Levels:**
  - **Beginner:** 8×8 grid with 10 mines.
  - **Intermediate:** 16×16 grid with 40 mines.
  - **Expert:** 16×30 grid with 99 mines.

- **Responsive Grid:**
  The tile size adjusts automatically based on the window dimensions to ensure optimal display on various devices.

- **Sound & UI:**
  Audio feedback and visual effects are implemented to improve user experience and can be customized in the `sound.js` and CSS files.
