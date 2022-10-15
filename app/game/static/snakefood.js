import { FOOD_COLOR, FOOD_LOCATION } from "./constants.js";

import { GameItem } from "./gameitem.js";
import {
  getRandomPoint,
  matchesColor,
  getColorInfoAtCoord,
  toColorString,
} from "./helper_functions.js";

export class SnakeFood extends GameItem {
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
