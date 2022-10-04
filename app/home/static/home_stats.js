const stats = document.querySelector("#stats");

async function getUserStats() {
  let resp = await fetch("/stats", { method: "POST" });
  let data = await resp.json();
  if (data.error) {
    stats.textContent = data.error;
  } else {
    parseStats(data);
    matchTitle();
    parseMatches(data);
  }
}

function parseStats(dataObj) {
  let counts = document.createElement("div");
  let total = document.createElement("div");
  let wins = document.createElement("div");
  total.textContent = `Total Matches: ${dataObj.counts.total}`;
  wins.textContent = `Total Wins: ${dataObj.counts.win}`;
  counts.append(total, wins);
  stats.append(counts);
}

function matchTitle() {
  let title = document.createElement("div");
  title.classList.add("mt-4", "mb-1", "underline", "font-bold");
  title.textContent = "Recent Games";
  stats.append(title);
}

function parseMatches(dataObj) {
  let matches = document.createElement("ul");
  dataObj.matches.forEach((match) => {
    let matchDom = document.createElement("li");
    let matchTime = document.createElement("div");
    let matchResult = document.createElement("div");
    matchTime.textContent = `${match.time}`;
    if (dataObj.user_id == match.winner_id) {
      matchResult.textContent = `Result: Win`;
    } else {
      matchResult.textContent = `Result: Loss`;
    }
    matchDom.append(matchTime, matchResult);
    matches.append(matchDom);
  });
  stats.append(matches);
}

window.addEventListener("load", () => {
  getUserStats();
});
