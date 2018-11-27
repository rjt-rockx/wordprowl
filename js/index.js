var socket = io.connect();

function getNewPuzzle() {
    socket.emit('getNewPuzzle');
}

socket.on('createPuzzle', function (data) {
    console.log(data);

    let puzzleTitle = document.getElementById('puzzle__title');
    puzzleTitle.innerHTML = '<h3>' + data.category + '</h3>';

    document.documentElement.style.setProperty('--puzzle__grid-size', data.size);

    let puzzle = data.puzzle;
    let puzzleGrid = document.getElementById('puzzle__grid');
    puzzleGrid.innerHTML = '';
    for(let i = 0; i < puzzle.length; i++) {
        for(let j = 0; j < puzzle[i].length; j++) {
            let puzzleGridCell = document.createElement('div');
            puzzleGridCell.setAttribute('class', 'puzzle__grid-cell');

            let span = document.createElement('span');
            span.innerHTML = puzzle[i][j];

            puzzleGridCell.appendChild(span);
            puzzleGrid.appendChild(puzzleGridCell);
        }
    }

    let words = data.words;
    let wordList = document.getElementById('word__list');
    wordList.innerHTML = '';
    for(let i = 0; i < words.length; i++) {
        let wordListItem = document.createElement('li');
        wordListItem.innerHTML = words[i];

        wordList.appendChild(wordListItem);
    }
});

getNewPuzzle();

