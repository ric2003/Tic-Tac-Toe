document.addEventListener('DOMContentLoaded', () => {
    const toggleDarkModeButton = document.getElementById('toggleDarkMode');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            toggleDarkModeButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            document.documentElement.classList.remove('dark-mode');
            toggleDarkModeButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    toggleDarkModeButton.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark-mode')) {
            document.documentElement.classList.remove('dark-mode');
            toggleDarkModeButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark-mode');
            toggleDarkModeButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });
});

const GameBoard = (function() {
    let board = ["", "", "", "", "", "", "", "", ""];
    
    const getBoard = () => board;

    const makeMove = (index, mark) => {
        if (index >= 0 && index < 9 && board[index] === "") {
            board[index] = mark;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };

    return { getBoard, makeMove, resetBoard };
})();

const player = function(name, mark) {
    let score = 0;

    const getName = () => name;
    const getMark = () => mark;
    const getScore = () => score;
    const resetScore = () => score = 0;
    const addPoint = () => score++;

    return { getName, getMark, getScore, resetScore, addPoint };
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms*1000));

const gameController = (function() {
    let player1 = null;
    let player2 = null;
    let gameOver = false;
    let playerTurn = 0;
    let StartMark = 1;
    let newGame = true;

    const startGame = () => {
        if(newGame){
            player1 = player("Player 1", "X");
            player2 = player("Player 2", "O");
            newGame = false;
        }
        if(gameOver){
            if(StartMark){
                playerTurn = 0;
                StartMark = 0;
            }else{
                playerTurn = 1;
                StartMark = 1;
            }
        }else{
            if(StartMark){
                playerTurn = 1;
                StartMark = 1;
            }else{
                playerTurn = 0;
                StartMark = 0;
            }
        }
        gameOver = false;
        GameBoard.resetBoard();
        displayController.renderBoard();
        displayController.updatescore(player1.getScore(),player2.getScore());
        displayController.showMessage(`${getCurrentPlayerName()}'s turn`);
    };

    const switchPlayerTurn = () => {
        playerTurn = playerTurn === 0 ? 1 : 0;
    };

    const makeMove = async (index) => {
        if (!gameOver && GameBoard.makeMove(index, getCurrentPlayerMark())) {
            if (checkWin()) {
                gameOver = true;
                addPointToPlayerScore();
                displayController.showMessage(`${getCurrentPlayerName()} wins!`)
                displayController.renderBoard();
                displayController.updatescore(player1.getScore(),player2.getScore());
                await sleep(2);
                gameController.startGame();
            } else if (checkTie()) {
                gameOver = true;
                displayController.showMessage("It's a tie!");
                displayController.renderBoard();
                await sleep(2);
                gameController.startGame();
            } else {
                switchPlayerTurn();
                displayController.showMessage(`${getCurrentPlayerName()}'s turn`);
                displayController.renderBoard();
            }
            
        }
    };

    const checkWin = () => {
        const board = GameBoard.getBoard();
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        return winPatterns.some(pattern => 
            pattern.every(index => board[index] === getCurrentPlayerMark())
        );
    };

    const checkTie = () => {
        return GameBoard.getBoard().every(cell => cell !== "");
    };

    const getCurrentPlayerMark = () => {
        return playerTurn === 0 ? player1.getMark() : player2.getMark();
    };

    const addPointToPlayerScore = () => {
        if (playerTurn === 0) {
            player1.addPoint();
        } else {
            player2.addPoint();
        }
    };

    const getCurrentPlayerName = () => {
        return playerTurn === 0 ? player1.getName() : player2.getName();
    };

    return { startGame, makeMove };
})();

const displayController = (function() {
    const cells = document.querySelectorAll('.cell');
    const messageElement = document.getElementById('message');
    const restartButton = document.getElementById('restartButton');
    const scoreBoard = document.getElementById('scoreBoard');

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const index = cell.getAttribute('data-index');
            gameController.makeMove(index);
        });
    });

    restartButton.addEventListener('click', () => {
        gameController.startGame();
    });

    const renderBoard = () => {
        const board = GameBoard.getBoard();
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
        });
    };

    const showMessage = (message) => {
        messageElement.textContent = message;
    };
    const updatescore = (scoreP1, scoreP2) => {
        const player1Text = scoreBoard.querySelector('div:nth-child(1) h1');
        const player1Score = scoreBoard.querySelector('div:nth-child(1) p');
        const player2Text = scoreBoard.querySelector('div:nth-child(2) h1');
        const player2Score = scoreBoard.querySelector('div:nth-child(2) p');
    
        player1Text.textContent = "Player 1 (X)";
        player2Text.textContent = "Player 2 (O)";
        player1Score.textContent = scoreP1;
        player2Score.textContent = scoreP2;
    };

    return { renderBoard,updatescore, showMessage };
})();

gameController.startGame();
