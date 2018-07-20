//jshint esversion:6
var datamuse = require('datamuse');
var randomWord = require('random-word');
var wordprowl = require('./wordprowl.js');

var uniqueArray = function (arrArg) {
    return arrArg.filter(function (elem, pos, arr) {
        return arr.indexOf(elem) == pos;
    });
};

var getWords = async function (category) {
    let words = await Promise.resolve(datamuse.words({
            "ml": category
        })
        .then((json) => {
            let wordarray = [];
            json.sort((a, b) => {
                return a.score > b.score;
            });
            json.forEach((entry) => wordarray.push(entry.word.toUpperCase()));
            wordarray = uniqueArray(wordarray.filter(word => !word.includes(' ')));
            // console.log(category);
            // console.log(wordarray);
            return wordarray.length > 10 ? wordarray.slice(wordarray.length - 10, wordarray.length) : wordarray;
        })
        .catch((err) => console.log(err)));
    return words;
}

var createPuzzle = async function () {
    let words = [];
    let category;
    while (words.length < 10) {
        category = randomWord().toUpperCase();
        words = await Promise.resolve(getWords(category));
    }

    let puzzle = wordprowl.newPuzzle(words, {
        preferOverlap: true,
        maxGridGrowth: 25,
        fillBlanks: true,
        maxAttempts: 5,
        orientations: ['horizontal', 'vertical', 'verticalUp', 'diagonal', 'diagonalUp']
    });

    let solution = wordprowl.solvePuzzle(puzzle, words);

    return {
        category: category,
        puzzle: puzzle,
        words: words,
        solution: solution
    };
}

exports.createPuzzle = createPuzzle;
