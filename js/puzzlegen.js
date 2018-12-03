const datamuse = require("datamuse");
const randomWord = require("random-word");
const wordprowl = require("./wordprowl.js");
const { findBestMatch } = require("string-similarity");

let uniqueArray = (arrArg) => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) == pos);

let getWords = async function (category) {
	let jsonData = await datamuse.words({ ml: category });
	let words = jsonData.sort((a, b) => a.score > b.score).map(entry => entry.word.toUpperCase());
	let filteredWords = uniqueArray(words.filter(word => !(word.includes(" ") || word.includes("-") || word.length < 5 || word.length > 15)));
	let similarWords = [];
	filteredWords.map((word, index, arr) => {
		findBestMatch(word, arr).ratings.sort((a, b) => a.rating < b.rating).filter(entry => entry.rating > 0.7 && entry.target !== word).map(entry => similarWords.push(entry.target));
	});
	filteredWords = filteredWords.filter(word => !similarWords.includes(word));
	let logString = `${filteredWords.length > 0 ? filteredWords.length.toString().padStart(2, "0") : "No"} words found for category ${category}.`;
	console.log(logString.padEnd(50) + `[${similarWords.length.toString().padStart(2, "0")} filtered]`);
	return filteredWords.length > 10 ? filteredWords.slice(filteredWords.length - 10, filteredWords.length) : filteredWords;
};

const getEndCell = {
	horizontal: (x, y, l) => ({ x: x + l, y }),
	horizontalBack: (x, y, l) => ({ x: x - l, y }),
	vertical: (x, y, l) => ({ x, y: y + l }),
	verticalUp: (x, y, l) => ({ x, y: y - l }),
	diagonal: (x, y, l) => ({ x: x + l, y: y + l }),
	diagonalUp: (x, y, l) => ({ x: x + l, y: y - l }),
	diagonalBack: (x, y, l) => ({ x: x - l, y: y + l }),
	diagonalUpBack: (x, y, l) => ({ x: x - l, y: y - l })
};

const formatSolution = ({ word, orientation, x, y }) => {
	const endCellCoords = getEndCell[orientation](x, y, word.length - 1);
	return {
		word: word,
		orientation: orientation,
		start: { x, y },
		end: {
			x: endCellCoords.x,
			y: endCellCoords.y
		}
	};
};

let createPuzzle = async function () {
	let words = [], category;
	while (words.length < 10) {
		category = randomWord().toUpperCase();
		words = await getWords(category);
	}

	let puzzle = wordprowl.newPuzzle(words, {
		preferOverlap: true,
		maxGridGrowth: 15,
		fillBlanks: true,
		maxAttempts: 10,
		orientations: ["horizontal", "horizontalBack", "vertical", "verticalUp", "diagonal", "diagonalUp", "diagonalBack", "diagonalUpBack"],
	});

	let solution = wordprowl.solvePuzzle(puzzle, words);
	let size = puzzle[0].length;
	solution.found = solution.found.map(formatSolution);
	return { category, puzzle, words, solution, size };
};

exports.createPuzzle = createPuzzle;
