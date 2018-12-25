const defaultLetters = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
const allOrientations = ["horizontal", "horizontalBack", "vertical", "verticalUp", "diagonal", "diagonalUp", "diagonalBack", "diagonalUpBack"];

// The definition of the orientation, calculates the next square given a
// starting square (x,y) and distance (i) from that square.
const orientations = {
	horizontal: (x, y, i) => ({ x: x + i, y: y }),
	horizontalBack: (x, y, i) => ({ x: x - i, y: y }),
	vertical: (x, y, i) => ({ x: x, y: y + i }),
	verticalUp: (x, y, i) => ({ x: x, y: y - i }),
	diagonal: (x, y, i) => ({ x: x + i, y: y + i }),
	diagonalBack: (x, y, i) => ({ x: x - i, y: y + i }),
	diagonalUp: (x, y, i) => ({ x: x + i, y: y - i }),
	diagonalUpBack: (x, y, i) => ({ x: x - i, y: y - i })
};

/** Determines if an orientation is possible given the starting square (x,y),
 * the height (h) and width (w) of the puzzle, and the length of the word (l).
 * Returns true if the word will fit starting at the square provided using
 * the specified orientation.
 *
 */
const checkOrientations = {
	horizontal: (x, y, h, w, l) => w >= x + l,
	horizontalBack: (x, y, h, w, l) => x + 1 >= l,
	vertical: (x, y, h, w, l) => h >= y + l,
	verticalUp: (x, y, h, w, l) => y + 1 >= l,
	diagonal: (x, y, h, w, l) => (w >= x + l) && (h >= y + l),
	diagonalBack: (x, y, h, w, l) => (x + 1 >= l) && (h >= y + l),
	diagonalUp: (x, y, h, w, l) => (w >= x + l) && (y + 1 >= l),
	diagonalUpBack: (x, y, h, w, l) => (x + 1 >= l) && (y + 1 >= l)
};

// Determines the next possible valid square given the square (x,y) was invalid and a word length of (l).
// This greatly reduces the number of squares that must be checked. Returning {x: x+1, y: y} will always work but will not be optimal.
const skipOrientations = {
	horizontal: (x, y, l) => ({ x: 0, y: y + 1 }),
	horizontalBack: (x, y, l) => ({ x: l - 1, y: y }),
	vertical: (x, y, l) => ({ x: 0, y: y + 100 }),
	verticalUp: (x, y, l) => ({ x: 0, y: l - 1 }),
	diagonal: (x, y, l) => ({ x: 0, y: y + 1 }),
	diagonalBack: (x, y, l) => ({ x: l - 1, y: x >= l - 1 ? y + 1 : y }),
	diagonalUp: (x, y, l) => ({ x: 0, y: y < l - 1 ? l - 1 : y + 1 }),
	diagonalUpBack: (x, y, l) => ({ x: l - 1, y: x >= l - 1 ? y + 1 : y })
};

/**
 * Initializes the puzzle and places words in the puzzle one at a time.
 *
 * Returns either a valid puzzle with all of the words or null if a valid
 * puzzle was not found.
 *
 * @param {[String]} words: The list of words to fit into the puzzle
 * @param {Object} options: Options to use when filling the puzzle
 * @param {number} options.height: Maximum height of the puzzle
 * @param {number} options.width: Maximum width of the puzzle
 * @param {[String]} options.orientations: Allowed word orientations
 * @param {boolean} options.fillBlanks: Fill the remaining blanks or not
 * @param {boolean} options.allowExtraBlanks: Allow extra blanks or not
 * @param {number} options.maxGridGrowth: Maximum growth of the grid size
 * @param {boolean} options.preferOverlap: Prefer overlapping of words or not
 */
const fillPuzzle = function (words, options) {

	let puzzle = [],
		i, j, len;

	// initialize the puzzle with blanks
	for (i = 0; i < options.height; i++) {
		puzzle.push([]);
		for (j = 0; j < options.width; j++) {
			puzzle[i].push("");
		}
	}

	// add each word into the puzzle one at a time
	for (const word of words)
		if (!placeWordInPuzzle(puzzle, options, word))
			// if a word didn't fit in the puzzle, give up
			return null;

	// return the puzzle
	return puzzle;
};

/**
 * Adds the specified word to the puzzle by finding all of the possible
 * locations where the word will fit and then randomly selecting one. Options
 * controls whether or not word overlap should be maximized.
 *
 * Returns true if the word was successfully placed, false otherwise.
 *
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @param {[Options]} options: The options to use when filling the puzzle
 * @param {String} word: The word to fit into the puzzle.
 */
const placeWordInPuzzle = function (puzzle, options, word) {

	// find all of the best locations where this word would fit
	const locations = findBestLocations(puzzle, options, word);
	if (locations.length === 0)
		return false;

	// select a location at random and place the word there
	const { x, y, orientation } = locations[Math.floor(Math.random() * locations.length)];
	placeWord(puzzle, word, x, y, orientations[orientation]);
	return true;
};

/**
 * Iterates through the puzzle and determines all of the locations where
 * the word will fit. Options determines if overlap should be maximized or
 * not.
 *
 * Returns a list of location objects which contain an x,y cooridinate
 * indicating the start of the word, the orientation of the word, and the
 * number of letters that overlapped with existing letter.
 *
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @param {[Options]} options: The options to use when filling the puzzle
 * @param {String} word: The word to fit into the puzzle.
 */
const findBestLocations = function (puzzle, options, word) {

	let locations = [],
		{ height, width } = options,
		wordLength = word.length,
		maxOverlap = 0; // we'll start looking at overlap = 0

	// loop through all of the possible orientations at this position
	for (let k = 0, len = options.orientations.length; k < len; k++) {

		let orientation = options.orientations[k],
			check = checkOrientations[orientation],
			next = orientations[orientation],
			skipTo = skipOrientations[orientation],
			x = 0,
			y = 0;

		// loop through every position on the board
		while (y < height) {

			// see if this orientation is even possible at this location
			if (check(x, y, height, width, wordLength)) {

				// determine if the word fits at the current position
				let overlap = calcOverlap(word, puzzle, x, y, next);

				// if the overlap was bigger than previous overlaps that we've seen
				if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
					maxOverlap = overlap;
					locations.push({
						x: x,
						y: y,
						orientation: orientation,
						overlap: overlap
					});
				}

				x++;
				if (x >= width) {
					x = 0;
					y++;
				}
			} else {
				// if current cell is invalid, then skip to the next cell where
				// this orientation is possible. this greatly reduces the number
				// of checks that we have to do overall
				let nextPossible = skipTo(x, y, wordLength);
				x = nextPossible.x;
				y = nextPossible.y;
			}

		}
	}

	// finally prune down all of the possible locations we found by
	// only using the ones with the maximum overlap that we calculated
	return options.preferOverlap ? pruneLocations(locations, maxOverlap) : locations;
};

/**
 * Determines whether or not a particular word fits in a particular
 * orientation within the puzzle.
 *
 * Returns the number of letters overlapped with existing words if the word
 * fits in the specified position, -1 if the word does not fit.
 *
 * @param {String} word: The word to fit into the puzzle.
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @param {int} x: The x position to check
 * @param {int} y: The y position to check
 * @param {function} fnGetSquare: Function that returns the next square
 */
const calcOverlap = function (word, puzzle, x, y, fnGetSquare) {
	let overlap = 0;

	// traverse the squares to determine if the word fits
	for (let i = 0, len = word.length; i < len; i++) {

		let next = fnGetSquare(x, y, i),
			square = puzzle[next.y][next.x];

		// if the puzzle square already contains the letter we
		// are looking for, then count it as an overlap square
		if (square === word[i])
			overlap++;

		// if it contains a different letter, than our word doesn't fit
		// here, return -1
		else if (square !== "")
			return -1;
	}

	// if the entire word is overlapping, skip it to ensure words aren't
	// hidden in other words
	return overlap;
};

/**
 * If overlap maximization was indicated, this function is used to prune the
 * list of valid locations down to the ones that contain the maximum overlap
 * that was previously calculated.
 *
 * Returns the pruned set of locations.
 *
 * @param {[Location]} locations: The set of locations to prune
 * @param {int} overlap: The required level of overlap
 */
const pruneLocations = (locations, overlap) => locations.filter(location => location.overlap >= overlap);

/**
 * Places a word in the puzzle given a starting position and orientation.
 *
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @param {String} word: The word to fit into the puzzle.
 * @param {int} x: The x position to check
 * @param {int} y: The y position to check
 * @param {function} fnGetSquare: Function that returns the next square
 */
const placeWord = function (puzzle, word, x, y, fnGetSquare) {
	for (let i = 0, len = word.length; i < len; i++) {
		let next = fnGetSquare(x, y, i);
		puzzle[next.y][next.x] = word[i];
	}
};


/**
 * Generates a new puzzle and returns the puzzle that was created.
 *
 * @param {[String]} words: The list of words to fit into the puzzle
 * @param {Object} settings: Options to use when filling the puzzle
 * @param {number} settings.height: Maximum height of the puzzle
 * @param {number} settings.width: Maximum width of the puzzle
 * @param {[String]} settings.orientations: Allowed word orientations
 * @param {boolean} settings.fillBlanks: Fill the remaining blanks
 * @param {boolean} settings.allowExtraBlanks: Allow extra blanks
 * @param {number} settings.maxAttempts Maximum number of attempts to generate grid
 * @param {number} settings.maxGridGrowth: Maximum growth of the grid size
 * @param {boolean} settings.preferOverlap: Prefer overlapping of words
 */
const newPuzzle = function (words, settings) {
	if (!words.length) throw new Error("Zero words provided");
	let wordList, puzzle, attempts = 0,
		gridGrowths = 0,
		opts = settings || {};

	// copy and sort the words by length, inserting words into the puzzle
	// from longest to shortest works out the best
	wordList = words.slice(0).sort();

	// initialize the options
	let maxWordLength = wordList[0].length;
	let options = {
		height: opts.height || maxWordLength,
		width: opts.width || maxWordLength,
		orientations: opts.orientations || allOrientations,
		fillBlanks: opts.fillBlanks !== undefined ? opts.fillBlanks : true,
		allowExtraBlanks: opts.allowExtraBlanks !== undefined ? opts.allowExtraBlanks : true,
		maxAttempts: opts.maxAttempts || 3,
		maxGridGrowth: opts.maxGridGrowth !== undefined ? opts.maxGridGrowth : 10,
		preferOverlap: opts.preferOverlap !== undefined ? opts.preferOverlap : true
	};

	// add the words to the puzzle
	// since puzzles are random, attempt to create a valid one up to
	// maxAttempts and then increase the puzzle size and try again
	while (!puzzle) {
		while (!puzzle && attempts++ < options.maxAttempts)
			puzzle = fillPuzzle(wordList, options);

		if (!puzzle) {
			if (++gridGrowths > options.maxGridGrowth)
				throw new Error(`No valid ${options.width}x${options.height} grid found and not allowed to grow more`);
			// console.log(`No valid ${options.width}x${options.height} grid found after ${attempts - 1} attempts, trying with bigger grid`);
			options.height++;
			options.width++;
			attempts = 0;
		}
	}

	// fill in empty spaces with random letters
	if (options.fillBlanks) {
		let lettersToAdd, fillingBlanksCount = 0, extraLetterGenerator;
		if (typeof options.fillBlanks === "function")
			extraLetterGenerator = options.fillBlanks;
		else if (typeof options.fillBlanks === "string") {
			lettersToAdd = options.fillBlanks.toLowerCase().split("");
			extraLetterGenerator = () => lettersToAdd.pop() || (fillingBlanksCount++ && "");
		} else {
			extraLetterGenerator = () => defaultLetters[Math.floor(Math.random() * defaultLetters.length)];
		}
		const extraLettersCount = fillBlanks({ puzzle, extraLetterGenerator });
		if (lettersToAdd && lettersToAdd.length)
			throw new Error(`Some extra letters provided were not used: ${lettersToAdd}`);
		if (lettersToAdd && fillingBlanksCount && !options.allowExtraBlanks)
			throw new Error(`${fillingBlanksCount} extra letters were missing to fill the grid`);
		// let gridFillPercent = 100 * (1 - extraLettersCount / (options.width * options.height));
		// console.log(`Blanks filled with ${extraLettersCount} random letters - Final grid is filled at ${gridFillPercent.toFixed(0)}%`);
	}

	return puzzle;
};

/**
 * Wrapper around `newPuzzle` allowing to find a solution without some words.
 *
 * @param {options} settings: The options to use for this puzzle.
 * Same as `newPuzzle` + allowedMissingWords
 */
const newPuzzleLax = function (words, opts) {
	try {
		return newPuzzle(words, opts);
	} catch (e) {
		if (!opts.allowedMissingWords) throw e;
		let opts = Object.assign({}, opts); // shallow copy
		opts.allowedMissingWords--;
		for (let i = 0; i < words.length; i++) {
			let wordList = words.slice(0);
			wordList.splice(i, 1);
			try {
				let puzzle = newPuzzleLax(wordList, opts);
				// console.log(`Solution found without word "${words[i]}"`);
				return puzzle;
			} catch (e) { } // continue if error
		}
		throw e;
	}
};

/**
 * Fills in any empty spaces in the puzzle with random letters.
 *
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @api public
 */
const fillBlanks = function ({ puzzle, extraLetterGenerator }) {
	let extraLettersCount = 0;
	for (let i = 0, height = puzzle.length; i < height; i++) {
		let row = puzzle[i];
		for (let j = 0, width = row.length; j < width; j++) {
			if (!puzzle[i][j]) {
				puzzle[i][j] = extraLetterGenerator();
				extraLettersCount++;
			}
		}
	}
	return extraLettersCount;
};

/**
 * Returns the starting location and orientation of the specified words
 * within the puzzle. Any words that are not found are returned in the
 * notFound array.
 *
 * Returns
 *   x position of start of word
 *   y position of start of word
 *   orientation of word
 *   word
 *   overlap (always equal to word.length)
 *
 * @param {[[String]]} puzzle The current state of the puzzle
 * @param {[String]} words The list of words to find
 */
const solvePuzzle = function (puzzle, words) {
	let options = {
		height: puzzle.length,
		width: puzzle[0].length,
		orientations: allOrientations,
		preferOverlap: true
	};
	let found = [], notFound = [];

	for (let word of words) {
		let [location] = findBestLocations(puzzle, options, word);
		if (location && location.overlap === word.length) {
			location.word = word;
			found.push(location);
		} else notFound.push(word);
	}

	return { found, notFound };
};

/**
 * Outputs a puzzle to the console, useful for debugging.
 * Returns a formatted string representing the puzzle.
 *
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @api public
 */
const printPuzzle = puzzle => puzzle.map(row => row.map(letter => letter.length > 0 ? letter : " ").join(" ")).join("\n");

module.exports = {
	allOrientations,
	defaultLetters,
	newPuzzle,
	newPuzzleLax,
	solvePuzzle,
	printPuzzle
};