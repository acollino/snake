//found at obj.agents array, arrayitem.full_name
const IMAGE_SOURCES = [
  // "iNaturalist",
  "Biopix Nature Photos",
  "Animal Diversity Web Traits and images",
  "CalPhotos",
];

// const FLICKR = "Flickr Group";

//found at obj.rightsHolder
const FLICKR_SOURCES = [
  "Bernard DUPONT",
  "Patrick Randall",
  "Todd Pierson",
  "Reinaldo Aguilar",
  "Arthur Chapman",
];

// fetch the list of snake species from the animals API
async function getSnakeArray() {
  let resp = await fetch("/get/snakearray");
  try {
    return await resp.json();
  } catch (error) {
    console.log(error);
    return null;
  }
}

// check which indicies of the list haven't yet been used
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

// if there is not yet a daily snake, or if the daily snake is outdated,
// get a not-yet-used snake from the snake array
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
  return getStoredSnake();
}

// check if the stored daily snake was not chosen today
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

// get the daily snake stored in localStorage
function getStoredSnake() {
  let dailySnake = localStorage.getItem("dailySnake");
  if (dailySnake) {
    return JSON.parse(dailySnake);
  }
  return null;
}

// Some list entries have "Various" for scientific name or none at all
function verifyScientificName() {
  let storedSnake = getStoredSnake();
  if (storedSnake) {
    let scientificName = storedSnake.snake.taxonomy.scientific_name;
    if (scientificName == null || !scientificName.includes(" ")) {
      // console.log("looked at:");
      // console.log(storedSnake.snake.name);
      // console.log(scientificName);
      // localStorage.removeItem("dailySnake");
      // getRandomSnake();
      throw new SnakeError("Scientific name is not a valid species.");
    }
  }
}

// Get the daily snake's scientific name, either from the scientific
// name itself, or constructed using the genus if the given name's format
// is 'C. viridis', for example
// function parseScientificName(storedSnake) {
function parseScientificName() {
  let storedSnake = getStoredSnake();
  let scientificName = storedSnake.snake.taxonomy.scientific_name;
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

// async function getEOLPageID(storedSnake) {
async function getEOLPageID() {
  let storedSnake = getStoredSnake();
  let scientificName = parseScientificName(storedSnake);
  let eolResp = await fetch(
    `https://eol.org/api/search/1.0.json?q=${scientificName}&page=1&exact=true`
  );
  let respData = await eolResp.json();
  let resultOptions = respData.results;
  if (respData.results.length > 1) {
    resultOptions = parseEOLSearchResults(respData.results, scientificName);
  }
  if (resultOptions.length === 0) {
    // console.log("looked at:");
    // console.log(storedSnake.snake.name);
    // console.log(parseScientificName(storedSnake));
    // localStorage.removeItem("dailySnake");
    // dailySnake = await getRandomSnake();
    // return getEOLPageID(dailySnake);
    throw new SnakeError("EOL search provided 0 results.");
  }
  return resultOptions[0].id;
}

function parseEOLSearchResults(resultsArray, searchTerm) {
  return resultsArray.filter((resultObj) => {
    if (resultObj.title.search(/^\w+ \w+$/) === -1) {
      return false;
    } else {
      let contentArray = resultObj.content.split("; ");
      let regex = new RegExp("^" + searchTerm + " \\W*[A-Z]+.*[0-9]+.*$");
      let validContent = contentArray.filter((contentStr) => {
        return contentStr.search(regex) !== -1;
      });
      return validContent.length > 0;
    }
  });
}

async function getSnakeImageURLs(pageID, pageNum) {
  let eolResp = await fetch(
    `https://eol.org/api/pages/1.0/${pageID}.json?details=false&images_per_page=50&taxonomy=false&images_page=${pageNum}`
  );
  let respData = await eolResp.json();
  if (respData.taxonConcept.dataObjects != null) {
    let imageArray = respData.taxonConcept.dataObjects.filter((mediaObj) => {
      let validSource = mediaObj.agents.some((supplier) => {
        return IMAGE_SOURCES.includes(supplier.full_name);
      });
      let validPhotographer = FLICKR_SOURCES.includes(mediaObj.rightsHolder);
      return validSource || validPhotographer;
    });
    if (imageArray.length === 0) {
      throw new SnakeImageError(
        `Snake page for EOL ID ${pageID}, page ${pageNum} had no valid images.`
      );
    }
    return imageArray;
  }
  throw new SnakeError(
    `Snake page on EOL ID ${pageID}, page ${pageNum} had no images at all.`
  );
}

async function getDailySnakeImage(pageCount) {
  // let dailySnake = await getRandomSnake();
  // let pageID = await getEOLPageID(dailySnake);
  // let images = await getSnakeImageURLs(pageID);
  // try {
  await getRandomSnake();
  let pageID = await getEOLPageID();
  let images = await getSnakeImageURLs(pageID, pageCount);
  dailySnake = getStoredSnake();
  let title = `${dailySnake.snake.name}, ${parseScientificName(dailySnake)}`;
  let url = images[Math.floor(Math.random() * images.length)].eolMediaURL;
  createSnakeDOM(title, url);
  // } catch (error) {
  //   console.error(error.message);
  //   if (error instanceof SnakeImageError) {

  //   } else if (error instanceof SnakeError) {
  //     console.log(getStoredSnake());
  //     localStorage.removeItem("dailySnake");
  //   }
  // }
}

async function dailySnakeLoop(loopCount = 1, pageCount = 1) {
  try {
    await getDailySnakeImage(pageCount);
  } catch (error) {
    console.error(error.message);
    if (loopCount < 50) {
      loopCount++;
      if (error instanceof SnakeImageError) {
        pageCount++;
        dailySnakeLoop(loopCount, pageCount);
      } else if (error instanceof SnakeError) {
        console.log("This snake is not a valid option:");
        console.log(getStoredSnake());
        localStorage.removeItem("dailySnake");
        dailySnakeLoop(loopCount, 1);
      }
    }
  }
}

function createSnakeDOM(title, url) {
  snakeContainer = document.createElement("div");
  snakeImage = document.createElement("img");
  snakeImage.setAttribute("src", url);
  snakeTitle = document.createElement("h1");
  snakeTitle.textContent = title;
  snakeContainer.append(snakeTitle);
  snakeContainer.append(snakeImage);
  document.body.append(snakeContainer);
}

window.addEventListener("load", () => {
  //getRandomSnake();
});

class SnakeError extends Error {
  constructor(message) {
    super(message);
    this.name = "SnakeError";
  }
}

class SnakeImageError extends Error {
  constructor(message) {
    super(message);
    this.name = "SnakeImageError";
  }
}
