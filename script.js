const board = document.getElementById("board");
const moveDisplay = document.getElementById("moveCount");
const resetButton = document.getElementById("resetButton");
const winMessage = document.getElementById("winMessage");
const bestScoreDisplay = document.getElementById("bestScore");
const minMovesDisplay = document.getElementById("minMoves");
const gamesPlayedDisplay = document.getElementById("gamesPlayed");

let stats = JSON.parse(localStorage.getItem("knightTourStats")) || {
    gamesPlayed: 0,
    bestScore: 0,
    minMovesToWin: null
};

function saveStats() {
    localStorage.setItem("knightTourStats", JSON.stringify(stats));
}

function updateStatsDisplay() {
    bestScoreDisplay.textContent = stats.bestScore;
    minMovesDisplay.textContent = stats.minMovesToWin !== null ? stats.minMovesToWin : "-";
    gamesPlayedDisplay.textContent = stats.gamesPlayed;
}

updateStatsDisplay();

let knightPosition = { row: 0, col: 0 };
const visitedSquares = new Set();
let moveCount = 0;
let confettiInterval = null; // track running confetti so it can be cleared

function createBoard() {
    board.innerHTML = "";

    // ensure the current square is always tracked as visited
    visitedSquares.add(`${knightPosition.row},${knightPosition.col}`);

    const legalMoves = getKnightMoves(knightPosition);

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const square = document.createElement("div");
            square.classList.add("square");

            // Alternate colors
            if ((row + col) % 2 === 0) {
                square.classList.add("white");
            } else {
                square.classList.add("black");
            }

            const key = `${row},${col}`;
            square.dataset.row = row;
            square.dataset.col = col;

            // Highlight visited
            if (visitedSquares.has(key)) {
                square.classList.add("visited");
            }

            // Show knight
            if (row === knightPosition.row && col === knightPosition.col) {
                square.textContent = "♞";
                visitedSquares.add(key);
            }

            // Highlight legal moves in blue
            if (legalMoves.some(pos => pos.row === row && pos.col === col)) {
                square.classList.add("legal");
            }

            // Click to move
            square.addEventListener("click", () => {
                const clickedRow = parseInt(square.dataset.row);
                const clickedCol = parseInt(square.dataset.col);
                const clickedKey = `${clickedRow},${clickedCol}`;

                if (isValidKnightMove(knightPosition, { row: clickedRow, col: clickedCol }) &&
                    !visitedSquares.has(clickedKey)) {
                    knightPosition = { row: clickedRow, col: clickedCol };
                    moveCount++;
                    moveDisplay.textContent = moveCount;

                    visitedSquares.add(`${clickedRow},${clickedCol}`);
                    if (visitedSquares.size > stats.bestScore) {
                        stats.bestScore = visitedSquares.size;
                        saveStats();
                        updateStatsDisplay();
                    }

                    //Check win condition

                    if (visitedSquares.size === 25) {
                        winMessage.textContent = "🎉 You completed the Knight's Tour!";

                        // restart animation
                        winMessage.style.animation = "none"; // clear animation
                        winMessage.offsetHeight;             // force reflow
                        winMessage.style.animation = "pop 1s ease-in-out";   // re-enable


                        // 🎊 Confetti for 3 seconds
                        const duration = 3 * 1000; // 3 seconds
                        const end = Date.now() + duration;

                        // clear any running confetti loop before starting a new one
                        if (confettiInterval) {
                            clearInterval(confettiInterval);
                        }

                        confettiInterval = setInterval(() => {
                            if (Date.now() > end) {
                                clearInterval(confettiInterval);
                                confettiInterval = null;
                                return;
                            }

                            confetti({
                                particleCount: 50,
                                spread: 70,
                                origin: { x: Math.random(), y: Math.random() * 0.5 }
                            });
                        }, 250);

                        if (stats.minMovesToWin === null || moveCount < stats.minMovesToWin) {
                            stats.minMovesToWin = moveCount;
                            saveStats();
                            updateStatsDisplay();
                        }
                    }

                    createBoard();
                }
            });

            board.appendChild(square);
        }
    }
}

resetButton.addEventListener("click", () => {
    startNewGame();
});

// Check if a move is a valid knight move
function isValidKnightMove(from, to) {
    const dx = Math.abs(from.row - to.row);
    const dy = Math.abs(from.col - to.col);
    return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
}

// Get all valid moves from current knight position
function getKnightMoves(pos) {
    const moves = [
        { row: pos.row + 2, col: pos.col + 1 },
        { row: pos.row + 2, col: pos.col - 1 },
        { row: pos.row - 2, col: pos.col + 1 },
        { row: pos.row - 2, col: pos.col - 1 },
        { row: pos.row + 1, col: pos.col + 2 },
        { row: pos.row + 1, col: pos.col - 2 },
        { row: pos.row - 1, col: pos.col + 2 },
        { row: pos.row - 1, col: pos.col - 2 }
    ];

    // Remove out-of-bounds moves
    return moves.filter(m => m.row >= 0 && m.row < 5 && m.col >= 0 && m.col < 5 &&
        !visitedSquares.has(`${m.row},${m.col}`) //exclude visited squares
    );
}

function startNewGame() {
    knightPosition = { row: 0, col: 0 };
    moveCount = 0;
    visitedSquares.clear();
    moveDisplay.textContent = moveCount;
    winMessage.textContent = "";

    // stop any running confetti animation when resetting
    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }
    winMessage.style.animation = "none"; // clear animation
    winMessage.offsetHeight;             // force reflow
    winMessage.style.animation = null;   // re-enable animation

    stats.gamesPlayed++;
    saveStats();
    updateStatsDisplay();

    createBoard();
}
startNewGame();
