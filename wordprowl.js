const randomElement = arr => arr[Math.floor(Math.random() * Math.floor(arr.length))];
const distribute = (start, end, length) => Array.from({ length }, (_, i) => Math.ceil(start + (i * (end - start) / length)));

/**
 * Create a Wordprowl instance.
 * @class
 */
class Wordprowl {

	/**
	 * Create a new Wordprowl instance.
	 * @param {Object} [options={}] Options for generating puzzles.
	 * @param {String} [options.letters] Letters to use to fill the remaining blanks.
	 * @param {Number} [options.height] Height of the puzzle.
	 * @param {Number} [options.width] Width of the puzzle.
	 * @param {String[]} [options.orientations=allOrientations] Orientations to place words in.
	 * @param {Boolean} [options.fillBlanks=true] Fill blank spaces.
	 * @param {Boolean} [options.allowExtraBlanks=true] Allow additional blank spaces.
	 * @param {Number} [options.maxAttempts=3] Number of attempts to generate a puzzle.
	 * @param {Number} [options.maxGridGrowth=10] Number of times the grid can grow in size.
	 * @param {Number} [options.allowedMissingWords=0] Number of words that can be skipped.
	 * @param {Boolean} [options.preferOverlap=true] Prefer word overlap.
	 * @param {Boolean} [options.debug=false] Log additional details in the console.
	 * @returns {Wordprowl} A new Wordprowl instance with the given options.
	 * @memberof Wordprowl
	 */
	constructor(options = {}) {
		this._setupOptions(options);
	}

	/**
	 * Print a debug message if the debug option is enabled.
	 * @param {String} message Debug message to log to the console.
	 * @memberof Wordprowl
	 * @private
	 */
	_debug(message) {
		if (this.options.debug)
			console.log(message);
	}

	/**
	 * Setup options and assign them to this.
	 * @param {Object} [options={}] Options for generating puzzles.
	 * @memberof Wordprowl
	 * @private
	 */
	_setupOptions(options) {
		if (!options.debug)
			this._debug("Debug messages disabled.");
		else {
			this.options.debug = Boolean(options.debug);
			this._debug("Debug messages enabled.");
		}

		// Check height.
		if (typeof options.height === "number")
			this.options.height = options.height;
		else {
			this._debug("Invalid height specified; Using 15.");
			this.options.height = 15;
		}

		// Check width.
		if (typeof options.width === "number")
			this.options.width = options.width;
		else {
			this._debug("Invalid width specified; Using 15.");
			this.options.width = 15;
		}

		// Check maxAttempts.
		if (typeof options.maxAttempts === "number")
			this.options.maxAttempts = options.maxAttempts;
		else {
			this._debug("Invalid maxAttempts specified; Using 5.");
			this.options.maxAttempts = 5;
		}

		// Check maxGridGrowth.
		if (typeof options.maxGridGrowth === "number")
			this.options.maxGridGrowth = options.maxGridGrowth;
		else {
			this._debug("Invalid maxGridGrowth specified; Using 10.");
			this.options.maxGridGrowth = 10;
		}

		// Check allowedMissingWords.
		if (typeof options.allowedMissingWords === "number")
			this.options.allowedMissingWords = options.allowedMissingWords;
		else {
			this._debug("Invalid allowedMissingWords specified; Using 0.");
			this.options.allowedMissingWords = 0;
		}

		// Assign the rest of the options as Booleans.
		this.options = {
			...this.options,
			fillBlanks: Boolean(options.fillBlanks),
			allowExtraBlanks: Boolean(options.allowExtraBlanks),
			preferOverlap: Boolean(options.preferOverlap)
		};

		// Verify orientations and assign them to this.options.
		this.allOrientations = ["horizontal", "horizontalBack", "vertical", "verticalUp", "diagonal", "diagonalUp", "diagonalBack", "diagonalUpBack"];
		if (Array.isArray(options.orientations) && options.orientations.length > 0 && options.orientations.every(orientation => this.allOrientations.includes(orientation))) {
			this._debug("Using orientations " + options.orientations.join(", "));
			this.options.orientations = options.orientations;
		} else {
			this._debug("Invalid/no orientations specified; Using all orientations.");
			this.options.orientations = this.allOrientations;
		}

		// Verify letters and assign them to this.options.

		// If letters are provided as a string.
		if (typeof options.letters === "string") {
			this.options.letters = options.letters;
			this._debug(`Using letters ${options.letters}`);
		}
		// If letters are provided as an Array.
		else if (Array.isArray(options.letters) && options.letters.length > 0) {
			if (options.letters.every(letter => ["string", "number"].includes(typeof letter))) {
				this.options.letters = options.letters.join("");
				this._debug(`Using letters ${this.options.letters}`);
			}
		}
		// If no letters are provided.
		else {
			this.options.letters = "abcdefghijklmnopqrstuvwxyz";
			this._debug(`Invalid letters specified; Using letters ${options.letters}`);
		}
	}

	/**
	 * Compute the next square given the starting coordinates (x, y) and distance (d) from that square.
	 * @param {String} orientation Orientation to compute the next square in.
	 * @param {Number} x X coordinate of the word.
	 * @param {Number} y Y coordinate of the word.
	 * @param {Number} d Distance to compute.
	 * @returns {{x: Number, y: Number}} An object {x, y} representing the coordinates of the next square.
	 * @private
	 * @memberof Wordprowl
	 */
	computeOrientations(orientation, x, y, d) {
		switch (orientation) {
			case "horizontal":
				return { x: x + d, y };

			case "horizontalBack":
				return { x: x - d, y };

			case "vertical":
				return { x, y: y + d };

			case "verticalUp":
				return { x, y: y - d };

			case "diagonal":
				return { x: x + d, y: y + d };

			case "diagonalBack":
				return { x: x - d, y: y + d };

			case "diagonalUp":
				return { x: x + d, y: y - d };

			case "diagonalUpBack":
				return { x: x - d, y: y - d };
		}
	}

	/**
	 * Determines if an orientation is possible given the starting square coordinates (x, y), the height (h) and width (w) of the puzzle, and the length of the word (l).
	 * @param {String} orientation Orientation to check.
	 * @param {Number} x X coordinate of the starting square.
	 * @param {Number} y Y coordinate of the starting square.
	 * @param {Number} h Height of the puzzle.
	 * @param {Number} w Width of the puzzle.
	 * @param {Number} l Length of the word.
	 * @returns {Boolean} Whether the word will fit in the given orientation.
	 * @private
	 * @memberof Wordprowl
	 */
	checkOrientations(orientation, x, y, h, w, l) {
		switch (orientation) {
			case "horizontal":
				return w >= x + l;

			case "horizontalBack":
				return x + 1 >= l;

			case "vertical":
				return h >= y + l;

			case "verticalUp":
				return y + 1 >= l;

			case "diagonal":
				return (w >= x + l) && (h >= y + l);

			case "diagonalBack":
				return (x + 1 >= l) && (h >= y + l);

			case "diagonalUp":
				return (w >= x + l) && (y + 1 >= l);

			case "diagonalUpBack":
				return (x + 1 >= l) && (y + 1 >= l);
		}
	}

	/**
	 * Determine the next possible valid square given the square coordinates (x, y) and the word length (l).
	 * @param {String} orientation Orientation to check in.
	 * @param {Number} x X coordinate of the current square.
	 * @param {Number} y Y coordinate of the current square.
	 * @param {Number} l Word length.
	 * @returns {{x: Number, y: Number}} Coordinates to skip.
	 * @private
	 * @memberof Wordprowl
	 */
	skipOrientations(orientation, x, y, l) {
		switch (orientation) {
			case "horizontal":
				return { x: 0, y: y + 1 };

			case "horizontalBack":
				return { x: l - 1, y };

			case "vertical":
				return { x: 0, y: y + 100 };

			case "verticalUp":
				return { x: 0, y: l - 1 };

			case "diagonal":
				return { x: 0, y: y + 1 };

			case "diagonalBack":
				return { x: l - 1, y: x >= l - 1 ? y + 1 : y };

			case "diagonalUp":
				return { x: 0, y: y < l - 1 ? l - 1 : y + 1 };

			case "diagonalUpBack":
				return { x: l - 1, y: x >= l - 1 ? y + 1 : y };
		}
	}

	/**
	 * Initializes the puzzle and places words in the puzzle one at a time.
	 * @param {String[]} words Words to fit in the puzzle.
	 * @param {Object} options Options to use when filling the puzzle.
	 * @param {Number} options.height Height of the puzzle.
	 * @param {Number} options.width Width of the puzzle.
	 * @returns {String[][]} Returns either a valid puzzle with all of the words or null if a valid puzzle cannot be generated.
	 * @private
	 * @memberof Wordprowl
	 */
	fillPuzzle(words, options = this.options) {

		// Check if words provided are valid.
		if (!words || !Array.isArray(words) || !words.length)
			throw new Error("Invalid words provided.");

		// Initialize the puzzle with blanks.
		this.puzzle = new Array(options.height).fill(new Array(options.width).fill(""));

		// Try placing each word in the puzzle.
		for (const word of words)
			if (!this.placeWordInPuzzle(this.puzzle, options, word)) {
				this._debug(`Unable to place word ${word} in the puzzle; Returning.`);
				// Discard the puzzle and solution if a word could not be placed.
				this.puzzle = [];
				this.solution = { found: [], notFound: [] };
				return;
			}

		// Return the generated puzzle.
		return this.puzzle;
	}

	/**
	 * Add the specified word to the puzzle by randomly picking one possible location.
	 * @param {String[][]} puzzle Current state of the puzzle.
	 * @param {Object} options Options to find the best locations to place the word in.
	 * @param {String} word Word to fit in the puzzle.
	 * @returns {Object} Location if the word was successfully placed.
	 * @memberof Wordprowl
	 * @private
	 */
	placeWordInPuzzle(puzzle, options = this.options, word) {
		// Find all best locations where the word will fit.
		const locations = this.findBestLocations(puzzle, options, word);

		// If no locations were found.
		if (!locations.length) {
			this._debug(`No locations found for word ${word}; Returning.`);
			return;
		}

		// Select a location at random and place the word there.
		const location = randomElement(locations);
		this.placeWord(puzzle, word, location.start.x, location.start.y, location.orientation);
		this._debug(`Word ${word} successfully placed in ${location.orientation} orientation between (${location.start.x},${location.start.y}) and (${location.end.x},${location.end.y}).`);

		// Store the location in the solution and return it.
		this.solution.found.push(location);
		return location;
	}

	/**
	 * Calculate the coordinates for a word, given the orientation, start coordinates and length of the word.
	 * @param {String} orientation Orientation to calculate the coordinates in.
	 * @param {Number} x X coordinate of the starting square of the word.
	 * @param {Number} y Y coordinate of the starting square of the word.
	 * @param {Number} wordLength Length of the word.
	 * @returns {[Number,Number][]} List of coordinates occupied by the word.
	 * @memberof Wordprowl
	 * @private
	 */
	calculateCoordinates(orientation, x, y, wordLength) {
		// Compute coordinates of the end cell.
		const { x: x2, y: y2 } = this.computeOrientations(orientation, x, y, wordLength);

		// Get the x and y coordinates between the start and end squares.
		const xCoords = distribute(x, x2, wordLength);
		const yCoords = distribute(y, y2, wordLength);
		return Array.from({ length: wordLength }, (_, i) => [xCoords[i], yCoords[i]]);
	}

	/**
	 * Iterate through the puzzle and determine all locations where the word can fit.
	 * @param {String[][]} puzzle Puzzle to determine locations in.
	 * @param {Object} options Options used for generating the puzzle.
	 * @param {String} word Word to fit into the puzzle.
	 * @returns {Object[]} List of location objects which contain coordinates (x,y) indicating the start of the word, the orientation of the word, and the number of letters that overlapped with existing letter.
	 * @private
	 * @memberof Wordprowl
	 */
	findBestLocations(puzzle, options = this.options, word) {
		const locations = [];
		let maxOverlap = 0;

		// Loop through all of the possible orientations at this position.
		for (const orientation of options.orientations) {
			let x = 0, y = 0;

			// Loop through every position on the board.
			while (y < options.height) {

				// Check if this orientation is possible at this location.
				if (this.checkOrientations(orientation, x, y, options.height, options.width, word.length)) {
					// Determine if the word fits at the current position.
					const overlap = this.calculateOverlap(word, puzzle, x, y, orientation);

					// If the overlap was bigger than previous overlaps that we've seen, increase maxOverlap and push it to locations.
					if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
						maxOverlap = overlap;
						locations.push({
							start: { x, y },
							end: { ...this.computeOrientations(orientation, x, y, word.length) },
							coordinates: this.calculateCoordinates(orientation, x, y, word.length),
							word, orientation, overlap
						});
					}
					x++;
					if (x >= options.width) {
						x = 0;
						y++;
					}
				} else {
					// If the current location is invalid, skip to the next location where this orientation is possible.
					const next = this.skipOrientations(orientation, x, y, word.length);
					x = next.x;
					y = next.y;
				}
			}
		}
		this._debug(`Found ${locations.length} possible locations for the word ${word}.`);

		// Return the locations, optionally pruned to maximize overlap.
		return options.preferOverlap ? this.pruneLocations(locations, maxOverlap) : locations;
	}

	/**
	 * Determines whether or not a particular word fits in a particular orientation within the puzzle.
	 * @param {String} word Word to fit into the puzzle.
	 * @param {String[][]} [puzzle=this.puzzle] Current state of the puzzle.
	 * @param {Number} x X coordinate of the starting square.
	 * @param {Number} y Y coordinate of the starting square.
	 * @param {String} orientation Orientation to use when computing the next square.
	 * @returns {Number} Number of letters overlapping existing words if the word fits in the specified position, -1 if the word does not fit
	 * @private
	 * @memberof Wordprowl
	 */
	calculateOverlap(word, puzzle, x, y, orientation) {
		let overlap = 0;

		// Traverse the puzzle squares to determine if the word fits.
		for (const i in [...word]) {
			const next = this.computeOrientations(orientation, x, y, i),
				square = puzzle[next.y][next.x];
			// If the puzzle square already contains the letter we are looking for, increment the overlap count.
			if (square === word[i]) overlap++;
			// If it contains a different letter, the word cannot be placed here.
			else if (!square) {
				this._debug(`Unable to overlap word ${word} in ${orientation} orientation.`);
				return -1;
			}
		}
		// If the entire word overlaps, skip it to ensure words aren't hidden in other words.
		if (overlap === word.length) {
			this._debug(`Word ${word} fully overlaps in ${orientation} orientation; Skipping.`);
			return -1;
		}

		return overlap;
	}

	/**
	 * Prune the list of valid locations down to the ones that contain the maximum overlap that was previously calculated.
	 * @param {Object[]} locations Locations to prune.
	 * @param {Number} locations.overlap Overlap in the location.
	 * @param {Number} overlap Required amount of overlap.
	 * @returns {Object[]} Pruned set of locations.
	 * @private
	 * @memberof Wordprowl
	 */
	pruneLocations(locations, overlap) {
		const prunedLocations = locations.filter(location => location.overlap >= overlap);
		this._debug(`${locations.length - prunedLocations.length} removed to maximise overlap.`);
		return prunedLocations;
	}

	/**
	 * Places a word in the puzzle given a starting position and orientation.
	 * @param {String[][]} puzzle Puzzle to place words in.
	 * @param {String} word Word to place in the puzzle.
	 * @param {Number} x X coordinate of the starting position.
	 * @param {Number} y Y coordinate of the starting position.
	 * @param {String} orientation Orientation to use when computing the next squares.
	 * @returns {[Number,Number][]} List of coordinates of the given word.
	 * @private
	 * @memberof Wordprowl
	 */
	placeWord(puzzle, word, x, y, orientation) {
		for (const index in word) {
			const next = this.computeOrientations(orientation, x, y, index);
			puzzle[next.y][next.x] = word[index];
		}
	}

	/**
	 * Create a new puzzle with the given words.
	 * @param {String[]} words Words to place in the puzzle.
	 * @param {Object} [options=this.options] Options for generating the puzzle.
	 * @returns {String[][]} Puzzle object.
	 * @memberof Wordprowl
	 * @public
	 */
	newPuzzle(words, options = this.options) {
		this._debug("Discarding previous puzzle and solution.");
		this.puzzle = [];
		this.solution = { found: [], notFound: [] };
		// add the words to the puzzle
		// since puzzles are random, attempt to create a valid one up to maxAttempts and then increase the puzzle size and try again
		while (!this.puzzle.length) {
			while (!this.puzzle.length && this.attempts++ < options.maxAttempts)
				this.puzzle = this.fillPuzzle(words, options);

			if (!this.puzzle.length) {
				this.gridGrowths++;
				if (this.gridGrowths > options.maxGridGrowth)
					throw new Error(`No valid ${options.width}x${options.height} grid found and not allowed to grow more.`);
				this._debug(`No valid ${options.width}x${options.height} grid found after ${this.attempts - 1} attempts, trying with a bigger grid.`);
				options.height++;
				options.width++;
				this.attempts = 0;
			}
		}

		// fill in empty spaces with random letters
		if (options.fillBlanks) {
			this.puzzle = this.puzzle.map(row => row.map(letter => letter || randomElement(this.options.letters)));
			this._debug("Blanks filled.");
		}

		this._debug(`Generated puzzle:\n${this.stringify(this.puzzle)}`);
		return this.puzzle;
	}

	/**
	 * Generate a puzzle with a few missing words.
	 * @param {String[]} words Words to place in the puzzle.
	 * @param {Object} options Options to generate the puzzle with.
	 */
	newPuzzleLax(words, options = this.options) {
		try {
			// Attempt generating a puzzle without removing any word.
			return this.newPuzzle(words, options);
		}
		catch (e) {
			// Throw an error if no more missing words can be allowed.
			if (!options.allowedMissingWords) throw e;

			// Make a shallow copy of the options and decrement allowedMissingWords.
			const opts = Object.assign({}, options);
			opts.allowedMissingWords--;

			// Loop through the words, trying to generate a puzzle without each word.
			for (const index in words) {
				try {
					this._debug(`Trying to generate puzzle without word ${words[index]}`);
					this.puzzle = this.newPuzzleLax(words.slice(0).splice(index, 1), opts);
					this._debug(`Solution found without word ${words[index]}`);
					return this.puzzle;
				} catch (e) { this._debug(e); }
			}

			// Throw an error if a puzzle could still not be generated.
			throw e;
		}
	}

	/**
	 * Returns the location and orientation of the specified words within the puzzle.
	 * @param {String[][]} puzzle Puzzle to solve.
	 * @param {String[]} words Words to find in the puzzle.
	 * @returns {{found:Object[], notFound:String[]}} Object containing the word locations that were found and words that were not found.
	 * @public
	 * @memberof Wordprowl
	 */
	solvePuzzle(puzzle = this.puzzle, words) {

		// Check if the puzzle already exists.
		if (puzzle === this.puzzle && this.solution) {
			this._debug("Puzzle already exists. Returning existing solution.");
			return this.solution;
		}

		// Discard the solution, if previously stored.
		this._debug("Discarding previous solution.");
		this.solution = { found: [], notFound: [] };

		// Check with the given options.
		this._debug("Using given orientations and considering overlap.");
		const options = {
			height: puzzle.length,
			width: puzzle[0].length,
			orientations: this.orientations,
			preferOverlap: true
		};

		// Loop through the words and try to find their locations.
		for (const word of words) {
			// Get the first location of the word in the puzzle.
			const [location] = this.findBestLocations(puzzle, options, word);
			if (location && location.overlap === word.length) {
				this._debug(`${location.word} found between (${location.start.x},${location.start.y}) and (${location.end.x},${location.end.y}) in ${location.orientation} orientation.`);
				// Store the location as found.
				this.solution.found.push(location);
			} else {
				this._debug(`${word} was not found.`);
				// Store the word as not found.
				this.solution.notFound.push(word);
			}
		}

		// Return the solution.
		this._debug(`Returning solution with ${this.solution.found.length} words found and ${this.solution.notFound.length} words not found.`);
		return this.solution;
	}

	/**
	 * Returns a puzzle string, spaced and separated with newlines.
	 * @param {String[][]} puzzle Puzzle to print.
	 * @returns {String} Puzzle string, spaced and separated with newlines.
	 * @memberof Wordprowl
	 * @public
	 */
	stringify(puzzle = this.puzzle) {
		return puzzle.map(row => row.map(letter => letter || " ").join(" ")).join("\n");
	}
}

module.exports = Wordprowl;