const CANVAS = document.querySelector("#board");
const START = document.querySelector("#start-btn");
const CONTEXT = CANVAS.getContext("2d");
const SNAKE_SIZE = 20;
const SNAKE_LENGTH = 10;
const SNAKE_COLOR = "green";
const STARTING_DIR = "up";

class SnakeGame {
  constructor() {
    this.createSnake();
    this.gameRunning = false;
  }

  clearBoard() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
  }

  createSnake() {
    let midpointX = CANVAS.width / 2 - SNAKE_SIZE / 2;
    let midpointY = CANVAS.height / 2 - SNAKE_SIZE / 2;
    this.gameSnake = new Snake(
      SNAKE_SIZE,
      SNAKE_COLOR,
      midpointX,
      midpointY,
      SNAKE_LENGTH
    );
  }
}

class Snake {
  constructor(size, color, x, y, length) {
    this.segmentSize = size;
    this.segmentColor = color;
    this.segments = [new SnakeSegment(size, color, x, y, STARTING_DIR)];
    for (let x = 0; x < length - 1; x++) {
      this.addSegment();
    }
    this.turnMap = new Map();
  }

  update() {
    for (let i = 0; i < this.segments.length; i++) {
      let currentSegment = this.segments[i];
      currentSegment.update();
      if (currentSegment.turning) {
        currentSegment.turning = false;
        if (i < this.segments.length) {
          this.turnMap.set(i + 1, currentSegment.direction);
        }
      }
      if (this.turnMap.has(i)) {
        // Meant for moving at fractions of segment size rather than by full size
        // let matchX = currentSegment.x == this.segments[i - 1].x;
        // let matchY = currentSegment.y == this.segments[i - 1].y;
        // if (matchX || matchY) {}
        currentSegment.turning = true;
        currentSegment.direction = this.turnMap.get(i);
        this.turnMap.delete(i);
      }
    }
  }

  checkCollision() {
    return this.segments[0].checkCollision();
  }

  getDirection() {
    return this.segments[0].direction;
  }

  setDirection(direction) {
    this.segments[0].direction = direction;
    this.segments[0].turning = true;
  }

  addSegment() {
    let lastSegment = this.segments[this.segments.length - 1];
    let { x, y } = lastSegment;
    switch (lastSegment.direction) {
      case "left":
        x += this.segmentSize;
        break;
      case "right":
        x -= this.segmentSize;
        break;
      case "up":
        y += this.segmentSize;
        break;
      case "down":
        y -= this.segmentSize;
        break;
    }
    this.segments.push(
      new SnakeSegment(
        this.segmentSize,
        this.segmentColor,
        x,
        y,
        lastSegment.direction
      )
    );
  }
}

class SnakeSegment {
  constructor(size, color, x, y, direction) {
    this.size = size;
    this.color = color;
    this.x = x;
    this.y = y;
    this.speed = Math.floor(size / 1);
    this.direction = direction;
    this.turning = false;
    this.drawSegment();
  }

  drawSegment() {
    CONTEXT.fillStyle = this.color;
    CONTEXT.fillRect(this.x, this.y, this.size, this.size);
  }

  update() {
    this.move();
    this.drawSegment();
  }

  move() {
    let updatedValues = this.calculateMove();
    this.x = updatedValues.newX;
    this.y = updatedValues.newY;
  }

  calculateMove() {
    let directionAdjustX = 0;
    let directionAdjustY = 0;
    if (this.direction == "right" || this.direction == "left") {
      if (this.direction == "right") {
        directionAdjustX = 1;
      } else {
        directionAdjustX = -1;
      }
    } else {
      if (this.direction == "down") {
        directionAdjustY = 1;
      } else {
        directionAdjustY = -1;
      }
    }
    let newX = this.x + this.speed * directionAdjustX;
    let newY = this.y + this.speed * directionAdjustY;
    return { newX, newY };
  }

  checkCollision() {
    let collisionX = this.x <= 0 || this.x + this.size >= CANVAS.width;
    let collisionY = this.y <= 0 || this.y + this.size >= CANVAS.height;
    let boundaryCollision = collisionX || collisionY;
    let nextMove = this.calculateMove();
    let pixelsAhead = CONTEXT.getImageData(
      nextMove.newX,
      nextMove.newY,
      this.size,
      this.size
    ).data.subarray(0, 4);
    let pixelCollision = pixelsAhead.some((color) => {
      return color != 0;
    });
    return boundaryCollision || pixelCollision;
  }
}

let currentGame = new SnakeGame();

function updateBoard() {
  currentGame.clearBoard();
  currentGame.gameSnake.update();
  if (currentGame.gameSnake.checkCollision()) {
    stopGame();
  }
}

function startGame() {
  if (currentGame.gameRunning) {
    stopGame();
  }
  resetGame();
  currentGame.gameRunning = true;
  currentGame.interval = setInterval(updateBoard, 60);
  CANVAS.focus();
}

function stopGame() {
  clearInterval(currentGame.interval);
  currentGame.gameRunning = false;
}

function resetGame() {
  currentGame.clearBoard();
  currentGame.createSnake();
}

START.addEventListener("click", startGame);

CANVAS.addEventListener("keydown", (event) => {
  if (currentGame.gameRunning) {
    let snakeDir = currentGame.gameSnake.getDirection();
    if (event.key == "ArrowLeft" && snakeDir != "right") {
      currentGame.gameSnake.setDirection("left");
    }
    if (event.key == "ArrowRight" && snakeDir != "left") {
      currentGame.gameSnake.setDirection("right");
    }
    if (event.key == "ArrowUp" && snakeDir != "down") {
      currentGame.gameSnake.setDirection("up");
    }
    if (event.key == "ArrowDown" && snakeDir != "up") {
      currentGame.gameSnake.setDirection("down");
    }
  }
});