//jshint esversion:6
const letters = "abcdefghijklmnopqrstuvwxyz".toUpperCase();
const allOrientations = ["horizontal", "horizontalBack", "vertical", "verticalUp", "diagonal", "diagonalUp", "diagonalBack", "diagonalUpBack"];

// The definition of the orientation, calculates the next square given a
// starting square (x,y) and distance (i) from that square.
const orientations = {
	horizontal(x, y, i) {
		return {
			x: x + i,
			y
		};
	},
	horizontalBack(x, y, i) {
		return {
			x: x - i,
			y
		};
	},
	vertical(x, y, i) {
		return {
			x,
			y: y + i
		};
	},
	verticalUp(x, y, i) {
		return {
			x,
			y: y - i
		};
	},
	diagonal(x, y, i) {
		return {
			x: x + i,
			y: y + i
		};
	},
	diagonalBack(x, y, i) {
		return {
			x: x - i,
			y: y + i
		};
	},
	diagonalUp(x, y, i) {
		return {
			x: x + i,
			y: y - i
		};
	},
	diagonalUpBack(x, y, i) {
		return {
			x: x - i,
			y: y - i
		};
	}
};

/** Determines if an orientation is possible given the starting square (x,y),
 * the height (h) and width (w) of the puzzle, and the length of the word (l).
 * Returns true if the word will fit starting at the square provided using
 * the specified orientation.
 *
 */
const checkOrientations = {
	/**
	 * Determines if a horizontal orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	horizontal(x, y, h, w, l) {
		return w >= x + l;
	},

	/**
	 * Determines if a horizontal-backwards orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	horizontalBack(x, y, h, w, l) {
		return x + 1 >= l;
	},

	/**
	 * Determines if a vertical orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	vertical(x, y, h, w, l) {
		return h >= y + l;
	},

	/**
	 * Determines if a vertical-upwards orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	verticalUp(x, y, h, w, l) {
		return y + 1 >= l;
	},

	/**
	 * Determines if a diagonal orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	diagonal(x, y, h, w, l) {
		return (w >= x + l) && (h >= y + l);
	},

	/**
	 * Determines if a diagonal-backwards orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	diagonalBack(x, y, h, w, l) {
		return (x + 1 >= l) && (h >= y + l);
	},

	/**
	 * Determines if a diagonal-upwards orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	diagonalUp(x, y, h, w, l) {
		return (w >= x + l) && (y + 1 >= l);
	},

	/**
	 * Determines if a diagonal-upwards-backwards orientation is possible. Returns true if the word will fit.
	 * @param {number} x X offset of starting square
	 * @param {number} y Y offset of starting square
	 * @param {number} h Height of the puzzle
	 * @param {number} w Width of the puzzle
	 * @param {number} l Length of the word
	 */
	diagonalUpBack(x, y, h, w, l) {
		return (x + 1 >= l) && (y + 1 >= l);
	}
};

// Determines the next possible valid square given the square (x,y) was invalid and a word length of (l).
// This greatly reduces the number of squares that must be checked. Returning {x: x+1, y: y} will always work but will not be optimal.
const skipOrientations = {
	horizontal(x, y, l) {
		return {
			x: 0,
			y: y + 1
		};
	},
	horizontalBack(x, y, l) {
		return {
			x: l - 1,
			y
		};
	},
	vertical(x, y, l) {
		return {
			x: 0,
			y: y + 100
		};
	},
	verticalUp(x, y, l) {
		return {
			x: 0,
			y: l - 1
		};
	},
	diagonal(x, y, l) {
		return {
			x: 0,
			y: y + 1
		};
	},
	diagonalBack(x, y, l) {
		return {
			x: l - 1,
			y: x >= l - 1 ? y + 1 : y
		};
	},
	diagonalUp(x, y, l) {
		return {
			x: 0,
			y: y < l - 1 ? l - 1 : y + 1
		};
	},
	diagonalUpBack(x, y, l) {
		return {
			x: l - 1,
			y: x >= l - 1 ? y + 1 : y
		};
	}
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

	const puzzle = [];
	let i, j, len;

	// initialize the puzzle with blanks
	for (i = 0; i < options.height; i++) {
		puzzle.push([]);
		for (j = 0; j < options.width; j++) {
			puzzle[i].push("");
		}
	}

	// add each word into the puzzle one at a time
	for (i = 0, len = words.length; i < len; i++) {
		if (!placeWordInPuzzle(puzzle, options, words[i])) {
			// if a word didn't fit in the puzzle, give up
			return null;
		}
	}

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

	if (locations.length === 0) {
		return false;
	}

	// select a location at random and place the word there
	const sel = locations[Math.floor(Math.random() * locations.length)];
	placeWord(puzzle, word, sel.x, sel.y, orientations[sel.orientation]);

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

	const locations = [],
		height = options.height,
		width = options.width,
		wordLength = word.length;
	let maxOverlap = 0; // we'll start looking at overlap = 0

	// loop through all of the possible orientations at this position
	for (let k = 0, len = options.orientations.length; k < len; k++) {

		const orientation = options.orientations[k],
			check = checkOrientations[orientation],
			next = orientations[orientation],
			skipTo = skipOrientations[orientation];
		let
			x = 0,
			y = 0;

		// loop through every position on the board
		while (y < height) {

			// see if this orientation is even possible at this location
			if (check(x, y, height, width, wordLength)) {

				// determine if the word fits at the current position
				const overlap = calcOverlap(word, puzzle, x, y, next);

				// if the overlap was bigger than previous overlaps that we've seen
				if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
					maxOverlap = overlap;
					locations.push({
						x,
						y,
						orientation,
						overlap
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
				const nextPossible = skipTo(x, y, wordLength);
				x = nextPossible.x;
				y = nextPossible.y;
			}

		}
	}

	// finally prune down all of the possible locations we found by
	// only using the ones with the maximum overlap that we calculated
	return options.preferOverlap ?
		pruneLocations(locations, maxOverlap) :
		locations;
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

		const next = fnGetSquare(x, y, i),
			square = puzzle[next.y][next.x];

		// if the puzzle square already contains the letter we
		// are looking for, then count it as an overlap square
		if (square === word[i]) {
			overlap++;
		}
		// if it contains a different letter, than our word doesn't fit
		// here, return -1
		else if (square !== "") {
			return -1;
		}
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
const pruneLocations = function (locations, overlap) {
	const pruned = [];
	for (let i = 0, len = locations.length; i < len; i++) {
		if (locations[i].overlap >= overlap) {
			pruned.push(locations[i]);
		}
	}
	return pruned;
};

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
		const next = fnGetSquare(x, y, i);
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
	if (!words.length) {
		throw new Error("Zero words provided");
	}
	let puzzle, attempts = 0,
		gridGrowths = 0;
	const opts = settings || {};

	// copy and sort the words by length, inserting words into the puzzle
	// from longest to shortest works out the best
	const wordList = words.slice(0).sort();

	// initialize the options
	const maxWordLength = wordList[0].length;
	const options = {
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
		while (!puzzle && attempts++ < options.maxAttempts) {
			puzzle = fillPuzzle(wordList, options);
		}

		if (!puzzle) {
			gridGrowths++;
			if (gridGrowths > options.maxGridGrowth) {
				throw new Error(`No valid ${options.width}x${options.height} grid found and not allowed to grow more`);
			}
			// console.log(`No valid ${options.width}x${options.height} grid found after ${attempts - 1} attempts, trying with bigger grid`);
			options.height++;
			options.width++;
			attempts = 0;
		}
	}

	// fill in empty spaces with random letters
	if (options.fillBlanks) {
		let lettersToAdd, fillingBlanksCount = 0,
			extraLetterGenerator;
		if (typeof options.fillBlanks === "function") {
			extraLetterGenerator = options.fillBlanks;
		} else if (typeof options.fillBlanks === "string") {
			lettersToAdd = options.fillBlanks.toLowerCase().split("");
			extraLetterGenerator = () => lettersToAdd.pop() || (fillingBlanksCount++ && "");
		} else {
			extraLetterGenerator = () => letters[Math.floor(Math.random() * letters.length)];
		}
		const extraLettersCount = fillBlanks({
			puzzle,
			extraLetterGenerator
		});
		if (lettersToAdd && lettersToAdd.length) {
			throw new Error(`Some extra letters provided were not used: ${lettersToAdd}`);
		}
		if (lettersToAdd && fillingBlanksCount && !options.allowExtraBlanks) {
			throw new Error(`${fillingBlanksCount} extra letters were missing to fill the grid`);
		}
		const gridFillPercent = 100 * (1 - extraLettersCount / (options.width * options.height));
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
		if (!opts.allowedMissingWords) {
			throw e;
		}
		const options = Object.assign({}, opts); // shallow copy
		options.allowedMissingWords--;
		for (let i = 0; i < words.length; i++) {
			const wordList = words.slice(0);
			wordList.splice(i, 1);
			try {
				const puzzle = newPuzzleLax(wordList, options);
				// console.log(`Solution found without word "${words[i]}"`);
				return puzzle;
			} catch (e) {
				continue;
			} // continue if error
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
const fillBlanks = function ({
	puzzle,
	extraLetterGenerator
}) {
	let extraLettersCount = 0;
	for (let i = 0, height = puzzle.length; i < height; i++) {
		const row = puzzle[i];
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
	const options = {
		height: puzzle.length,
		width: puzzle[0].length,
		orientations: allOrientations,
		preferOverlap: true
	};
	const found = [], notFound = [];

	for (let i = 0, len = words.length; i < len; i++) {
		const word = words[i],
			locations = findBestLocations(puzzle, options, word);

		if (locations.length > 0 && locations[0].overlap === word.length) {
			locations[0].word = word;
			found.push(locations[0]);
		} else {
			notFound.push(word);
		}
	}

	return {
		found,
		notFound
	};
};

/**
 * Outputs a puzzle to the console, useful for debugging.
 * Returns a formatted string representing the puzzle.
 *
 * @param {[[String]]} puzzle: The current state of the puzzle
 * @api public
 */
const printPuzzle = function (puzzle) {
	let puzzleString = "";
	for (let i = 0, height = puzzle.length; i < height; i++) {
		const row = puzzle[i];
		for (let j = 0, width = row.length; j < width; j++) {
			puzzleString += (row[j] === "" ? " " : row[j]) + " ";
		}
		puzzleString += "\n";
	}

	console.log(puzzleString);
	return puzzleString;
};

exports.allOrientations = allOrientations;
exports.defaultLetters = letters;
exports.newPuzzle = newPuzzle;
exports.newPuzzleLax = newPuzzleLax;
exports.solvePuzzle = solvePuzzle;
exports.printPuzzle = printPuzzle;
