import { GameItem } from "./gameitem.js";

export class SnakeSegment extends GameItem {
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
