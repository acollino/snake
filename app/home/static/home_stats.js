const stats = document.querySelector("#stats");

async function getUserStats() {
  let resp = await fetch("/stats", { method: "POST" });
  let data = await resp.json();
  if (data.error) {
    stats.textContent = data.error;
  } else {
    displayStats(data);
    displayMatches(data);
  }
}

function createStatElements() {
  let counts = document.createElement("div");
  let total = document.createElement("div");
  total.id = "total";
  let highScore = document.createElement("div");
  highScore.id = "high-score";
  counts.append(total, highScore);
  stats.append(counts);
  let title = document.createElement("div");
  title.classList.add("mt-4", "mb-1", "underline", "font-bold");
  title.textContent = "Recent Games";
  stats.append(title);
  let matches = document.createElement("ul");
  matches.id = "matches";
  stats.append(matches);
}

function displayStats(dataObj) {
  let total = document.querySelector("#total");
  let highScore = document.querySelector("#high-score");
  total.textContent = `Total Matches: ${dataObj.counts.total}`;
  highScore.textContent = `High Score: ${dataObj.counts.high_score}`;
}

function displayMatches(dataObj) {
  let matches = document.querySelector("#matches");
  matches.textContent = "";
  dataObj.matches.forEach((match) => {
    let matchListItem = document.createElement("li");
    matchListItem.classList.add("my-4", "text-sm");
    let matchStartTime = document.createElement("div");
    let matchType = document.createElement("div");
    let matchDuration = document.createElement("div");
    let matchScore = document.createElement("div");
    matchStartTime.textContent = new Date(match.time).toLocaleString();
    matchType = `Difficulty: ${match.difficulty}`;
    let durationSeconds =
      (new Date(match.time_end).getTime() - new Date(match.time).getTime()) /
      1000;
    matchDuration.textContent = toDurationString(durationSeconds);
    matchScore.textContent = `Score: ${Number(match.score)}`;
    matchListItem.append(matchStartTime, matchType, matchDuration, matchScore);
    matches.append(matchListItem);
  });
}

function toDurationString(initialTime) {
  let hours = Math.floor(initialTime / 3600);
  let minutes = Math.floor((initialTime % 3600) / 60);
  let seconds = Math.floor((initialTime % 3600) % 60);
  let hourStr = hours > 0 ? hours + (hours === 1 ? " hour, " : " hours, ") : "";
  let minStr =
    minutes > 0 ? minutes + (minutes === 1 ? " minute, " : " minutes, ") : "";
  let secStr =
    seconds > 0
      ? seconds + (seconds === 1 ? " second" : " seconds")
      : "0 seconds";
  return "Duration: " + hourStr + minStr + secStr;
}

document.querySelector("#game-container").addEventListener("gameover", () => {
  getUserStats();
});

window.addEventListener("load", () => {
  createStatElements();
  getUserStats();
});
