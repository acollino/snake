import { canvas, SEGMENT_SIZE } from "./constants.js";
import { GameItem } from "./gameitem.js";
import {
  getRandomPoint,
  matchesColor,
  getColorInfoAtCoord,
  toColorString,
} from "./helper_functions.js";

export class GameWall {
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
