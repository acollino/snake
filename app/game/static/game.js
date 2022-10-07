const canvas = document.querySelector("#board");
const startBtn = document.querySelector("#start-btn");
const gameContainer = document.querySelector("#game-container");
const canvasContext = canvas.getContext("2d");
const SEGMENT_SIZE = 20;
const SNAKE_LENGTH = 1;
const SNAKE_COLOR = [0, 200, 0, 1];
const INITIAL_DIR = "up";
const FOOD_COLOR = [0, 0, 255, 1];

// Allows placement of a piece on the board in a grid of segment_size tiles
function convertWithSegments(dimension) {
  let usableRange = dimension - SEGMENT_SIZE;
  return Math.round(usableRange / SEGMENT_SIZE) * SEGMENT_SIZE;
}

// Gets the info for a 1x1 square at a given point, returning an array rather
// than the default Uint8ClampedArray which has alpha as 0-255 instead of 0-1.
// Return format is [R value, G value, B value, Alpha value]
function getColorInfoAtCoord(point) {
  let pixelData = [...canvasContext.getImageData(point.x, point.y, 1, 1).data];
  pixelData[3] /= 255;
  return pixelData;
}

// Convert between arrays of rgba values and the required Strings for inputs
function toColorString(colorArray) {
  return `rgba(${colorArray.join(", ")})`;
}

function matchesColor(selectedColorArray, comparedColorArray) {
  return selectedColorArray.every((colorValue, index) => {
    return colorValue === comparedColorArray[index];
  });
}

function clearSegment(originPoint) {
  canvasContext.clearRect(
    originPoint.x,
    originPoint.y,
    SEGMENT_SIZE,
    SEGMENT_SIZE
  );
}

class gameItem {
  constructor(color, spawnPoint) {
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.color = color;
    this.drawSegment();
  }

  drawSegment() {
    canvasContext.fillStyle = this.color;
    canvasContext.fillRect(this.x, this.y, SEGMENT_SIZE, SEGMENT_SIZE);
  }
}

class SnakeGame {
  constructor() {
    this.createSnake();
    this.gameRunning = false;
    this.inputReady = true;
  }

  clearEntireBoard() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  }

  createSnake() {
    let startingPoint = {
      x: convertWithSegments(canvas.width) / 2,
      y: convertWithSegments(canvas.height) / 2,
    };
    this.gameSnake = new Snake(
      toColorString(SNAKE_COLOR),
      startingPoint,
      SNAKE_LENGTH
    );
  }
}

class Snake {
  constructor(color, startingPoint, startingLength) {
    this.segmentColor = color;
    this.speed = SEGMENT_SIZE;
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

  update() {
    if (this.eatFood) {
      this.addSegment();
      this.eatFood = false;
      SnakeFood.spawnFood();
    }
    let priorTailPosition = { x: this.getTail().x, y: this.getTail().y };
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
        // Meant for moving at fractions of segment size rather than by full size
        // let matchX = currentSegment.x == this.segments[i - 1].x;
        // let matchY = currentSegment.y == this.segments[i - 1].y;
        // if (matchX || matchY) {}
        currentSegment.turning = true;
        currentSegment.direction = this.turnMap.get(i);
        this.turnMap.delete(i);
      }
    }
    clearSegment(priorTailPosition);
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

class SnakeSegment extends gameItem {
  constructor(color, spawnPoint, direction) {
    super(color, spawnPoint);
    this.direction = direction;
    this.turning = false;
  }

  update(speed) {
    let updatedValues = this.calculateMove(speed);
    this.x = updatedValues.x;
    this.y = updatedValues.y;
    this.drawSegment();
  }

  calculateMove(speed) {
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
    let newX = this.x + speed * directionAdjustX;
    let newY = this.y + speed * directionAdjustY;
    return { x: newX, y: newY };
  }
}

class SnakeFood extends gameItem {
  constructor(color, spawnPoint) {
    super(color, spawnPoint);
  }

  // temporary use of while loop here with break in case it causes a hang,
  // plan to swap out/combine with using array of spawn locations - should
  // get better as the snake takes up more of the screen.
  static spawnFood() {
    let usableWidth = convertWithSegments(canvas.width);
    let usableHeight = convertWithSegments(canvas.height);
    let randomX = Math.floor((Math.random() * usableWidth) / SEGMENT_SIZE);
    let randomY = Math.floor((Math.random() * usableHeight) / SEGMENT_SIZE);
    let spawnPoint = {
      x: randomX * SEGMENT_SIZE,
      y: randomY * SEGMENT_SIZE,
    };
    let attemptTracker = 0;
    while (!matchesColor(getColorInfoAtCoord(spawnPoint), [0, 0, 0, 0])) {
      attemptTracker++;
      randomX = Math.floor((Math.random() * usableWidth) / SEGMENT_SIZE);
      randomY = Math.floor((Math.random() * usableHeight) / SEGMENT_SIZE);
      spawnPoint = {
        x: randomX * SEGMENT_SIZE,
        y: randomY * SEGMENT_SIZE,
      };
      if (attemptTracker == 100) {
        stopGame();
        console.log("Took too long to place food.");
        break;
      }
    }
    new SnakeFood(toColorString(FOOD_COLOR), spawnPoint);
  }
}

let currentGame = new SnakeGame();

async function startRecording() {
  let startResp = await fetch("/start_match", { method: "POST" });
  let startData = await startResp.json();
  if (startData.recorded) {
    currentGame.gameID = startData.match_id;
  }
}

async function updateMatchInfo() {
  if (currentGame.gameID) {
    let updateResp = await fetch(`/update_match/${currentGame.gameID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: currentGame.gameSnake.segments.length - 1,
      }),
    });
    let updateData = await updateResp.json();
    if (!updateData.recorded) {
      // notify user that stats aren't recorded, but don't stop game
    }
  }
}

function updateBoard() {
  if (currentGame.gameSnake.checkCollision()) {
    stopGame();
  } else {
    currentGame.gameSnake.update();
    currentGame.inputReady = true;
  }
}

function startGame() {
  if (currentGame.gameRunning) {
    stopGame();
  }
  resetGame();
  startRecording();
  currentGame.gameRunning = true;
  SnakeFood.spawnFood();
  currentGame.snakeInterval = setInterval(updateBoard, 60);
  canvas.focus();
}

function stopGame() {
  clearInterval(currentGame.snakeInterval);
  updateMatchInfo();
  currentGame.gameRunning = false;
  let stopEvent = new Event("gameover");
  gameContainer.dispatchEvent(stopEvent);
}

function resetGame() {
  currentGame.clearEntireBoard();
  currentGame.createSnake();
}

startBtn.addEventListener("click", startGame);

canvas.addEventListener("keydown", (event) => {
  if (currentGame.gameRunning && currentGame.inputReady) {
    let snakeDir = currentGame.gameSnake.getDirection();
    if (event.key == "ArrowLeft" && snakeDir != "right") {
      currentGame.gameSnake.setDirection("left");
      currentGame.inputReady = false;
    }
    if (event.key == "ArrowRight" && snakeDir != "left") {
      currentGame.gameSnake.setDirection("right");
      currentGame.inputReady = false;
    }
    if (event.key == "ArrowUp" && snakeDir != "down") {
      currentGame.gameSnake.setDirection("up");
      currentGame.inputReady = false;
    }
    if (event.key == "ArrowDown" && snakeDir != "up") {
      currentGame.gameSnake.setDirection("down");
      currentGame.inputReady = false;
    }
  }
});
