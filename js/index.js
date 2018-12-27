const socket = io.connect();

function getNewPuzzle() {
	hidePuzzle();
	emptyPuzzle();
	clearSelectionCanvas();
	clearHighlightCanvas();
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

function initSelection({ size, wordManager }) {
	const $selectionCanvas = $("#puzzle__sl-canvas");
	const selectionCanvas = $selectionCanvas.get(0);
	const selectionCtx = selectionCanvas.getContext("2d");
	
	const $highlightCanvas = $("#puzzle__hl-canvas");
	const highlightCanvas = $highlightCanvas.get(0);
	const highlightCtx = highlightCanvas.getContext("2d");

	selectionCanvas.width = $("#puzzle__grid").width();
	selectionCanvas.height = $("#puzzle__grid").height();

	highlightCanvas.width = $("#puzzle__grid").width();
	highlightCanvas.height = $("#puzzle__grid").height();

	Object.assign(selectionCtx, {
		lineWidth: Math.floor(300 / size),
		lineCap: "round",
		strokeStyle: "#ffffff",
		globalAlpha: 0.2
	});

	Object.assign(highlightCtx, {
		lineWidth: Math.floor(300 / size),
		lineCap: "round",
		strokeStyle: "#ff0000",
		globalAlpha: 0.2
	});

	const puzzleCellSide = selectionCanvas.width / size;

	let start = { x: 0, y: 0 }, end = { x: 0, y: 0 };

	$selectionCanvas.mousedown(event => {
		let position = getMousePosition(selectionCanvas, event);
		start = {
			x: Math.floor(position.x / puzzleCellSide),
			y: Math.floor(position.y / puzzleCellSide)
		};

		$selectionCanvas.mousemove(event => {
			selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
			selectionCtx.beginPath();

			selectionCtx.moveTo(
				start.x * puzzleCellSide + puzzleCellSide / 2,
				start.y * puzzleCellSide + puzzleCellSide / 2
			);

			position = getMousePosition(selectionCanvas, event);

			selectionCtx.lineTo(
				puzzleCellSide * (Math.floor(position.x / puzzleCellSide) + 0.5),
				puzzleCellSide * (Math.floor(position.y / puzzleCellSide) + 0.5)
			);

			selectionCtx.stroke();
		});
	});

	$selectionCanvas.mouseup(event => {
		const position = getMousePosition(selectionCanvas, event);
		end = {
			x: Math.floor(position.x / puzzleCellSide),
			y: Math.floor(position.y / puzzleCellSide)
		};

		if (start.x == end.x && start.y == end.y)
			selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
		
		entry = wordManager.tryCoords(start, end);
		if (entry) {
			console.log(entry);
			highlightCtx.strokeStyle = entry.color;
			highlightCtx.beginPath();
			highlightCtx.moveTo(
				start.x * puzzleCellSide + puzzleCellSide / 2,
				start.y * puzzleCellSide + puzzleCellSide / 2
			);

			highlightCtx.lineTo(
				end.x * puzzleCellSide + puzzleCellSide / 2,
				end.y * puzzleCellSide + puzzleCellSide / 2
			);

			highlightCtx.stroke();

			selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
		}
		else
			setTimeout(() => selectionCtx.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height), 250);

		$selectionCanvas.unbind("mousemove");
	});
}

function clearSelectionCanvas() {
	const $selectionCanvas = $("#puzzle__sl-canvas");
	const selectionCanvas = $selectionCanvas.get(0);
	selectionCanvas
		.getContext("2d")
		.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
	$selectionCanvas.off();
}

function clearHighlightCanvas() {
	const $highlightCanvas = $("#puzzle__hl-canvas");
	const highlightCanvas = $highlightCanvas.get(0);
	highlightCanvas
		.getContext("2d")
		.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
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
			const [entry] = this._words.filter(entry => entry.start.x === start.x && entry.start.y === start.y && entry.end.x === end.x && entry.end.y === end.y && !entry.found);
			if (!entry) return undefined;
			this.markAsFound(entry.word);
			this.updateList();
			return entry;
		}
	}
	const wordManagerInstance = new WordManager(solution.found);
	wordManagerInstance.updateList();

	showPuzzle();
	initSelection({ puzzle, size, category, wordManager: wordManagerInstance });
});

getNewPuzzle();
