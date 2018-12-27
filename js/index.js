const socket = io.connect();

function getNewPuzzle() {
	hidePuzzle();
	emptyPuzzle();
	resetCanvas();
	socket.emit("getNewPuzzle");
}

function hidePuzzle() {
	$("#puzzle__loading-spinner").removeClass("puzzle__loading-spinner--hidden");
}

function emptyPuzzle() {
	for (const element of ["#puzzle__title", "#puzzle__grid", "#word__list"])
		$(element).html("");
}

function showPuzzle() {
	$("#puzzle__loading-spinner").addClass("puzzle__loading-spinner--hidden");
}

function getMousePosition(canvas, event) {
	const boundingRectangle = canvas.getBoundingClientRect();
	return {
		x: event.clientX - boundingRectangle.left,
		y: event.clientY - boundingRectangle.top
	};
}

function initCanvas({ size, wordManager }) {
	const canvas = $("#puzzle__canvas").get(0);
	const ctx = canvas.getContext("2d");

	canvas.width = $("#puzzle__grid").width();
	canvas.height = $("#puzzle__grid").height();

	const puzzleCellSide = canvas.width / size;

	let start = { x: 0, y: 0 }, end = { x: 0, y: 0 };

	$("#puzzle__canvas").mousedown(event => {
		let position = getMousePosition(canvas, event);
		start = {
			x: Math.floor(position.x / puzzleCellSide),
			y: Math.floor(position.y / puzzleCellSide)
		};

		$("#puzzle__canvas").mousemove(event => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();

			Object.assign(ctx, {
				lineWidth: Math.floor(300 / size),
				lineCap: "round",
				strokeStyle: "#ffffff",
				globalAlpha: 0.2
			});

			ctx.moveTo(
				start.x * puzzleCellSide + puzzleCellSide / 2,
				start.y * puzzleCellSide + puzzleCellSide / 2
			);

			position = getMousePosition(canvas, event);

			ctx.lineTo(
				puzzleCellSide * (Math.floor(position.x / puzzleCellSide) + 0.5),
				puzzleCellSide * (Math.floor(position.y / puzzleCellSide) + 0.5)
			);

			ctx.stroke();
		});
	});

	$("#puzzle__canvas").mouseup(event => {
		const position = getMousePosition(canvas, event);
		end = {
			x: Math.floor(position.x / puzzleCellSide),
			y: Math.floor(position.y / puzzleCellSide)
		};

		if (start.x == end.x && start.y == end.y)
			ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (wordManager.tryCoords(start, end))
			setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 1000);
		else
			setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 250);

		$("#puzzle__canvas").unbind("mousemove");
	});
}

function resetCanvas() {
	const canvas = $("#puzzle__canvas").get(0);
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	$("#puzzle__canvas").off();
}

socket.on("createPuzzle", ({ puzzle, size, category, solution }) => {
	emptyPuzzle();

	const $puzzleTitle = $("#puzzle__title");
	const $puzzleGrid = $("#puzzle__grid");
	const $wordList = $("#word__list");
	const $puzzleLoadingSpinner = $("#puzzle__loading-spinner");

	const colorList = [
		"#FF290D", "#FF9326", "#FDE508", "#BFF428", "#21E950",
		"#04FFC3", "#00A8DB", "#3941BD", "#B322CE", "#F225AE"
	];

	$puzzleLoadingSpinner.removeClass("puzzle__loading-spinner--hidden");
	$puzzleTitle.html(`<h3>${category.toLowerCase()} (${size}x${size})</h3>`);
	document.documentElement.style.setProperty("--puzzle__grid-size", size);

	for (const row of puzzle) {
		for (const letter of row) {
			$puzzleGrid.append(`
				<div class="puzzle__grid-cell">
					<span>${ letter }</span>
				</div>
			`);
		}
	}

	class WordManager {
		constructor(words) {
			this._words = words.map((entry, index) => ({ ...entry, found: false, color: colorList[index] }));
		}

		markAsFound(word) {
			const words = this._words.map(entry => entry.word.toLowerCase());
			const index = words.indexOf(word.toLowerCase());
			if (index < 0) return;
			this._words[index].found = true;
		}

		updateList() {
			$wordList.html("");
			for (const entry of this._words) {
				if(entry.found) {
					$wordList.append(`
						<li style="color: ${ entry.color };">
							<s>${ entry.word.toLowerCase() }</s>
						</li>
					`);
				}
				else {
					$wordList.append(`<li>${ entry.word.toLowerCase() }</li>`);
				}
			}
		}

		getCoords(word) {
			const words = this._words.map(entry => entry.word.toLowerCase());
			const index = words.indexOf(word.toLowerCase());
			if (index < 0) return;
			const { start, end, orientation } = this._words[index];
			return { start, end, orientation };
		}

		getColor(word) {
			const words = this._words.map(entry => entry.word.toLowerCase());
			const index = words.indexOf(word.toLowerCase());
			if (index < 0) return;
			return this._words[index].color;
		}

		get found() {
			return this._words.filter(entry => entry.found).map(entry => entry.word).sort();
		}

		get foundCoords() {
			return this._words.filter(entry => entry.found).map(({ start, end, orientation }) => ({ start, end, orientation }));
		}

		get notFound() {
			return this._words.filter(entry => !entry.found).map(entry => entry.word).sort();
		}

		get notFoundCoords() {
			return this._words.filter(entry => !entry.found).map(({ start, end, orientation }) => ({ start, end, orientation }));
		}

		tryCoords(start, end) {
			const [entry] = this._words.filter(entry => entry.start.x === start.x && entry.start.y === start.y && entry.end.x === end.x && entry.end.y === end.y);
			if (!entry) return false;
			this.markAsFound(entry.word);
			this.updateList();
			return true;
		}
	}
	const wordManagerInstance = new WordManager(solution.found);
	wordManagerInstance.updateList();

	showPuzzle();
	initCanvas({ puzzle, size, category, wordManager: wordManagerInstance });
});

getNewPuzzle();
