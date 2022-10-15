export const canvas = document.querySelector("#board");
export const startBtn = document.querySelector("#start-btn");
export const gameContainer = document.querySelector("#game-container");
export const canvasContext = canvas.getContext("2d", {
  willReadFrequently: true,
});
export const difficultyContainer = document.querySelector(
  "#difficulty-container"
);
export const DIFFICULTIES = [
  { redraw: 25, walls: 0, score: 1, mode: "Normal" },
  { redraw: 20, walls: 2, score: 2, mode: "Hard" },
  { redraw: 15, walls: 5, score: 3, mode: "Expert" },
];
export const REDRAW_DELAY = 25;
export const SEGMENT_SIZE = 20;
export const SEGMENT_DIVISION = 4;
export const SNAKE_LENGTH = 1;
export const SNAKE_COLOR = [0, 200, 0, 1];
export const INITIAL_DIR = "up";
export const FOOD_COLOR = [0, 0, 255, 1];
export const FOOD_LOCATION = [];
export const TIMEOUTS = [];
