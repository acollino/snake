const stats = document.querySelector("#stats");

async function getUserStats() {
  let resp = await fetch("/stats", { method: "POST" });
  let data = await resp.json();
  if (data.error) {
    stats.textContent = data.error;
  } else {
    updateStats(data);
    updateMatches(data);
  }
}

function createStatElements() {
  let counts = document.createElement("div");
  let total = document.createElement("div");
  total.id = "total";
  let wins = document.createElement("div");
  wins.id = "wins";
  let highScore = document.createElement("div");
  highScore.id = "high-score";
  counts.append(total, wins, highScore);
  stats.append(counts);
  let title = document.createElement("div");
  title.classList.add("mt-4", "mb-1", "underline", "font-bold");
  title.textContent = "Recent Games";
  stats.append(title);
  let matches = document.createElement("ul");
  matches.id = "matches";
  stats.append(matches);
}

function updateStats(dataObj) {
  let total = document.querySelector("#total");
  let wins = document.querySelector("#wins");
  let highScore = document.querySelector("#high-score");
  total.textContent = `Total Matches: ${dataObj.counts.total}`;
  wins.textContent = `Total Wins: ${dataObj.counts.win}`;
  highScore.textContent = `High Score: ${dataObj.counts.high_score}`;
}

function updateMatches(dataObj) {
  let matches = document.querySelector("#matches");
  matches.textContent = "";
  dataObj.matches.forEach((match) => {
    let matchListItem = document.createElement("li");
    let matchTime = document.createElement("div");
    let matchScore = document.createElement("div");
    let matchResult = document.createElement("div");
    matchTime.textContent = `${match.time}`;
    matchScore.textContent = `Score: ${match.score}`;
    if (dataObj.user_id == match.winner_id) {
      matchResult.textContent = `Result: Win`;
    } else {
      matchResult.textContent = `Result: Loss`;
    }
    matchListItem.append(matchTime, matchResult, matchScore);
    matches.append(matchListItem);
  });
}

document.querySelector("#game-container").addEventListener("gameover", () => {
  getUserStats();
});

window.addEventListener("load", () => {
  createStatElements();
  getUserStats();
});
