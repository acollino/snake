import {
  canvas,
  SEGMENT_SIZE,
  INITIAL_DIR,
  FOOD_COLOR,
  FOOD_LOCATION,
} from "./constants.js";

import { SnakeSegment } from "./snakesegment.js";
import { SnakeFood } from "./snakefood.js";
import {
  findNearestFactor,
  clearBetween,
  clearSegment,
  getColorInfoAtCoord,
  matchesColor,
} from "./helper_functions.js";

export class Snake {
  constructor(color, startingPoint, startingLength) {
    this.segmentColor = color;
    // speed is movement per frame, or px per redraw delay
    // this is done by a consistent factor of segment size,
    // ensuring the snake stays aligned to the grid
    this.speed = SEGMENT_SIZE / findNearestFactor();
    this.segments = [new SnakeSegment(color, startingPoint, INITIAL_DIR)];
    for (let x = 0; x < startingLength - 1; x++) {
      this.addSegment();
    }
    this.turnMap = new Map();
  }

  getHead() {
    return this.segments[0];
  }

  getTail() {
    return this.segments[this.segments.length - 1];
  }

  isDirectionValid(newDirection) {
    if (this.getDirection() === "up") {
      return newDirection !== "down";
    }
    if (this.getDirection() === "down") {
      return newDirection !== "up";
    }
    if (this.getDirection() === "left") {
      return newDirection !== "right";
    }
    if (this.getDirection() === "right") {
      return newDirection !== "left";
    }
  }

  update() {
    if (this.eatFood) {
      this.addSegment();
      this.eatFood = false;
      let toClear = FOOD_LOCATION.pop();
      clearSegment(toClear);
      SnakeFood.spawnFood();
    }
    let oldDirection = this.getTail().direction;
    let oldTailPoint = this.getEndingClearPoint(oldDirection);
    for (let i = 0; i < this.segments.length; i++) {
      let currentSegment = this.segments[i];
      currentSegment.update(this.speed);
      if (currentSegment.turning) {
        currentSegment.turning = false;
        if (i < this.segments.length) {
          this.turnMap.set(i + 1, currentSegment.direction);
        }
      }
      if (this.turnMap.has(i)) {
        // Ensures a segment is in line with its predecessor before moving
        let matchX = currentSegment.x == this.segments[i - 1].x;
        let matchY = currentSegment.y == this.segments[i - 1].y;
        if (matchX || matchY) {
          currentSegment.turning = true;
          currentSegment.direction = this.turnMap.get(i);
          this.turnMap.delete(i);
        }
      }
    }
    let newTailPoint = this.getEndingClearPoint(oldDirection);
    clearBetween(oldTailPoint, newTailPoint);
  }

  determinePointToClear(newPosition, oldDirection) {
    let pointToClear = { x: newPosition.x, y: newPosition.y };
    switch (oldDirection) {
      case "right":
        pointToClear.x -= SEGMENT_SIZE;
        break;
      case "left":
        pointToClear.x += SEGMENT_SIZE;
        break;
      case "up":
        pointToClear.y += SEGMENT_SIZE;
        break;
      case "down":
        pointToClear.y -= SEGMENT_SIZE;
        break;
    }
    return pointToClear;
  }

  checkCollision() {
    let snakeHead = this.getHead();
    let collisionLeft = snakeHead.x <= 0 && snakeHead.direction === "left";
    let collisionRight =
      snakeHead.x + SEGMENT_SIZE >= canvas.width &&
      snakeHead.direction === "right";
    let collisionUp = snakeHead.y <= 0 && snakeHead.direction === "up";
    let collisionDown =
      snakeHead.y + SEGMENT_SIZE >= canvas.height &&
      snakeHead.direction === "down";
    let boundaryCollision =
      collisionLeft || collisionRight || collisionUp || collisionDown;
    let nextMove = snakeHead.calculateMove(this.speed);
    if (snakeHead.direction === "down" || snakeHead.direction === "right") {
      nextMove = snakeHead.calculateMove(SEGMENT_SIZE);
    }
    let pixelsAhead = getColorInfoAtCoord(nextMove);
    if (matchesColor(pixelsAhead, FOOD_COLOR)) {
      this.eatFood = true;
      return false;
    }
    let pixelCollision = !matchesColor(pixelsAhead, [0, 0, 0, 0]);
    return boundaryCollision || pixelCollision;
  }

  getDirection() {
    return this.getHead().direction;
  }

  setDirection(direction) {
    this.getHead().direction = direction;
    this.getHead().turning = true;
  }

  // Gets the origin of the segment-sized square immediately
  // behind the tail segment.
  getPositionBehindTail() {
    let lastSegment = this.getTail();
    let { x, y } = lastSegment;
    switch (lastSegment.direction) {
      case "left":
        x += SEGMENT_SIZE;
        break;
      case "right":
        x -= SEGMENT_SIZE;
        break;
      case "up":
        y += SEGMENT_SIZE;
        break;
      case "down":
        y -= SEGMENT_SIZE;
        break;
    }
    return { x, y };
  }

  // Effectively, get the important point for the last segment of the tail.
  // This will determine the zone that should be cleared after moving.
  // If going down or right, that's just the origin of the last segment (UL corner)
  // If left, that's the UR corner (so x + segment size)
  // If up, that's the BL corner (so y + segment size)
  getEndingClearPoint(direction) {
    let lastSegment = this.getTail();
    let { x, y } = lastSegment;
    switch (direction) {
      case "left":
        x += SEGMENT_SIZE;
        break;
      case "up":
        y += SEGMENT_SIZE;
        break;
    }
    return { x, y };
  }

  addSegment() {
    this.segments.push(
      new SnakeSegment(
        this.segmentColor,
        this.getPositionBehindTail(),
        this.getTail().direction
      )
    );
  }
}
