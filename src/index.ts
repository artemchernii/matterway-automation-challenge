// Imports
const inquirer = require('inquirer');
const puppeteer = require('puppeteer');

// vars
const years: string[] = ['2011', '2012', '2021'];

// Convert genre into url (now this functions never used)
const genreToUrl = (genre: string): string => {
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
        name: 'year',
        message: 'Pick a year',
        choices: years,
      },
    ])
    .then((answers: { year: string }) => {
      const year = answers;
      fetchCategories(year.year).then((res) => {
        const categories = res;
        pickCategory(categories);
      });
    });
};

// Pick category function where we scrap categories for specific year and add them as options
const pickCategory = (categories: { category: string; url: string }[]) => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'genre',
        message: 'Which genre do you prefer? 😁',
        choices: categories.map((cat) => cat.category),
      },
    ])
    .then((answer: { genre: string }) => {
      const category = categories.filter(
        (cat) => cat.category === answer.genre
      );
      getBookWithPuppeteer(category[0]);
    });
};

// fetch categories
const fetchCategories = async (year: string) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const URL = `https://www.goodreads.com/choiceawards/best-books-${year}`;
    await page.setViewport({
      width: 1280,
      height: 800,
    });
    await page.goto(URL, { waitUntil: 'networkidle2' });
    const categories = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.category > a')).map((cat) => {
        return {
          category: cat.childNodes[0].textContent,
          url: cat.getAttribute('href'),
        };
      })
    );
    return categories;
  } catch (error) {
    console.log(error);
  }
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
const getBookWithPuppeteer = async (category: {
  category: string;
  url: string;
}) => {
  try {
    // Set up puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const URL = `https://www.goodreads.com/choiceawards/${category.url}`;
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
    const searchBox = await page.waitForXPath(
      "//*[@id='twotabsearchtextbox']",
      {
        visible: true,
      }
    );
    if (searchBox !== null && searchBox && randomBookOfDesireGenre)
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
    if (paperBackLink.length > 0 && paperBackLink) {
      await paperBackLink[0].click();
    }

    // Add to cart
    const addToCart = await page.waitForXPath('//*[@id="add-to-cart-button"]', {
      visible: true,
    });
    if (addToCart !== null && addToCart) await addToCart.click();

    // Checkout
    const checkoutHandler = await page.waitForXPath(
      '//*[@id="sc-buy-box-ptc-button"]/span/input',
      {
        visible: true,
      }
    );
    if (checkoutHandler !== null && checkoutHandler)
      await checkoutHandler.click();
    //   Closing browser
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};

// Error handling
const logErrorAndExit = (err: Error): void => {
  console.log(err);
  process.exit();
};

// Main function - bootstrap app
main().catch(logErrorAndExit);
