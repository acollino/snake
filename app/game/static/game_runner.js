import {
  canvas,
  startBtn,
  gameContainer,
  difficultyContainer,
  DIFFICULTIES,
  SEGMENT_DIVISION,
  TIMEOUTS,
} from "./constants.js";

import { SnakeFood } from "./snakefood.js";
import { GameWall } from "./gamewall.js";
import { Queue } from "./queue.js";
import { SnakeGame } from "./snakegame.js";
import { clearEntireBoard, countdown } from "./helper_functions.js";

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
  if (currentGame.difficulty === undefined) {
    currentGame.difficulty = 0;
  }
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
