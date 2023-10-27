//*----------------------
//* FASE DI PREPARAZIONE
//*----------------------

// Raccogliamo tutti gli elementi di nostro interesse dalla pagina
const grid = document.querySelector('.grid');
const scoreCounter = document.querySelector('.score-counter');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainButton = document.querySelector('.play-again');

// Creiamo la matrice per la nostra griglia
const gridMatrix = [
    ['', '', '', '', '', '', '', '', ''],
    ['river', 'wood', 'wood', 'river', 'wood', 'river', 'river', 'river', 'river'],
    ['river', 'river', 'river', 'wood', 'wood', 'river', 'wood', 'wood', 'river'],
    ['', '', '', '', '', '', '', '', ''],
    ['road', 'bus', 'road', 'road', 'road', 'car', 'road', 'road', 'road'],
    ['road', 'road', 'road', 'car', 'road', 'road', 'road', 'road', 'bus'],
    ['road', 'road', 'car', 'road', 'road', 'road', 'bus', 'road', 'road'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
];

// Preparo informazioni utili alla logica di gioco
const victoryRow = 0;
const riverRows = [1, 2];
const roadRows = [4, 5, 6];
const duckPosition = {
    y: 8,
    x: 4,
};
let contentBeforeDuck = '';
let time = 15;
let isGameOver = false;

/* ----------------------
FUNZIONI DI GIOCO
---------------------- */

function applyCellStyle(cell, rowIndex, cellIndex) {
    const isRowEven = rowIndex % 2 === 0;
    const isCellEven = cellIndex % 2 === 0;
    if ((isRowEven && isCellEven) || (!isRowEven && !isCellEven)) {
        cell.classList.add('cell-dark')
    }
}

// Funzione che disegna la griglia
function drawGrid() {
    grid.innerHTML = '';
    gridMatrix.forEach(function (rowCells, rowIndex) {
        rowCells.forEach(function (cellContent, cellIndex) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (cellContent !== '') cell.classList.add(cellContent);

            if (riverRows.includes(rowIndex)) {
                cell.classList.add('river');
            } else if (roadRows.includes(rowIndex)) {
                cell.classList.add('road');
            } else {
                applyCellStyle(cell, rowIndex, cellIndex);
            }
            grid.append(cell);
        })
    })
}

function placeDuck() {
    contentBeforeDuck = gridMatrix[duckPosition.y][duckPosition.x];
    gridMatrix[duckPosition.y][duckPosition.x] = 'duck';
}

function moveDuck(event) {
    gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;
    switch (event.key) {
        case 'ArrowUp':
            if (duckPosition.y > 0) duckPosition.y--;
            break;
        case 'ArrowDown':
            if (duckPosition.y < 8) duckPosition.y++;
            break;
        case 'ArrowLeft':
            if (duckPosition.x > 0) duckPosition.x--;
            break;
        case 'ArrowRight':
            if (duckPosition.x < 8) duckPosition.x++;
            break;
    }
    drawElements();
}

function drawElements() {
    placeDuck();
    checkDuckPosition();
    drawGrid();
}

function endGame(reason) {
    if (reason === 'duck-arrived') {
        endGameScreen.classList.add('win');
        endGameText.innerHTML = 'YOU<br>WON';
    }
    clearInterval(renderingLoop);
    clearInterval(countdown);
    document.removeEventListener('keyup', moveDuck);
    gridMatrix[duckPosition.y][duckPosition.x] = reason;
    endGameScreen.classList.remove('hidden');

    playAgainButton.focus();

    isGameOver = true;
}

function checkDuckPosition() {
    if (duckPosition.y === victoryRow) {
        endGame('duck-arrived');
    }
    else if (contentBeforeDuck === 'river') {
        endGame('duck-drowned');
    }
    else if (contentBeforeDuck === 'bus' || contentBeforeDuck === 'car') {
        endGame('duck-hit');
    }
}

function moveRow(rowIndex) {
    const rowCells = gridMatrix[rowIndex];

    const lastCell = rowCells.pop();
    rowCells.unshift(lastCell);
}

function moveRowBack(rowIndex) {
    const rowCells = gridMatrix[rowIndex];

    const firstCell = rowCells.shift();
    rowCells.push(firstCell);
}

function handleDuckPosition() {
    gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;
    if (contentBeforeDuck === 'wood') {
        if (duckPosition.y === 1 && duckPosition.x < 8) {
            duckPosition.x++;
        } else if (duckPosition.y === 2 && duckPosition.x > 0) {
            duckPosition.x--;
        }
    }
    contentBeforeDuck = gridMatrix[duckPosition.y][duckPosition.x];
}

function reduceTime() {
    time--;
    scoreCounter.innerText = String(time).padStart(5, 0);
    if (time === 0) {
        endGame('time-up');
    }
}

/* ----------------------
SVOLGIMENTO DEL GIOCO
---------------------- */

const renderingLoop = setInterval(function () {
    handleDuckPosition();
    moveRow(1);
    moveRowBack(2);
    moveRow(4);
    moveRow(5);
    moveRow(6);
    drawElements();
}, 1000);

const countdown = setInterval(reduceTime, 1000);

/* ----------------------
EVENTI DEL GIOCO
---------------------- */
// Evento per ascoltare la pressione dei tasti
document.addEventListener('keyup', moveDuck);

// Evento per ascoltare il click sul bottone rigioca
playAgainButton.addEventListener('click', function () {
    window.location.reload();
});

// Evento per terminare la partita
document.addEventListener('keyup', function (event) {
    if (event === ' ' && isGameOver) {
        window.location.reload();
    }
});