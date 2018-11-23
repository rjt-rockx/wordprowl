var puzzleGrid = document.getElementById('puzzle__grid');

for(var i=0; i < 100; i++) {
    let puzzleCell = document.createElement('div');
    puzzleCell.setAttribute('class', 'puzzle__cell');

    let span = document.createElement('span');
    span.appendChild(
        document.createTextNode(String.fromCharCode(65 + i%26))
    );

    puzzleCell.append(span);
    puzzleGrid.append(puzzleCell);
}
