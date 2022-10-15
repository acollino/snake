import {
  canvas,
  SEGMENT_SIZE,
  SNAKE_LENGTH,
  SNAKE_COLOR,
} from "./constants.js";
import { Queue } from "./queue.js";
import { Snake } from "./snake.js";
import { convertWithSegments, toColorString } from "./helper_functions.js";

export class SnakeGame {
  constructor() {
    this.createSnake();
    this.gameRunning = false;
    this.inputReady = true;
    this.inputQueue = new Queue();
    this.cycleCounter = 0;
  }

  createSnake() {
    let usableWidth = convertWithSegments(canvas.width);
    let usableHeight = convertWithSegments(canvas.height);
    let startingPoint = {
      x: Math.floor(usableWidth / SEGMENT_SIZE / 2) * SEGMENT_SIZE,
      y: Math.floor(usableHeight / SEGMENT_SIZE / 2) * SEGMENT_SIZE,
    };
    this.gameSnake = new Snake(
      toColorString(SNAKE_COLOR),
      startingPoint,
      SNAKE_LENGTH
    );
  }
}
