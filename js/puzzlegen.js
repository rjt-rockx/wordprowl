const datamuse = require("datamuse");
const randomWord = require("random-word");
const wordprowl = require("./wordprowl.js");
const { findBestMatch } = require("string-similarity");
const uniqueArray = arrArg => [...new Set(arrArg)];

const getWords = async function (category) {
	const jsonData = await datamuse.words({ ml: category });
	const words = jsonData.sort((a, b) => a.score > b.score).map(entry => entry.word.toUpperCase());
	let filteredWords = uniqueArray(words.filter(word => !(word.includes(" ") || word.includes("-") || word.length < 5 || word.length > 15)));
	const similarWords = [];
	for (const word of filteredWords) {
		let { ratings } = findBestMatch(word, filteredWords);
		ratings = ratings.sort((a, b) => a.rating < b.rating).filter(entry => entry.rating > 0.7 && entry.target !== word);
		similarWords.push(...ratings.map(entry => entry.target));
	}
	filteredWords = filteredWords.filter(word => !similarWords.includes(word));
	const logString = `${filteredWords.length > 0 ? filteredWords.length.toString().padStart(2, "0") : "No"} words found for category ${category}.`;
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
		word, orientation,
		start: { x, y },
		end: {
			x: endCellCoords.x,
			y: endCellCoords.y
		}
	};
};

const createPuzzle = async function () {
	let words = [], category, puzzle;
	while (!puzzle) {
		while (words.length < 10) {
			category = randomWord().toUpperCase();
			words = await getWords(category);
		}
		try {
			puzzle = wordprowl.newPuzzle(words, {
				preferOverlap: true,
				maxGridGrowth: 15,
				fillBlanks: true,
				maxAttempts: 10,
				orientations: ["horizontal", "vertical", "verticalUp", "diagonal", "diagonalUp"]
			});
		}
		catch (err) {
			console.log(err);
			puzzle = undefined;
		}
	}

	const solution = wordprowl.solvePuzzle(puzzle, words);
	solution.found = solution.found.map(formatSolution);
	return { category, puzzle, words, solution, size: puzzle[0].length };
};

exports.createPuzzle = createPuzzle;
