const canvas = document.querySelector("#board");
const startBtn = document.querySelector("#start-btn");
const gameContainer = document.querySelector("#game-container");
const canvasContext = canvas.getContext("2d", { willReadFrequently: true });
const difficultyContainer = document.querySelector("#difficulty-container");
const DIFFICULTIES = [
  { redraw: 25, walls: 0, score: 1, mode: "Normal" },
  { redraw: 20, walls: 2, score: 2, mode: "Hard" },
  { redraw: 15, walls: 5, score: 3, mode: "Expert" },
];
const REDRAW_DELAY = 25;
const SEGMENT_SIZE = 20;
const SEGMENT_DIVISION = 4;
const SNAKE_LENGTH = 1;
const SNAKE_COLOR = [0, 200, 0, 1];
const INITIAL_DIR = "up";
const FOOD_COLOR = [0, 0, 255, 1];
const FOOD_LOCATION = [];
const TIMEOUTS = [];

// To function correctly, the snake must move per frame by a factor of the segment size.
// This leads to (eventually) moving in segment-by-segment squares, allowing
// the snake to line up against the spawned food.
function findNearestFactor() {
  for (let x = 0; x < SEGMENT_SIZE - SEGMENT_DIVISION; x++) {
    if (SEGMENT_SIZE % (SEGMENT_DIVISION + x) === 0) {
      return SEGMENT_DIVISION + x;
    }
    if (SEGMENT_SIZE % (SEGMENT_DIVISION - x) === 0) {
      return SEGMENT_DIVISION - x;
    }
  }
  return 1;
}

// Allows placement of a piece on the board in a grid of segment_size tiles
function convertWithSegments(dimension) {
  let usableRange = dimension - SEGMENT_SIZE;
  return Math.round(usableRange / SEGMENT_SIZE) * SEGMENT_SIZE;
}

// Returns a random point that is aligned to a segment size based grid.
function getRandomPoint() {
  let usableWidth = convertWithSegments(canvas.width);
  let usableHeight = convertWithSegments(canvas.height);
  let randomX = Math.floor((Math.random() * usableWidth) / SEGMENT_SIZE);
  let randomY = Math.floor((Math.random() * usableHeight) / SEGMENT_SIZE);
  return {
    x: randomX * SEGMENT_SIZE,
    y: randomY * SEGMENT_SIZE,
  };
}

// Gets the info for a 1x1 square at a given point, returning an array rather
// than the default Uint8ClampedArray which has alpha as 0-255 instead of 0-1.
// Return format is [R value, G value, B value, Alpha value]
function getColorInfoAtCoord(point) {
  let pixelData = [...canvasContext.getImageData(point.x, point.y, 1, 1).data];
  pixelData[3] /= 255;
  return pixelData;
}

// Convert between arrays of rgba values and the required Strings for canvas
function toColorString(colorArray) {
  return `rgba(${colorArray.join(", ")})`;
}

function matchesColor(selectedColorArray, comparedColorArray) {
  return selectedColorArray.every((colorValue, index) => {
    return colorValue === comparedColorArray[index];
  });
}

function clearEntireBoard() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

function clearSegment(originPoint) {
  canvasContext.clearRect(
    originPoint.x,
    originPoint.y,
    SEGMENT_SIZE,
    SEGMENT_SIZE
  );
}

// clear between 2 points along their x or y axis
function clearBetween(oldPoint, newPoint) {
  if (oldPoint.x === newPoint.x) {
    let startingY = oldPoint.y;
    if (newPoint.y < oldPoint.y) {
      startingY = newPoint.y;
    }
    canvasContext.clearRect(
      oldPoint.x,
      startingY,
      SEGMENT_SIZE,
      Math.abs(oldPoint.y - newPoint.y)
    );
  }
  if (oldPoint.y === newPoint.y) {
    let startingX = oldPoint.x;
    if (newPoint.x < oldPoint.x) {
      startingX = newPoint.x;
    }
    canvasContext.clearRect(
      startingX,
      oldPoint.y,
      Math.abs(oldPoint.x - newPoint.x),
      SEGMENT_SIZE
    );
  }
}

// Draw the inital countdown on the canvas
function countdown() {
  let point = { x: canvas.width / 2 - 16, y: canvas.height / 2 };
  canvasContext.fillStyle = "black";
  canvasContext.font = "64px sans-serif";
  clearEntireBoard();
  canvasContext.fillText("3", point.x, point.y);
  TIMEOUTS.push(setTimeout(clearEntireBoard, 1000));
  TIMEOUTS.push(
    setTimeout(() => canvasContext.fillText("2", point.x, point.y), 1000)
  );
  TIMEOUTS.push(setTimeout(clearEntireBoard, 2000));
  TIMEOUTS.push(
    setTimeout(() => canvasContext.fillText("1", point.x, point.y), 2000)
  );
  TIMEOUTS.push(setTimeout(clearEntireBoard, 3000));
}

class GameItem {
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

class Snake {
  constructor(color, startingPoint, startingLength) {
    this.segmentColor = color;
    // speed is movement per frame, or px per redraw delay
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

class SnakeSegment extends GameItem {
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

class SnakeFood extends GameItem {
  constructor(color, spawnPoint) {
    super(color, spawnPoint);
  }

  // Use of while loop could theoretically cause a delay in spawning if the
  // snake + walls occupy most of the available space - an optional solution
  // could switch to using array of open locations as the snake gets larger.
  static spawnFood() {
    let spawnPoint = getRandomPoint();
    let attemptTracker = 0;
    while (!matchesColor(getColorInfoAtCoord(spawnPoint), [0, 0, 0, 0])) {
      attemptTracker++;
      spawnPoint = getRandomPoint();
      if (attemptTracker == 200) {
        // Break in case food is taking too long to place and avoid an infinite loop
        stopGame();
        console.log("Took too long to place food.");
        break;
      }
    }
    FOOD_LOCATION.push(spawnPoint);
    new SnakeFood(toColorString(FOOD_COLOR), spawnPoint);
  }
}

class GameWall {
  constructor(spawnPoint, numConnectedWalls) {
    this.wallPoints = [];
    this.walls = [];
    this.spawnWallSegment(spawnPoint);
    for (let x = 1; x < numConnectedWalls; x++) {
      let wallOptions = this.getAdjacentOrigins();
      let randomIndex = Math.floor(Math.random() * wallOptions.length);
      this.spawnWallSegment(wallOptions[randomIndex]);
    }
  }

  // Gets the origin points of open segments next to the current wall
  getAdjacentOrigins() {
    let wallOriginOptions = [];
    for (let startPoint of this.wallPoints) {
      let points = [
        { x: startPoint.x - SEGMENT_SIZE, y: startPoint.y },
        { x: startPoint.x + SEGMENT_SIZE, y: startPoint.y },
        { x: startPoint.x, y: startPoint.y + SEGMENT_SIZE },
        { x: startPoint.x, y: startPoint.y - SEGMENT_SIZE },
      ];
      for (let point of points) {
        let inBoundsX = point.x >= 0 && point.x < canvas.width;
        let inBoundsY = point.y >= 0 && point.y < canvas.height;
        let emptySegment = matchesColor(
          getColorInfoAtCoord(point),
          [0, 0, 0, 0]
        );
        if (inBoundsX && inBoundsY && emptySegment) {
          wallOriginOptions.push(point);
        }
      }
    }
    return wallOriginOptions;
  }

  spawnWallSegment(originPoint) {
    this.wallPoints.push(originPoint);
    this.walls.push(new GameItem(toColorString([0, 0, 0, 1]), originPoint));
  }

  // Spawns a 'numWalls' amount of 3-6 segment walls randomly
  static spawnRandomWall(numWalls) {
    for (let count = 0; count < numWalls; count++) {
      let spawnPoint = getRandomPoint();
      let numSegments = Math.floor(Math.random() * 4) + 3;
      new GameWall(spawnPoint, numSegments);
    }
  }
}

let currentGame = new SnakeGame();
let elapsed = 0;
let priorTime = 0;
clearEntireBoard();

async function startRecording() {
  let startResp = await fetch("/start_match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      difficulty: DIFFICULTIES[currentGame.difficulty].mode,
    }),
  });
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
        score:
          (currentGame.gameSnake.segments.length - 1) *
          DIFFICULTIES[currentGame.difficulty].score,
      }),
    });
    let updateData = await updateResp.json();
    if (!updateData.recorded) {
      console.log("Stats could not be recorded.");
    }
    let stopEvent = new Event("gameover");
    gameContainer.dispatchEvent(stopEvent);
  }
}

function updateBoard() {
  if (currentGame.gameSnake.checkCollision()) {
    stopGame();
  } else {
    currentGame.gameSnake.update();
    currentGame.cycleCounter++;
    if (currentGame.cycleCounter === SEGMENT_DIVISION) {
      if (currentGame.inputQueue.length) {
        let newDir = currentGame.inputQueue.dequeue();
        if (currentGame.gameSnake.isDirectionValid(newDir)) {
          currentGame.gameSnake.setDirection(newDir);
        }
      }
      currentGame.cycleCounter = 0;
    }
  }
}

function startGameLoop() {
  resetGame();
  startRecording();
  currentGame.gameRunning = true;
  SnakeFood.spawnFood();
  let numWalls = DIFFICULTIES[currentGame.difficulty].walls;
  GameWall.spawnRandomWall(numWalls);
  canvas.focus();
  gameloop();
}

function stopGame() {
  updateMatchInfo();
  currentGame.gameRunning = false;
}

function resetGame() {
  clearEntireBoard();
  elapsed = 0;
  priorTime = 0;
  currentGame.createSnake();
  currentGame.cycleCounter = 0;
  currentGame.inputQueue = new Queue();
  if (currentGame.difficulty === undefined) {
    currentGame.difficulty = 0;
  }
}

function gameloop(timestamp) {
  if (currentGame.gameRunning) {
    let redrawDelay = DIFFICULTIES[currentGame.difficulty].redraw;
    elapsed = Math.min(timestamp - priorTime, redrawDelay);
    if (elapsed === redrawDelay) {
      priorTime = timestamp;
      updateBoard();
    }
    requestAnimationFrame(gameloop);
  }
}

startBtn.addEventListener("click", () => {
  while (TIMEOUTS.length > 0) {
    clearTimeout(TIMEOUTS.pop());
  }
  if (currentGame.gameRunning) {
    stopGame();
  }
  countdown();
  TIMEOUTS.push(setTimeout(startGameLoop, 3000));
});

canvas.addEventListener("keydown", (event) => {
  if (currentGame.gameRunning) {
    if (event.key == "ArrowLeft") {
      currentGame.inputQueue.enqueue("left");
    }
    if (event.key == "ArrowRight") {
      currentGame.inputQueue.enqueue("right");
    }
    if (event.key == "ArrowUp") {
      currentGame.inputQueue.enqueue("up");
    }
    if (event.key == "ArrowDown") {
      currentGame.inputQueue.enqueue("down");
    }
  }
});

difficultyContainer.addEventListener("click", (event) => {
  if (event.target instanceof HTMLButtonElement && !currentGame.gameRunning) {
    let difficulty = parseInt(event.target.getAttribute("data-diff-value"));
    let color = event.target.getAttribute("data-color");
    let targetID = event.target.id;
    if (difficulty >= 0 && difficulty < DIFFICULTIES.length) {
      currentGame.difficulty = difficulty;
      event.target.classList.remove("bg-neutral-100");
      event.target.classList.add(`bg-${color}-400`);
      event.target.classList.remove(`border-neutral-800`);
      event.target.classList.add(`border-${color}-900`);
    }
    for (let element of difficultyContainer.children) {
      if (element.id !== targetID) {
        let elementColor = element.getAttribute("data-color");
        element.classList.remove(`bg-${elementColor}-400`);
        element.classList.add(`bg-neutral-100`);
        element.classList.remove(`border-${elementColor}-900`);
        element.classList.add(`border-neutral-800`);
      }
    }
  }
});

// For multiplayer use, submitting moves to the server
async function submitMove(event) {
  if (currentGame.gameRunning) {
    let key = event.key.toLowerCase().replace("arrow", "");
    let fetchObj = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction: key }),
    };
    let resp = await fetch("/direction", fetchObj);
    let respData = await resp.json();
    if (respData.recorded) {
      currentGame.inputQueue.enqueue(respData.direction);
    }
  }
}
