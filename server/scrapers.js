const puppeteer = require("puppeteer");

/**
 * Scrapes data from multiple leagues.
 *
 * @param {Array} leagues - An array of league objects.
 * @return {Array} - An array of league statistics.
 */
async function scrapeData(leagues) {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  let leaguesStats = [];

  for (let i = 0; i < leagues.length; i++) {
    let teamStats = [];

    await page.goto(leagues[i].fixtures, { waitUntil: "load" });
    console.log("====  " + leagues[i].league + " Fixtures  ====");

    let fixtures = await page.$$eval(".event", (table) => {
      const fixturesMatches = [];

      table.map(function (e) {
        const list = e.querySelector(".sportName");

        for (let i = 0; i < list.children.length; i++) {
          if (list.children[i].innerText.includes("ROUND") && i >= 2) {
            return;
          }

          fixturesMatches.push(list.children[i].innerText);
        }
      });
      return fixturesMatches;
    });

    console.log(fixtures);

    await page.goto(leagues[i].url, { waitUntil: "load" });
    console.log("====  " + leagues[i].league + " Teams  ====");

    await page.waitForSelector(
      ".ui-table__body > .ui-table__row .tableCellParticipant__name",
    );
    let links = await page.$$eval(
      ".ui-table__body > .ui-table__row",
      (teamRows) => {
        const teamsLinks = [];

        teamRows.map((teamRow) => {
          const teamLink = teamRow.querySelector(
            ".tableCellParticipant__name",
          ).href;
          teamsLinks.push(`${teamLink}results/`);
        });
        return teamsLinks;
      },
    );

    for (let i = 0; i < links.length; i++) {
      await page.goto(links[i], { waitUntil: "load" });

      let event = await page.$$eval(".event", (table) => {
        const sortData = [];

        table.map(function (e) {
          const list = e.querySelector(".sportName");

          for (let i = 0; i < list.children.length; i++) {
            sortData.push(list.children[i].innerText);
          }
        });
        return sortData;
      });

      await page.waitForSelector(".heading .heading__name");
      let teamName = await page.$$eval(".heading__name", (name) => {
        return name.map(function (e) {
          return e.innerText;
        });
      });

      teamStats.push({ team: teamName[0], table: event });
      console.log(teamName[0]);
    }

    leaguesStats.push({
      leagueName: leagues[i].league,
      fixtures: fixtures,
      teams: teamStats,
    });
  }

  browser.close();

  return leaguesStats;
}

module.exports = {
  scrapeData,
};
