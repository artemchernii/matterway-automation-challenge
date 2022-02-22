# JavaScript Challenge with Puppeteer and Typescript

## Environment
App starts in terminal and after user select genre of the book then puppeteer launches Chromium Chromium using the latest JavaScript and browser features.

## Prerequisite
This example requires the following dependencies software.
1. [Puppeteer](https://pptr.dev/) - Node. js library
2. [npm](https://www.npmjs.com/) package manager (included in Node.js)
3. [TypeScript](https://www.typescriptlang.org) compiler (will be installed via ```npm install``` command)
3. [inquirer](https://www.npmjs.com/package/inquirer) - command line interface for Node.js

## How to run this application

1. Unzip or download the example project folder into a directory of your choice 
2. Run ```$npm install``` in the command prompt to install all the dependencies required to run the sample in a subdirectory called *node_modules/*.
3. Run ```$tsc``` in the command prompt to compile typescript into javascript.
4. Run ```$node dist/index.js``` to start a script.
![Select preferred genre](https://i.ibb.co/wKXW9BV/pick-Genre.png "Select preferred genre")
5. App fetch random book for the selected genre from https://www.goodreads.com/choiceawards/best-books-2020
![Fetch selected genre book](https://i.ibb.co/QkHCsQF/pickBook.png "Fetch selected genre book")
6. Find selected book on Amazon and add it to card.
![Add selected book to the buying card on Amazon](https://i.ibb.co/GtdSFSq/checkout.png "Add selected book to the buying card on Amazon")
