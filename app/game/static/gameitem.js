import { canvasContext, SEGMENT_SIZE } from "./constants.js";

export class GameItem {
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
