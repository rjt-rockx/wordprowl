var puzzleGrid = document.getElementById('puzzle__grid');

for(var i=0; i < 100; i++) {
    let puzzleGridCell = document.createElement('div');
    puzzleGridCell.setAttribute('class', 'puzzle__grid-cell');

    let span = document.createElement('span');
    span.appendChild(
        document.createTextNode(String.fromCharCode(65 + i%26))
    );

    puzzleGridCell.append(span);
    puzzleGrid.append(puzzleGridCell);
}
