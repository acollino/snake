//found at obj.agents array, arrayitem.full_name
// const IMAGE_SOURCES = [
//   // "iNaturalist",
//   "Biopix Nature Photos",
//   "Animal Diversity Web Traits and images",
//   "CalPhotos",
// ];

// const FLICKR = "Flickr Group";

//found at obj.rightsHolder
// const FLICKR_SOURCES = [
//   "Bernard DUPONT",
//   "Patrick Randall",
//   "Todd Pierson",
//   "Reinaldo Aguilar",
//   "Arthur Chapman",
//   "Micheal Jewel",
// ];

// const INATURALIST_SOURCES = [
//   "Kevin Metcalf",
//   "Bridget Spencer",
//   "mkosiewski",
//   "Susan Elliott",
//   "Mary Keim",
//   "Marv Elliott",
//   "Suzanne Cadwell",
//   "Sarah Carline",
// ];

// fetch the list of snake species from the animals API if needed,
// otherwise return the list stored in localStorage
async function getSnakeArray() {
  let snakeArray = localStorage.getItem("snakeArray");
  if (snakeArray === null || JSON.parse(snakeArray).length === 0) {
    let resp = await fetch("/get/snakearray");
    let fullSnakeArray = await resp.json();
    let namesOnlyArray = listSnakeNames(fullSnakeArray);
    localStorage.setItem("snakeArray", JSON.stringify(namesOnlyArray));
    return namesOnlyArray;
  }
  return JSON.parse(snakeArray);
}

function listSnakeNames(snakeArray) {
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

function verifyScientificName(snakeObj) {
  let scientificName = snakeObj.taxonomy.scientific_name;
  return scientificName != null && scientificName.includes(" ");
}

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

async function updateDailySnake() {
  if (checkIfOutdated()) {
    let snakeArray = await getSnakeArray();
    let randomValue = Math.floor(Math.random() * snakeArray);
    let randomSnake = snakeArray.splice(randomValue, 1)[0];
    localStorage.setItem("snakeArray", JSON.stringify(snakeArray));
    let dailySnake = {
      snake: randomSnake,
      date: new Date().toDateString(),
    };
    localStorage.setItem("dailySnake", JSON.stringify(dailySnake));
  }
}

// check which indicies of the list haven't yet been used
// function getOpenIndices(maxLength) {
//   let openIndices = localStorage.getItem("openIndices");
//   if (openIndices) {
//     openIndices = JSON.parse(openIndices);
//   }
//   if (openIndices === null || openIndices.length === 0) {
//     openIndices = Array.from({ length: maxLength }, (_, index) => index + 1);
//   }
//   return openIndices;
// }

// if there is not yet a daily snake, or if the daily snake is outdated,
// get a not-yet-used snake from the snake array
// async function getRandomSnake() {
//   if (checkIfOutdated()) {
//     let snakeArray = await getSnakeArray();
//     if (snakeArray) {
//       let openIndices = getOpenIndices(snakeArray.length);
//       let randomValue = Math.floor(Math.random() * openIndices.length);
//       let snakeIndex = openIndices.splice(randomValue, 1)[0];
//       localStorage.setItem("openIndices", JSON.stringify(openIndices));
//       let dailySnake = {
//         snake: snakeArray[snakeIndex],
//         date: new Date().toDateString(),
//       };
//       localStorage.setItem("dailySnake", JSON.stringify(dailySnake));
//       verifyScientificName();
//     }
//   }
//   return getStoredSnake();
// }

// check if the stored daily snake was not chosen today
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

// get the daily snake stored in localStorage
function getStoredSnake() {
  let dailySnake = localStorage.getItem("dailySnake");
  if (dailySnake) {
    return JSON.parse(dailySnake);
  }
  return null;
}

// Some list entries have "Various" for scientific name or none at all
// function verifyScientificName() {
//   let storedSnake = getStoredSnake();
//   if (storedSnake) {
//     let scientificName = storedSnake.snake.taxonomy.scientific_name;
//     if (scientificName == null || !scientificName.includes(" ")) {
//       throw new SnakeError("Scientific name is not a valid species.");
//     }
//   }
// }

// Get the daily snake's scientific name, either from the scientific
// name itself, or constructed using the genus if the given name's format
// is 'C. viridis', for example
// function parseScientificName(storedSnake) {
// function parseScientificName() {
//   let storedSnake = getStoredSnake();
//   let scientificName = storedSnake.snake.taxonomy.scientific_name;
//   let spaceSeparator = scientificName.indexOf(" ");
//   let genus = scientificName.substring(0, spaceSeparator);
//   if (scientificName.includes(".")) {
//     genus = getStoredSnake().snake.taxonomy.genus;
//   }
//   let nameEnd = scientificName.indexOf(",");
//   if (nameEnd === -1) {
//     nameEnd = scientificName.indexOf(" and ");
//     if (nameEnd < 0) {
//       nameEnd = scientificName.length;
//     }
//   }
//   let species = scientificName.substring(spaceSeparator + 1, nameEnd);
//   return `${genus} ${species}`;
// }

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

// results are ordered by a relevancy score, so first item is the best match
function parseINatResults(resultArray) {
  let bestResult = resultArray[0].record;
  // let defaultImage = bestResult.default_photo;
  // if (confirmPhotoUsable(defaultImage)) {
  //   return defaultImage.url.replace("square.", "original.");
  // }
  // else {

  // }
  return bestResult.taxon_photos.filter((photoObj) => {
    return confirmPhotoUsable(photoObj);
  });
}

function confirmPhotoUsable(photoObj) {
  let validLicense = photoObj.photo.license_code != null;
  let shareable = !photoObj.photo.attribution
    .toLowerCase()
    .includes("all rights reserved");
  let staticImage = !photoObj.photo.url.includes("original.gif");
  return validLicense && shareable && staticImage;
}

// start from the first index of the photo list; if the default photo is
// available, it will be the first item in the taxon photos, and it is also
// unlikely to feature a dead snake - which will rarely occur with snakes that
// have relatively few photos (making a random photo selection more risky)
function getINatURL() {
  let dailySnake = getStoredSnake();
  let photos = dailySnake.urls;
  if (photos.length === 0) {
    throw new SnakeError("The stored snake is out of URLs to try.");
  } else {
    // let randomIndex = Math.floor(Math.random() * photos.length);
    // let targetPhoto = photos.splice(randomIndex, 1)[0].photo.original_url;
    let targetPhoto = photos.shift().photo.original_url;
    localStorage.setItem("dailySnake", JSON.stringify(dailySnake));
    return targetPhoto;
  }
}

// async function getEOLPageID(storedSnake) {
// async function getEOLPageID() {
//   let storedSnake = getStoredSnake();
//   let scientificName = parseScientificName(storedSnake);
//   let eolResp = await fetch(
//     `https://eol.org/api/search/1.0.json?q=${scientificName}&page=1&exact=true`
//   );
//   let respData = await eolResp.json();
//   let resultOptions = respData.results;
//   if (respData.results.length > 1) {
//     resultOptions = parseEOLSearchResults(respData.results, scientificName);
//   }
//   if (resultOptions.length === 0) {
//     throw new SnakeError(
//       `EOL search for ${scientificName} provided 0 usable results.`
//     );
//   }
//   return resultOptions[0].id;
// }

// function parseEOLSearchResults(resultsArray, searchTerm) {
//   return resultsArray.filter((resultObj) => {
//     if (resultObj.title.search(/^\w+ \w+$/) === -1) {
//       return false;
//     } else {
//       let contentArray = resultObj.content.split("; ");
//       let regex = new RegExp("^" + searchTerm + " \\W*[A-Z]+.*[0-9]+.*$");
//       let validContent = contentArray.filter((contentStr) => {
//         return contentStr.search(regex) !== -1;
//       });
//       return validContent.length > 0;
//     }
//   });
// }

// async function getSnakeImageURLs(pageID, pageNum) {
//   let eolResp = await fetch(
//     `https://eol.org/api/pages/1.0/${pageID}.json?details=false&images_per_page=75&taxonomy=false&images_page=${pageNum}`
//   );
//   let respData = await eolResp.json();
//   if (respData.taxonConcept.dataObjects != null) {
//     let imageArray = respData.taxonConcept.dataObjects.filter((mediaObj) => {
//       let validSource = mediaObj.agents.some((supplier) => {
//         return IMAGE_SOURCES.includes(supplier.full_name);
//       });
//       let validPhotographer =
//         FLICKR_SOURCES.includes(mediaObj.rightsHolder) ||
//         INATURALIST_SOURCES.includes(mediaObj.rightsHolder);
//       return validSource || validPhotographer;
//     });
//     if (imageArray.length === 0) {
//       throw new SnakeImageError(
//         `Snake page for EOL ID ${pageID}, page ${pageNum} had no valid images.`
//       );
//     }
//     return imageArray;
//   }
//   throw new SnakeError(
//     `Snake page on EOL ID ${pageID}, page ${pageNum} had no images at all.`
//   );
// }

// async function getDailySnakeImage(pageCount) {
//   await getRandomSnake();
//   let pageID = await getEOLPageID();
//   let images = await getSnakeImageURLs(pageID, pageCount);
//   dailySnake = getStoredSnake();
//   let title = `${dailySnake.snake.name}, ${parseScientificName(dailySnake)}`;
//   let url = images[Math.floor(Math.random() * images.length)].eolMediaURL;
//   createSnakeDOM(title, url);
// }

async function getDailySnakeImage() {
  await updateDailySnake();
  await getINaturalistURLs();
  let dailySnake = getStoredSnake().snake;
  let title = `${dailySnake.commonName}, ${dailySnake.scientificName}`;
  let url = getINatURL();
  createSnakeDOM(title, url);
}

async function dailySnakeLoop(loopCount = 1) {
  try {
    await getDailySnakeImage();
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

// class SnakeImageError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "SnakeImageError";
//   }
// }
