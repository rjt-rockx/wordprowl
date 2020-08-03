//jshint esversion:6
const datamuse = require("datamuse");
const randomWord = require("random-word");
const wordprowl = require("./wordprowl.js");

const uniqueArray = function (arrArg) {
	return arrArg.filter(function (elem, pos, arr) {
		return arr.indexOf(elem) == pos;
	});
};

const getWords = async function (category) {
	const words = await Promise.resolve(datamuse.words({
		"ml": category
	})
		.then((json) => {
			let wordarray = [];
			json.sort((a, b) => {
				return a.score > b.score;
			});
			json.forEach((entry) => wordarray.push(entry.word.toUpperCase()));
			wordarray = uniqueArray(wordarray.filter(word => !word.includes(" ")));
			// console.log(category);
			// console.log(wordarray);
			return wordarray.length > 10 ? wordarray.slice(wordarray.length - 10, wordarray.length) : wordarray;
		})
		.catch((err) => console.log(err)));
	return words;
};
const createPuzzle = async function () {
	let words = [];
	let category;
	while (words.length < 10) {
		category = randomWord().toUpperCase();
		words = await Promise.resolve(getWords(category));
	}
	const puzzle = wordprowl.newPuzzle(words, {
		preferOverlap: true,
		maxGridGrowth: 25,
		fillBlanks: true,
		maxAttempts: 5,
		orientations: ["horizontal", "vertical", "verticalUp", "diagonal", "diagonalUp"]
	});
	console.log("\nWordprowl - " + category + "\n");
	wordprowl.printPuzzle(puzzle);
	console.log("\nWords:\n" + words.join("\n"));
	// console.log(puzzle);
	// console.log(wordprowl.solvePuzzle(puzzle, words));
};
createPuzzle();