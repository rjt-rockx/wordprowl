var socket = io.connect();

function getNewPuzzle() {
    let puzzleTitle = document.getElementById('puzzle__title');
    puzzleTitle.innerHTML = '';

    let puzzleGrid = document.getElementById('puzzle__grid');
    puzzleGrid.innerHTML = '';

    let wordList = document.getElementById('word__list');
    wordList.innerHTML = '';

    let puzzleLoadingSpinner = document.getElementById('puzzle__loading-spinner');
    puzzleLoadingSpinner.classList.remove('puzzle__loading-spinner--hidden');

    socket.emit('getNewPuzzle');
}

socket.on('createPuzzle', function (data) {
    console.log(data);

    let puzzleTitle = document.getElementById('puzzle__title');
    let puzzleGrid = document.getElementById('puzzle__grid');
    let wordList = document.getElementById('word__list');

    let puzzleLoadingSpinner = document.getElementById('puzzle__loading-spinner');
    puzzleLoadingSpinner.classList.remove('puzzle__loading-spinner--hidden');

    puzzleTitle.innerHTML = '<h3>' + data.category.toLowerCase() + '</h3>';

    document.documentElement.style.setProperty('--puzzle__grid-size', data.size);

    let puzzle = data.puzzle;
    for(let i = 0; i < puzzle.length; i++) {
        for(let j = 0; j < puzzle[i].length; j++) {
            let puzzleGridCell = document.createElement('div');
            puzzleGridCell.classList.add('puzzle__grid-cell');

            let span = document.createElement('span');
            span.innerHTML = puzzle[i][j];

            puzzleGridCell.appendChild(span);
            puzzleGrid.appendChild(puzzleGridCell);
        }
    }

    let words = data.words;
    for(let i = 0; i < words.length; i++) {
        let wordListItem = document.createElement('li');
        wordListItem.innerHTML = words[i].toLowerCase();

        wordList.appendChild(wordListItem);
    }

    puzzleLoadingSpinner.classList.add('puzzle__loading-spinner--hidden');
});

getNewPuzzle();

