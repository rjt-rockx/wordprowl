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
});

getNewPuzzle();
