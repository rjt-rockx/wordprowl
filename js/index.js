const socket = io.connect();

function getNewPuzzle() {
	hidePuzzle();
	emptyPuzzle();
	resetCanvas();
	socket.emit("getNewPuzzle");
}

function hidePuzzle() {
	document.getElementById("puzzle__loading-spinner").classList.remove("puzzle__loading-spinner--hidden");
}

function emptyPuzzle() {
	for (const element of ["puzzle__title", "puzzle__grid", "word__list"])
		document.getElementById(element).innerHTML = "";
}

function showPuzzle() {
	document.getElementById("puzzle__loading-spinner").classList.add("puzzle__loading-spinner--hidden");
}

function getMousePosition(canvas, event) {
	const boundingRectangle = canvas.getBoundingClientRect();
	return {
		x: event.clientX - boundingRectangle.left,
		y: event.clientY - boundingRectangle.top
	};
}

function initCanvas({ size, wordManager }) {
	const canvas = document.getElementById("puzzle__canvas");
	const ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#ff0000";
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
				strokeStyle: "rgba(255, 255, 255, 0.08)"
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
		else setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 250);
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
	const puzzleTitle = document.getElementById("puzzle__title");
	const puzzleGrid = document.getElementById("puzzle__grid");
	const wordList = document.getElementById("word__list");
	const puzzleLoadingSpinner = document.getElementById("puzzle__loading-spinner");
	puzzleLoadingSpinner.classList.remove("puzzle__loading-spinner--hidden");
	puzzleTitle.innerHTML = `<h3>${category.toLowerCase()} (${size}x${size})</h3>`;
	document.documentElement.style.setProperty("--puzzle__grid-size", size);
	for (const row of puzzle) {
		for (const letter of row) {
			const puzzleGridCell = document.createElement("div");
			puzzleGridCell.classList.add("puzzle__grid-cell");
			const span = document.createElement("span");
			span.innerHTML = letter;
			puzzleGridCell.appendChild(span);
			puzzleGrid.appendChild(puzzleGridCell);
		}
	}
	class wordManager {
		constructor(words) {
			this._words = words.map(entry => ({ ...entry, found: false }));
		}

		found(word) {
			const words = this._words.map(entry => entry.word.toLowerCase());
			const index = words.indexOf(word.toLowerCase());
			if (index < 0) return;
			this._words[index].found = true;
		}

		updateList() {
			wordList.innerHTML = "";
			for (const entry of this._words) {
				const wordListItem = document.createElement("li");
				wordListItem.innerHTML = entry.found ? `<s>${entry.word.toLowerCase()}</s>` : entry.word.toLowerCase();
				wordList.appendChild(wordListItem);
			}
		}

		find(word) {
			const words = this._words.map(entry => entry.word.toLowerCase());
			const index = words.indexOf(word.toLowerCase());
			if (index < 0) return;
			const { start, end, orientation } = this._words[index];
			return { start, end, orientation };
		}

		tryCoords(start, end) {
			const [entry] = this._words.filter(entry => entry.start.x === start.x && entry.start.y === start.y && entry.end.x === end.x && entry.end.y === end.y);
			if (!entry) return false;
			this.found(entry.word);
			this.updateList();
			return true;
		}
	}
	const wordManagerInstance = new wordManager(solution.found);
	wordManagerInstance.updateList();
	showPuzzle();
	initCanvas({ puzzle, size, category, wordManager: wordManagerInstance });
});

getNewPuzzle();
