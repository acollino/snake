import { CreativeCommonsGenerator } from "./creative_commons.js";

class SnakeError extends Error {
  constructor(message) {
    super(message);
    this.name = "SnakeError";
  }
}

// fetch the list of snake species from the animals API if needed,
// otherwise return the list stored in localStorage
async function getSnakeArray() {
  let snakeArray = localStorage.getItem("snakeArray");
  if (snakeArray === null || JSON.parse(snakeArray).length === 0) {
    let resp = await fetch("/get/snakearray");
    let fullSnakeArray = await resp.json();
    // console.log(fullSnakeArray);
    // throw new Error("Error obtaining array from API Ninjas");
    let namesOnlyArray = extractSnakeNames(fullSnakeArray);
    localStorage.setItem("snakeArray", JSON.stringify(namesOnlyArray));
    return namesOnlyArray;
  }
  return JSON.parse(snakeArray);
}

// Retrieve only the useful naming information from the snakes array
function extractSnakeNames(snakeArray) {
  let namesList = [];
  snakeArray.forEach((snakeObj) => {
    if (verifyScientificName(snakeObj)) {
      let nameObj = {
        commonName: snakeObj.name,
        scientificName: parseScientificName(snakeObj),
      };
      namesList.push(nameObj);
    }
  });
  return namesList;
}

// Check if the snake object has a valid entry for a scientific name
// ie. is in a form like 'Genus species', 'G. species'
function verifyScientificName(snakeObj) {
  let scientificName = snakeObj.taxonomy.scientific_name;
  return scientificName != null && scientificName.includes(" ");
}

// Get the snake object's scientific name, piecing it together from
// the taxonomy details if the given name is abbreviated ('G. species')
// or if multiple names are given
function parseScientificName(snakeObj) {
  let scientificName = snakeObj.taxonomy.scientific_name;
  let spaceSeparator = scientificName.indexOf(" ");
  let genus = scientificName.substring(0, spaceSeparator);
  if (scientificName.includes(".")) {
    genus = snakeObj.taxonomy.genus;
  }
  let nameEnd = scientificName.indexOf(",");
  if (nameEnd === -1) {
    nameEnd = scientificName.indexOf(" and ");
    if (nameEnd < 0) {
      nameEnd = scientificName.length;
    }
  }
  let species = scientificName.substring(spaceSeparator + 1, nameEnd);
  return `${genus} ${species}`;
}

// If the daily snake needs to change, randomly select one from the stored array
async function updateDailySnake() {
  if (checkIfOutdated()) {
    let snakeArray = await getSnakeArray();
    let randomValue = Math.floor(Math.random() * snakeArray.length);
    let randomSnake = snakeArray.splice(randomValue, 1)[0];
    localStorage.setItem("snakeArray", JSON.stringify(snakeArray));
    let dailySnake = {
      snake: randomSnake,
      date: new Date().toDateString(),
    };
    localStorage.setItem("dailySnake", JSON.stringify(dailySnake));
  }
}

// Check if the stored daily snake has been removed or was not chosen today
function checkIfOutdated() {
  let snakeObj = localStorage.getItem("dailySnake");
  let todayStr = new Date().toDateString();
  if (!snakeObj) {
    return true;
  } else {
    let dailySnake = JSON.parse(snakeObj);
    if (!dailySnake.snake) {
      return true;
    } else {
      return dailySnake.date != todayStr;
    }
  }
}

// Get the daily snake stored in localStorage
function getStoredSnake() {
  let dailySnake = localStorage.getItem("dailySnake");
  if (dailySnake) {
    return JSON.parse(dailySnake);
  }
  return null;
}

// Search the iNaturalist API according to the daily snake's name, then
// store the photo URLs. These are stored in case an image fails to load,
// allowing the page to attempt loading the next image without another
// request to the API.
async function getINaturalistURLs() {
  let storedSnake = getStoredSnake();
  let iNatResp = await fetch(
    `https://api.inaturalist.org/v1/search?q=${storedSnake.snake.scientificName}&sources=taxa`
  );
  let respData = await iNatResp.json();
  let resultOptions = respData.results;
  if (resultOptions.length > 0) {
    let photos = parseINatResults(resultOptions);
    if (photos.length > 0) {
      storedSnake.urls = photos;
      storedSnake.snake.scientificName = resultOptions[0].record.matched_term;
      localStorage.setItem("dailySnake", JSON.stringify(storedSnake));
    } else {
      throw new SnakeError(
        `iNaturalist search for ${storedSnake.snake.scientificName} had no usable images.`
      );
    }
  } else {
    throw new SnakeError(
      `iNaturalist search for ${storedSnake.snake.scientificName} provided 0 results.`
    );
  }
}

// iNaturalist results are ordered by a relevancy score, so first item is the best match;
// returns the usable photos from that search result.
function parseINatResults(resultArray) {
  let bestResult = resultArray[0].record;
  return bestResult.taxon_photos.filter((photoObj) => {
    return confirmPhotoUsable(photoObj);
  });
}

// Checks if the photo has a creative commons license, is available to share, and
// is not a gif
function confirmPhotoUsable(photoObj) {
  let validLicense = photoObj.photo.license_code != null;
  let shareable = !photoObj.photo.attribution
    .toLowerCase()
    .includes("all rights reserved");
  let staticImage = !photoObj.photo.url.includes("original.gif");
  return validLicense && shareable && staticImage;
}

// Select a url, starting from the first index of the photo list; if the default photo
// is available, it will be the first item in the taxon photos, and it is also
// unlikely to feature a dead snake - which will rarely occur with snakes that
// have relatively few photos (making a random photo selection more risky)
function selectINatURL() {
  let dailySnake = getStoredSnake();
  let dailyPhoto = dailySnake.dailyPhoto;
  if (!dailyPhoto) {
    let photos = dailySnake.urls;
    if (photos.length === 0) {
      throw new SnakeError("The stored snake is out of URLs to try.");
    } else {
      let targetPhoto = photos.shift();
      dailySnake.dailyPhoto = targetPhoto;
      localStorage.setItem("dailySnake", JSON.stringify(dailySnake));
      return targetPhoto.photo.original_url;
    }
  }
  return dailyPhoto.photo.original_url;
}

// Add the daily snake image and title to the page
function createSnakeDOM(url, name, scientific) {
  let dailyPhoto = getStoredSnake().dailyPhoto;
  let image = document.querySelector("#snake-image");
  let commonName = document.querySelector("#snake-name");
  let properName = document.querySelector("#snake-scientific");
  let photographer = document.querySelector("#photographer");
  let license = document.querySelector("#license");
  let source = document.querySelector("#source");
  let wiki = document.querySelector("#wiki");
  image.setAttribute("src", url);
  commonName.textContent = name;
  properName.textContent = scientific;
  let licenseObj = CreativeCommonsGenerator.parseAttribution(
    dailyPhoto.photo.attribution
  );
  photographer.textContent += licenseObj.creator;
  license.setAttribute("href", licenseObj.licenseLink);
  license.textContent += licenseObj.license;
  source.setAttribute(
    "href",
    `https://www.inaturalist.org/taxa/${dailyPhoto.taxon_id}`
  );
  wiki.setAttribute("href", `http://en.wikipedia.org/wiki/${scientific}`);
}

// Select or retrieve the daily snake and load its image.
async function loadDailySnakeImage() {
  await updateDailySnake();
  await getINaturalistURLs();
  let dailySnake = getStoredSnake().snake;
  let url = selectINatURL();
  createSnakeDOM(url, dailySnake.commonName, dailySnake.scientificName);
}

// A limited recursive loop to retry loading the daily image, allowing
// the page to load a different daily snake if something goes wrong.
async function dailySnakeLoop(loopCount = 1) {
  try {
    await loadDailySnakeImage();
  } catch (error) {
    console.error(error.message);
    if (loopCount < 10) {
      loopCount++;
      if (error instanceof SnakeError) {
        console.log(
          `Had an error retrieving images for ${
            getStoredSnake().snake
          }, will try next species.`
        );
        localStorage.removeItem("dailySnake");
        dailySnakeLoop(loopCount);
      }
    }
  }
}

window.addEventListener("load", () => {
  dailySnakeLoop();
});
