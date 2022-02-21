const inquirer = require('inquirer');
const puppeteer = require('puppeteer');

let pickedGenre: string = '';
const genres: string[] = [
  'Fiction',
  'Mystery & Thriller',
  'Historical Fiction',
  'Fantasy',
  'Horror',
  'Humor',
  'Romance',
];

const getGenre = (): void => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'genre',
        message: 'Which genre do you prefer?😁',
        choices: genres,
      },
    ])
    .then((answers: { genre: string }) => {
      pickedGenre = answers.genre;
      console.log('Picked genre', pickedGenre);
    });
};

const setUp = async (): Promise<void> => {
  try {
    getGenre();
  } catch (error) {
    console.log(error);
  }
};

// Bootstrap
const main = async (): Promise<void> => {
  await setUp();
};

main();
