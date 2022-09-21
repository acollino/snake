async function getSnakeArray() {
  let resp = await fetch("/get/snakearray");
  try {
    return await resp.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}

function getOpenIndices(maxLength) {
  let openIndices = localStorage.getItem("openIndices");
  if (openIndices) {
    openIndices = JSON.parse(openIndices);
  }
  if (openIndices === null || openIndices.length === 0) {
    openIndices = Array.from({ length: maxLength }, (_, index) => index + 1);
  }
  return openIndices;
}

async function getRandomSnake() {
  if (checkIfOutdated()) {
    let snakeArray = await getSnakeArray();
    if (snakeArray) {
      let openIndices = getOpenIndices(snakeArray.length);
      let randomValue = Math.floor(Math.random() * openIndices.length);
      let snakeIndex = openIndices.splice(randomValue, 1)[0];
      localStorage.setItem("openIndices", JSON.stringify(openIndices));
      let dailySnake = {
        snake: snakeArray[snakeIndex],
        date: new Date().toDateString(),
      };
      localStorage.setItem("dailySnake", JSON.stringify(dailySnake));
      verifyScientificName();
    }
  }
}

function checkIfOutdated() {
  let dailySnake = localStorage.getItem("dailySnake");
  let todayStr = new Date().toDateString();
  if (!dailySnake) {
    return true;
  } else {
    dailySnake = JSON.parse(dailySnake);
    return dailySnake.date != todayStr;
  }
}

function getStoredSnake() {
  let dailySnake = localStorage.getItem("dailySnake");
  if (dailySnake) {
    return JSON.parse(dailySnake);
  }
  return null;
}

// Some list entries have "Various" for scientific name or none at all
function verifyScientificName() {
  let scientificName = getStoredSnake().snake.taxonomy.scientific_name;
  if (scientificName == null || !scientificName.includes(" ")) {
    localStorage.removeItem("dailySnake");
    getRandomSnake();
  }
}

function parseScientificName() {
  let scientificName = getStoredSnake().snake.taxonomy.scientific_name;
  let spaceSeparator = scientificName.indexOf(" ");
  let genus = scientificName.substring(0, spaceSeparator);
  if (scientificName.includes(".")) {
    genus = getStoredSnake().snake.taxonomy.genus;
  }
  let nameEnd = scientificName.indexOf(",");
  if (nameEnd === -1) {
    nameEnd = scientificName.indexOf("and");
    if (nameEnd === -1) {
      nameEnd = scientificName.length;
    }
  }
  let species = scientificName.substring(spaceSeparator + 1, nameEnd);
  return `${genus} ${species}`;
}

async function getSnakeDetails() {}

window.addEventListener("load", () => {
  getRandomSnake();
});
