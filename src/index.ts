// Imports
const inquirer = require('inquirer');
const puppeteer = require('puppeteer');
import { genres } from './genres';

// Convert genre into url
const genreToUrl = (genre: string) => {
  return genre.split(' ').length === 0
    ? genre.toLowerCase().trim()
    : genre
        .toLowerCase()
        .split(' ')
        .map((w) => (w !== '&' ? w : ''))
        .filter((el) => el !== '')
        .join('-');
};

// Select genre and start searching
const getBookByGenre = (): void => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'genre',
        message: 'Which genre do you prefer? 😁',
        choices: genres,
      },
    ])
    .then((answers: { genre: string }) => {
      const pickedGenre = answers.genre;
      if (pickedGenre) getBookWithPuppeteer(pickedGenre);
    });
};

// Bootstrap
const main = async () => {
  try {
    getBookByGenre();
  } catch (error) {
    console.log(error);
  }
};
// Random int between 2 numbers
const randomIntFromInterval = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

// Scraping and buying
const getBookWithPuppeteer = async (pickedGenre: string) => {
  // Set up puppeteer
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const URL = `https://www.goodreads.com/choiceawards/best-${genreToUrl(
    pickedGenre
  )}-books-2020`;
  console.log(URL);
  const amazonPage = 'https://www.amazon.com/';

  // Page viewport
  await page.setViewport({
    width: 1280,
    height: 800,
  });
  await page.goto(URL, { waitUntil: 'networkidle2' });
  // Get array of book
  const titles = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.pollAnswer__bookLink')).map(
      (title) => title.getElementsByTagName('img')[0].getAttribute('alt')
    )
  );

  // Getting random books from https://www.goodreads.com/choiceawards/best-books-2020
  const randomBookOfDesireGenre =
    titles[randomIntFromInterval(1, titles.length)];

  // Change page to amazon
  await page.goto(amazonPage, { waitUntil: 'networkidle2' });

  //Enter Search criteria
  const searchBox = await page.waitForXPath("//*[@id='twotabsearchtextbox']", {
    visible: true,
  });
  if (searchBox !== null && searchBox)
    await searchBox.type(randomBookOfDesireGenre);

  // Clicked on search button
  const searchHandler = await page.waitForXPath(
    "//*/input[@id='nav-search-submit-button']",
    { visible: true }
  );
  if (searchHandler !== null && searchHandler) await searchHandler.click();

  // Click on first search result
  const getBookFromList = await page.waitForXPath(
    '//*[@id="search"]/div[1]/div[1]/div/span[3]/div[2]/div[2]/div/div/div/div/div/div[1]/div/div[2]/div/span/a',
    { visible: true }
  );
  if (getBookFromList !== null && getBookFromList)
    await getBookFromList.click();

  // Pick paperback book to be able to add it to card
  await page.waitForXPath('//a/span[contains(text(), "Paperback")]');
  const paperBackLink = await page.$x(
    '//a/span[contains(text(), "Paperback")]'
  );
  if (paperBackLink.length > 0) {
    await paperBackLink[0].click();
  }

  // Add to cart
  const addToCart = await page.waitForXPath('//*[@id="add-to-cart-button"]', {
    visible: true,
  });
  if (addToCart !== null) await addToCart.click();

  // Checkout
  const checkoutHandler = await page.waitForXPath(
    '//*[@id="sc-buy-box-ptc-button"]/span/input',
    {
      visible: true,
    }
  );
  if (checkoutHandler !== null && checkoutHandler)
    await checkoutHandler.click();

  await page.waitForTimeout(10000);
  //   Closing browser
  await browser.close();
};

// Error handling
const logErrorAndExit = (err: Error) => {
  console.log(err);
  process.exit();
};

// Main function - bootstrap app
main().catch(logErrorAndExit);
