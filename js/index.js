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

function initCanvas({ size, found }) {
	const canvas = document.getElementById("puzzle__canvas");
	const ctx = canvas.getContext("2d");
	ctx.strokeStyle = "#ff0000";
	Object.assign(canvas, {
		width: $("#puzzle__grid").width(),
		height: $("#puzzle__grid").height()
	});
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
		for (const wordEntry of found)
			if (wordEntry.start.x === start.x && wordEntry.start.y === start.y)
				if (wordEntry.end.x === end.x && wordEntry.end.y === end.y)
					console.log(`${wordEntry.word} found between [${start.x},${start.y}] and [${end.x},${end.y}]`);
		$("#puzzle__canvas").unbind("mousemove");
		setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 2500);
	});
}

function resetCanvas() {
	const canvas = $("#puzzle__canvas").get(0);
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	$("#puzzle__canvas").off();
}

socket.on("createPuzzle", ({ puzzle, size, category, words, solution }) => {
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
	for (const word of words) {
		const wordListItem = document.createElement("li");
		wordListItem.innerHTML = word.toLowerCase();
		wordList.appendChild(wordListItem);
	}
	showPuzzle();
	initCanvas({ puzzle, size, category, words, found: solution.found });
});

getNewPuzzle();
