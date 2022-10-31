"use strict";

console.log("hello");

import puppeteer from "puppeteer";

// Step 1)
// initialize puppeteer
async function scrapeLinkedinCompany() {
  // Step 2) open login page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const navigationOptions = {
    waitUntil: "load",
    timeout: 0,
  };
  const optionsTyping = {
    delay: 50,
  };
  // Wait for necessary details
  await page.goto("https://www.linkedin.com/uas/login", navigationOptions);
  await page.waitForSelector("#username");
  await page.waitForSelector("#password");

  // Slowly type in the details
  await page.type("#username", "hamzasalman936sg@gmail.com", optionsTyping);
  await page.type("#password", "wscsk666", optionsTyping);
  await page.click(".login__form_action_container");
  await page.waitForNavigation(navigationOptions);

  // Head to company Page
  await page.goto(
    "https://www.linkedin.com/company/mihoyo/?trk=public_profile_experience-item_profile-section-card_image-click&originalSubdomain=ca",
    navigationOptions
  );
  console.log("page Loaded");

  // Open show more
  await page?.click("#line-clamp-show-more-button");
  // retrive data
  const data = await page.evaluate(() => {
    const scrapePage = function (document) {
      // Utility functions
      const clean = (txt) => txt.replace("\n", "").trim();
      const getText = (id, on = true) => {
        try {
          if (on) return clean(document.querySelector(id).textContent);
          return document.querySelector(id).textContent.trim();
        } catch (e) {
          return "";
        }
      };
      const selectAttr = (id, attr, element = document) =>
        element.querySelector(id).getAttribute(attr);
      const selectItem = (id, element = document) => element.querySelector(id);
      const selectAllItems = (id, element = document) =>
        element.querySelectorAll(id);
      const filterNumbers = (text) => {
        let split = text.replace(",", "").split(" ");
        let num = "";
        split.forEach((word) => {
          console.log(word);
          const x = word.trim() * 1;
          console.log(x);
          if (x) {
            num += word;
          }
        });
        return num;
      };
      // Scrape Data
      const scrape = () => {
        // Get data
        const unavailable = "";

        // Get Sections
        const introSection = selectItem(".org-top-card__primary-content");
        const informationDetails = selectAllItems(
          ".org-top-card-summary-info-list__info-item",
          introSection
        );

        // Get Details
        const companyName = selectAttr("h1", "title", introSection);
        const url = selectAttr(
          "a.ember-view.org-top-card-primary-actions__action",
          "href"
        );
        const sector = informationDetails[0].textContent;
        const location = informationDetails[1].textContent;
        const employeeCount =
          filterNumbers(
            getText(".ember-view.org-top-card-secondary-content__see-all-link")
          ) || filterNumbers(getText(".display-flex.mt2.mb1"));
        const about = getText(".lt-line-clamp__raw-line") || unavailable;
        const logoUrl = selectAttr(
          ".org-top-card-primary-content__logo",
          "src"
        );

        // Compile Data
        const data = {
          Company: companyName || unavailable,
          Sector: clean(sector) || unavailable,
          Location: clean(location) || unavailable,
          EmployeeCount: employeeCount || unavailable,
          Url: url || unavailable,
          About: about,
          LogoSrc: logoUrl,
        };
        console.log(data);
        return data;
      };
      // Send data
      return scrape();
    };
    return scrapePage(document);
  });
  console.log(data);

  browser.close();
  return data;
}

scrapeLinkedinCompany();
