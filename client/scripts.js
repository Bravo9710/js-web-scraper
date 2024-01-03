let dataJSON = [];
const container = document.querySelector(".container");

/**
 * Submits a channel to the server. /Updates the results.
 *
 * @param {none} none - This function does not accept any parameters.
 * @return {none} This function does not return any value.
 */
function submitChannel() {
  fetch("http://localhost:3000/creators", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Creates a new HTML element of the specified type with the given attributes.
 *
 * @param {string} type - The type of the HTML element to create.
 * @param {object} attrs - The attributes to assign to the new element. (default: {})
 * @param {string} attrs.innerText - The inner text for the new element.
 * @param {string} attrs.attr - The attribute name to set on the new element.
 * @param {string} attrs.value - The value to assign to the attribute.
 * @return {HTMLElement} - The newly created HTML element.
 */
function newEl(type, attrs = {}) {
  const el = document.createElement(type);
  for (let attr in attrs) {
    const value = attrs[attr];
    if (attr == "innerText") el.innerText = value;
    else el.setAttribute(attr, value);
  }
  return el;
}

/**
 * Loads creators data from the server and performs some operations on it.
 *
 * @return {Promise<void>} This function does not return anything.
 */
async function loadCreators() {
  const res = await fetch("http://localhost:3000/creators");
  const creators = await res.json();

  container.innerHTML = "";

  calculation(creators, "all");

  dataJSON = creators;

  $(".js-split-btn").addClass("is-shown");

  sortEventListener();
}

/**
 * Executes the homeResults function.
 *
 * @param {type} container - the HTML container to display the home results in
 * @return {void}
 */
function homeResults() {
  container.innerHTML = "";

  calculation(dataJSON, "home");

  sortEventListener();
}

/**
 *  Executes the awayResults function.
 *
 * @param {type} container - the HTML container to display the away results in
 * @return {void}
 */
function awayResults() {
  container.innerHTML = "";

  calculation(dataJSON, "away");

  sortEventListener();
}

/**
 * Sorts the tournaments based on the given team.
 *
 * @param {Object} team - The team object containing the table property.
 * @return {Object} An object containing the sorted domesticLeague, euroTurnaments, and otherTurnaments arrays.
 */
function sortTournaments(team) {
  let domesticLeague = [];
  let domesticLeagueFlag = false;

  let euroTurnaments = [];
  let euroTurnamentsFlag = false;

  let otherTurnaments = [];
  let otherTurnamentsFlag = false;

  for (let i = 0; i < team.table.length; i++) {
    const pattern = /[^0-9]/g;

    if (
      team.table[i].includes("ENGLAND\nPremier League") ||
      team.table[i].includes("SPAIN\nLaLiga")
    ) {
      domesticLeagueFlag = true;
      euroTurnamentsFlag = false;
      otherTurnamentsFlag = false;
      continue;
    } else if (team.table[i].includes("EUROPE")) {
      domesticLeagueFlag = false;
      euroTurnamentsFlag = true;
      otherTurnamentsFlag = false;
      continue;
    } else if (team.table[i].slice(0, 1).match(pattern)) {
      domesticLeagueFlag = false;
      euroTurnamentsFlag = false;
      otherTurnamentsFlag = true;
      continue;
    }

    if (domesticLeagueFlag) {
      domesticLeague.push(team.table[i]);
    } else if (euroTurnamentsFlag) {
      euroTurnaments.push(team.table[i]);
    } else if (otherTurnamentsFlag) {
      otherTurnaments.push(team.table[i]);
    }
  }

  return { domesticLeague, euroTurnaments, otherTurnaments };
}

function calculation(leagues, typeOfMatch) {
  leagues.forEach((league) => {
    let teamPosition = 0;

    const leagueFixtures = league.fixtures.splice(2, league.fixtures.length);

    const leagueNameId =
      league.leagueName.charAt(0).toLowerCase() +
      league.leagueName.replace(" ", "").slice(1);

    $(".container").append(`
				<div class="table" id="${leagueNameId}">
					<h2>${league.leagueName}</h2>

					<h3>Upcoming matches</h3>

					<table>
						<colgroup>
							<col class="table__col-1" span="1">
							<col class="table__col-2" span="5">
							<col class="table__col-3" span="5">
						</colgroup>

						<tr>
							<th>Match</th>
							<th>Over 0.5</th>
							<th>Over 1.5</th>
							<th>Over 2.5</th>
							<th>Over 3.5</th>
							<th>Over 4.5</th>

							<th>Under 0.5</th>
							<th>Under 1.5</th>
							<th>Under 2.5</th>
							<th>Under 3.5</th>
							<th>Under 4.5</th>
						</tr>

						<tbody class="table-matches__body js-sort-table"></tbody>
					</table>

					<h3>Teams</h3>

					<table>
						<colgroup>
							<col class="table__col-1" span="2">
							<col class="table__col-2" span="5">
							<col class="table__col-3" span="5">
						</colgroup>

						<tr>
							<th>Team</th>
							<th>MP</th>
							<th>Over 0.5</th>
							<th>Over 1.5</th>
							<th>Over 2.5</th>
							<th>Over 3.5</th>
							<th>Over 4.5</th>

							<th>Under 0.5</th>
							<th>Under 1.5</th>
							<th>Under 2.5</th>
							<th>Under 3.5</th>
							<th>Under 4.5</th>
						</tr>

						<tbody class="table__body js-sort-table"></tbody>
					</table>
				</div><!-- /.table -->`);

    league.teams.forEach((team) => {
      const teamID = (
        team.team.charAt(0).toLowerCase() + team.team.replace(" ", "").slice(1)
      ).replace(".", "");
      const card = newEl("tr", { id: `${teamID}` });

      teamPosition++;

      let over0 = 0;
      let over1 = 0;
      let over2 = 0;
      let over3 = 0;
      let over4 = 0;
      let under0 = 0;
      let under1 = 0;
      let under2 = 0;
      let under3 = 0;
      let under4 = 0;

      const sortedTournaments = sortTournaments(team);
      const domesticLeague = sortedTournaments.domesticLeague;

      let matchArray = domesticLeague.map((match) => {
        return match.split(/\r\n|\n\r|\n|\r/);
      });

      if (typeOfMatch === "home") {
        matchArray = matchArray.filter((match) => {
          return match[1] == team.team;
        });
      } else if (typeOfMatch === "away") {
        matchArray = matchArray.filter((match) => {
          return match[2] == team.team;
        });
      }

      const rounds = document.getElementById("rounds").value;
      const numberOfMatches = rounds != "" ? rounds : matchArray.length;
      const teamMatches = newEl("td", { innerText: `(${numberOfMatches})` });
      const title = newEl("td", { innerText: `${teamPosition}. ${team.team}` });

      for (let i = 0; i < numberOfMatches; i++) {
        const goalsSum =
          parseInt(matchArray[i][3]) + parseInt(matchArray[i][4]);

        if (goalsSum == 0) {
          under0++;
          under1++;
          under2++;
          under3++;
          under4++;
        } else if (goalsSum == 1) {
          over0++;
          under1++;
          under2++;
          under3++;
          under4++;
        } else if (goalsSum == 2) {
          over0++;
          over1++;
          under2++;
          under3++;
          under4++;
        } else if (goalsSum == 3) {
          over0++;
          over1++;
          over2++;
          under3++;
          under4++;
        } else if (goalsSum == 4) {
          over0++;
          over1++;
          over2++;
          over3++;
          under4++;
        } else if (goalsSum > 4) {
          over0++;
          over1++;
          over2++;
          over3++;
          over4++;
        }
      }

      const percentSumOver0 = (over0 / numberOfMatches) * 100;
      const percentSumOver1 = (over1 / numberOfMatches) * 100;
      const percentSumOver2 = (over2 / numberOfMatches) * 100;
      const percentSumOver3 = (over3 / numberOfMatches) * 100;
      const percentSumOver4 = (over4 / numberOfMatches) * 100;

      const percentSumUnder0 = (under0 / numberOfMatches) * 100;
      const percentSumUnder1 = (under1 / numberOfMatches) * 100;
      const percentSumUnder2 = (under2 / numberOfMatches) * 100;
      const percentSumUnder3 = (under3 / numberOfMatches) * 100;
      const percentSumUnder4 = (under4 / numberOfMatches) * 100;

      const percentOver0 = newEl("td", {
        innerText: parseFloat(percentSumOver0).toFixed(1) + "%",
      });
      const percentOver1 = newEl("td", {
        innerText: parseFloat(percentSumOver1).toFixed(1) + "%",
      });
      const percentOver2 = newEl("td", {
        innerText: parseFloat(percentSumOver2).toFixed(1) + "%",
      });
      const percentOver3 = newEl("td", {
        innerText: parseFloat(percentSumOver3).toFixed(1) + "%",
      });
      const percentOver4 = newEl("td", {
        innerText: parseFloat(percentSumOver4).toFixed(1) + "%",
      });

      const percentUnder0 = newEl("td", {
        innerText: parseFloat(percentSumUnder0).toFixed(1) + "%",
      });
      const percentUnder1 = newEl("td", {
        innerText: parseFloat(percentSumUnder1).toFixed(1) + "%",
      });
      const percentUnder2 = newEl("td", {
        innerText: parseFloat(percentSumUnder2).toFixed(1) + "%",
      });
      const percentUnder3 = newEl("td", {
        innerText: parseFloat(percentSumUnder3).toFixed(1) + "%",
      });
      const percentUnder4 = newEl("td", {
        innerText: parseFloat(percentSumUnder4).toFixed(1) + "%",
      });

      card.appendChild(title);
      card.appendChild(teamMatches);

      card.appendChild(percentOver0);
      card.appendChild(percentOver1);
      card.appendChild(percentOver2);
      card.appendChild(percentOver3);
      card.appendChild(percentOver4);

      card.appendChild(percentUnder0);
      card.appendChild(percentUnder1);
      card.appendChild(percentUnder2);
      card.appendChild(percentUnder3);
      card.appendChild(percentUnder4);

      $(`#${leagueNameId}`).find(".table__body").append(card);
    });

    const leagueFixturesArray = leagueFixtures.map((fixture) => {
      return fixture.split(/\r\n|\n\r|\n|\r/);
    });

    leagueFixturesArray.forEach((fixture) => {
      const team1ID = (
        fixture[1].charAt(0).toLowerCase() +
        fixture[1].replace(" ", "").slice(1)
      ).replace(".", "");
      const team2ID = (
        fixture[2].charAt(0).toLowerCase() +
        fixture[2].replace(" ", "").slice(1)
      ).replace(".", "");

      const team1Data = $(`#${team1ID}`).children();
      const team2Data = $(`#${team2ID}`).children();

      if (fixture[1] == "Postp") {
        return;
      }

      const cardMatches = newEl("tr");
      const title = newEl("td", { innerText: `${fixture[1]} - ${fixture[2]}` });

      const percentSumOver0 =
        (parseFloat(team1Data[2].innerText.replace("%", "")) +
          parseFloat(team2Data[2].innerText.replace("%", ""))) /
        2;
      const percentSumOver1 =
        (parseFloat(team1Data[3].innerText.replace("%", "")) +
          parseFloat(team2Data[3].innerText.replace("%", ""))) /
        2;
      const percentSumOver2 =
        (parseFloat(team1Data[4].innerText.replace("%", "")) +
          parseFloat(team2Data[4].innerText.replace("%", ""))) /
        2;
      const percentSumOver3 =
        (parseFloat(team1Data[5].innerText.replace("%", "")) +
          parseFloat(team2Data[5].innerText.replace("%", ""))) /
        2;
      const percentSumOver4 =
        (parseFloat(team1Data[6].innerText.replace("%", "")) +
          parseFloat(team2Data[6].innerText.replace("%", ""))) /
        2;

      const percentSumUnder0 =
        (parseFloat(team1Data[7].innerText.replace("%", "")) +
          parseFloat(team2Data[7].innerText.replace("%", ""))) /
        2;
      const percentSumUnder1 =
        (parseFloat(team1Data[8].innerText.replace("%", "")) +
          parseFloat(team2Data[8].innerText.replace("%", ""))) /
        2;
      const percentSumUnder2 =
        (parseFloat(team1Data[9].innerText.replace("%", "")) +
          parseFloat(team2Data[9].innerText.replace("%", ""))) /
        2;
      const percentSumUnder3 =
        (parseFloat(team1Data[10].innerText.replace("%", "")) +
          parseFloat(team2Data[10].innerText.replace("%", ""))) /
        2;
      const percentSumUnder4 =
        (parseFloat(team1Data[11].innerText.replace("%", "")) +
          parseFloat(team2Data[11].innerText.replace("%", ""))) /
        2;

      const percentOver0 = newEl("td", {
        innerText: parseFloat(percentSumOver0).toFixed(1) + "%",
      });
      const percentOver1 = newEl("td", {
        innerText: parseFloat(percentSumOver1).toFixed(1) + "%",
      });
      const percentOver2 = newEl("td", {
        innerText: parseFloat(percentSumOver2).toFixed(1) + "%",
      });
      const percentOver3 = newEl("td", {
        innerText: parseFloat(percentSumOver3).toFixed(1) + "%",
      });
      const percentOver4 = newEl("td", {
        innerText: parseFloat(percentSumOver4).toFixed(1) + "%",
      });

      const percentUnder0 = newEl("td", {
        innerText: parseFloat(percentSumUnder0).toFixed(1) + "%",
      });
      const percentUnder1 = newEl("td", {
        innerText: parseFloat(percentSumUnder1).toFixed(1) + "%",
      });
      const percentUnder2 = newEl("td", {
        innerText: parseFloat(percentSumUnder2).toFixed(1) + "%",
      });
      const percentUnder3 = newEl("td", {
        innerText: parseFloat(percentSumUnder3).toFixed(1) + "%",
      });
      const percentUnder4 = newEl("td", {
        innerText: parseFloat(percentSumUnder4).toFixed(1) + "%",
      });

      cardMatches.append(title);

      cardMatches.append(percentOver0);
      cardMatches.append(percentOver1);
      cardMatches.append(percentOver2);
      cardMatches.append(percentOver3);
      cardMatches.append(percentOver4);

      cardMatches.append(percentUnder0);
      cardMatches.append(percentUnder1);
      cardMatches.append(percentUnder2);
      cardMatches.append(percentUnder3);
      cardMatches.append(percentUnder4);

      $(`#${leagueNameId}`).find(".table-matches__body").append(cardMatches);
    });
  });
}

/**
 * Sorts the table rows based on the clicked table header.
 *
 * @param {Event} event - The event object representing the click event.
 * @return {void} This function does not return anything.
 */
function sortEventListener() {
  $("th").on("click", function () {
    var table = $(this).closest("table");
    var rows = table
      .find("tr:gt(0)")
      .toArray()
      .sort(comparer($(this).index()));
    this.asc = !this.asc;
    if (!this.asc) {
      rows = rows.reverse();
    }
    rows.forEach(function (row) {
      table.find(".js-sort-table").append(row);
    });
  });
}

/**
 * Generates a comparer function based on the given index.
 *
 * @param {number} index - The index to compare the values of.
 * @return {function} - A function that compares two values based on the given index.
 */
function comparer(index) {
  return function (a, b) {
    var valA = getCellValue(a, index);
    var valB = getCellValue(b, index);

    if (index > 0) {
      return parseFloat(valA) - parseFloat(valB);
    } else {
      const stringA = valA.split(" ");
      const stringB = valB.split(" ");

      stringA.shift();
      stringB.shift();

      stringA.join(" ");
      stringB.join(" ");

      return stringA.toString().localeCompare(stringB);
    }
  };
}

/**
 * Retrieves the value of a cell in a table row.
 *
 * @param {object} row - The table row element.
 * @param {number} index - The index of the cell.
 * @return {string} The value of the cell.
 */
function getCellValue(row, index) {
  return $(row).children("td").eq(index).text();
}
