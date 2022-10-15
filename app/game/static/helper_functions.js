import {
  canvas,
  canvasContext,
  SEGMENT_SIZE,
  SEGMENT_DIVISION,
  TIMEOUTS,
} from "./constants.js";

// To function correctly, the snake must move per frame by a factor of the segment size.
// This leads to (eventually) moving in segment-by-segment squares, allowing
// the snake to line up against the spawned food.
export function findNearestFactor() {
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
export function convertWithSegments(dimension) {
  let usableRange = dimension - SEGMENT_SIZE;
  return Math.round(usableRange / SEGMENT_SIZE) * SEGMENT_SIZE;
}

// Returns a random point that is aligned to a segment size based grid.
export function getRandomPoint() {
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
export function getColorInfoAtCoord(point) {
  let pixelData = [...canvasContext.getImageData(point.x, point.y, 1, 1).data];
  pixelData[3] /= 255;
  return pixelData;
}

// Convert between arrays of rgba values and the required Strings for canvas
export function toColorString(colorArray) {
  return `rgba(${colorArray.join(", ")})`;
}

export function matchesColor(selectedColorArray, comparedColorArray) {
  return selectedColorArray.every((colorValue, index) => {
    return colorValue === comparedColorArray[index];
  });
}

export function clearEntireBoard() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

export function clearSegment(originPoint) {
  canvasContext.clearRect(
    originPoint.x,
    originPoint.y,
    SEGMENT_SIZE,
    SEGMENT_SIZE
  );
}

// clear between 2 points along their x or y axis
export function clearBetween(oldPoint, newPoint) {
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
export function countdown() {
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
