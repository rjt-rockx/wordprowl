var socket = io.connect();

function getNewPuzzle() {
	hidePuzzle();
	emptyPuzzle();
	socket.emit("getNewPuzzle");
}

function hidePuzzle() {
	document.getElementById("puzzle__loading-spinner").classList.remove("puzzle__loading-spinner--hidden");
}

function emptyPuzzle() {
	for (let element of ["puzzle__title", "puzzle__grid", "word__list"])
		document.getElementById(element).innerHTML = "";
}

function showPuzzle() {
	document.getElementById("puzzle__loading-spinner").classList.add("puzzle__loading-spinner--hidden");
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function initCanvas(puzzle, size, category, words) {
    var canvas = document.getElementById('puzzle__canvas');

    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ff0000';

    canvas.width = $('#puzzle__grid').width();
    canvas.height = $('#puzzle__grid').height();
    
    puzzleCellSide = canvas.width/size;

    var startX = 0;
    var startY = 0;
    var endX = 0;
    var endY = 0;

    $('#puzzle__canvas').mousedown((evt)=>{
        let pos = getMousePos(canvas, evt);
        startX = Math.floor(pos.x/puzzleCellSide);
        startY = Math.floor(pos.y/puzzleCellSide);
        console.log({startX, startY});

    });

    $('#puzzle__canvas').mouseup((evt)=>{
        let pos = getMousePos(canvas, evt);
        endX = Math.floor(pos.x/puzzleCellSide);
        endY = Math.floor(pos.y/puzzleCellSide);
        console.log({endX, endY});
    });
}

function resetCanvas() {
    $('#puzzle__canvas').off();
}

socket.on("createPuzzle", function ({ puzzle, size, category, words }) {
	emptyPuzzle();
	let puzzleTitle = document.getElementById("puzzle__title");
	let puzzleGrid = document.getElementById("puzzle__grid");
	let wordList = document.getElementById("word__list");

	let puzzleLoadingSpinner = document.getElementById("puzzle__loading-spinner");
	puzzleLoadingSpinner.classList.remove("puzzle__loading-spinner--hidden");

	puzzleTitle.innerHTML = "<h3>" + category.toLowerCase() + "</h3>";

	document.documentElement.style.setProperty("--puzzle__grid-size", size);

	for (let row of puzzle) {
		for (let letter of row) {
			let puzzleGridCell = document.createElement("div");
			puzzleGridCell.classList.add("puzzle__grid-cell");
			let span = document.createElement("span");
			span.innerHTML = letter;
			puzzleGridCell.appendChild(span);
			puzzleGrid.appendChild(puzzleGridCell);
		}
	}
	for (let word of words) {
		let wordListItem = document.createElement("li");
		wordListItem.innerHTML = word.toLowerCase();
		wordList.appendChild(wordListItem);
	}
	showPuzzle();
    initCanvas(puzzle, size, category, words);
});

getNewPuzzle();
