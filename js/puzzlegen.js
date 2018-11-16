const datamuse = require('datamuse');
const randomWord = require('random-word');
const wordprowl = require('./wordprowl.js');
const { findBestMatch } = require('string-similarity');

let uniqueArray = (arrArg) => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

let getWords = async function (category) {
    let jsonData = await datamuse.words({ ml: category });
    let words = jsonData.sort((a, b) => a.score > b.score).map(entry => entry.word.toUpperCase());
    let filteredWords = uniqueArray(words.filter(word => !(word.includes(' ') || word.includes('-'))));
    let similarWords = [];
    filteredWords.map((word, index, arr) => {
        findBestMatch(word, arr).ratings.sort((a, b) => a.rating < b.rating).filter(entry => entry.rating > 0.7 && entry.target !== word).map(entry => similarWords.push(entry.target));
    });
    filteredWords = filteredWords.filter(word => !similarWords.includes(word));
    let logString = `${filteredWords.length > 0 ? filteredWords.length.toString().padStart(2, '0') : 'No'} words found for category ${category}.`;
    console.log(logString.padEnd(50) + `[${similarWords.length.toString().padStart(2, '0')} filtered]`);
    return filteredWords.length > 10 ? filteredWords.slice(filteredWords.length - 10, filteredWords.length) : filteredWords;
};

let createPuzzle = async function () {
    let words = [], category;
    while (words.length < 10) {
        category = randomWord().toUpperCase();
        words = await getWords(category);
    }

    let puzzle = wordprowl.newPuzzle(words, {
        preferOverlap: true,
        maxGridGrowth: 25,
        fillBlanks: true,
        maxAttempts: 5,
        orientations: ['horizontal', 'vertical', 'verticalUp', 'diagonal', 'diagonalUp']
    });

    let solution = wordprowl.solvePuzzle(puzzle, words);
    let size = puzzle[0].length.toString();

    return {
        category: category,
        puzzle: puzzle,
        words: words,
        solution: solution,
        size: `${size}x${size}`
    };
};

exports.createPuzzle = createPuzzle;
