/**
 * @module sound
 * Provides functions for initializing and playing game sounds.
 */

const sounds = {
  explosion: {
    src: "assets/audio/explosion.mp3",
    volume: 0.8,
    audio: null,
  },
  flagPlace: {
    src: "assets/audio/flag-place.mp3",
    volume: 0.5,
    audio: null,
  },
  gameWon: {
    src: "assets/audio/game-won.mp3",
    volume: 0.5,
    audio: null,
  },
  tileHover: {
    src: "assets/audio/tile-hover.mp3",
    volume: 0.07,
    audio: null,
  },
  tileReveal: {
    src: "assets/audio/tile-reveal.mp3",
    volume: 0.2,
    audio: null,
  },
  uiClick: {
    src: "assets/audio/ui-click.mp3",
    volume: 0.5,
    audio: null,
  },
  uiHover: {
    src: "assets/audio/ui-hover.mp3",
    volume: 0.5,
    audio: null,
  },
};

/**
 * Initializes each sound by creating an Audio object.
 */
function initSounds() {
  Object.keys(sounds).forEach((key) => {
    const sound = sounds[key];
    sound.audio = new Audio(sound.src);
    sound.audio.volume = sound.volume;
  });
}

/**
 * Plays the specified sound.
 * @param {string} name - The key name of the sound (e.g., "explosion").
 */
function playSound(name) {
  const sound = sounds[name];
  if (sound?.audio) {
    sound.audio.currentTime = 0;
    sound.audio.play();
  }
}

/**
 * Sets the volume for a specific sound.
 * @param {string} name - The key name of the sound.
 * @param {number} volume - A number between 0.0 and 1.0.
 */
function setVolume(name, volume) {
  const sound = sounds[name];
  if (sound?.audio) {
    sound.audio.volume = volume;
    sound.volume = volume;
  }
}

export { initSounds, playSound, setVolume };
