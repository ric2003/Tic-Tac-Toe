document.addEventListener('DOMContentLoaded', () => {
    const toggleDarkModeButton = document.getElementById('toggleDarkMode');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    const restartButton = document.getElementById('restartButton');

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

    const handleNameInput = (inputElement, defaultName) => {
        inputElement.addEventListener('focus', () => {
            if (inputElement.value === defaultName) {
                inputElement.value = "";
            }
        });

        inputElement.addEventListener('blur', () => {
            if (inputElement.value.trim() === "") {
                inputElement.value = defaultName;
            }
            gameController.updatePlayerNames(player1NameInput.value, player2NameInput.value);
        });

        inputElement.addEventListener('input', () => {
            if (inputElement.value.trim() !== "") {
                gameController.updatePlayerNames(player1NameInput.value, player2NameInput.value);
            }
        });
    };

    handleNameInput(player1NameInput, "Player 1");
    handleNameInput(player2NameInput, "Player 2");

    restartButton.addEventListener('click', () => {
        gameController.startGame();
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
        let player1 = player("Player 1", "X");
        let player2 = player("Player 2", "O");
        let gameOver = false;
        let playerTurn = 0;

        const startGame = () => {
            gameOver = false;
            GameBoard.resetBoard();
            displayController.renderBoard();
            displayController.updateScore(player1.getScore(), player2.getScore());
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
                    displayController.showMessage(`${getCurrentPlayerName()} wins!`);
                    displayController.renderBoard();
                    displayController.updateScore(player1.getScore(), player2.getScore());
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
            const winningPattern = winPatterns.find(pattern =>
                pattern.every(index => board[index] === getCurrentPlayerMark())
            );
        
            if (winningPattern) {
                winningPattern.forEach(index => {
                    const cell = document.querySelector(`.cell[data-index="${index}"]`);
                    cell.classList.add('winner');
                    
                    // Remove the class when the animation ends
                    cell.addEventListener('animationend', () => {
                        cell.classList.remove('winner');
                    }, { once: true });
                });
                return true;
            }
            return false;
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

        const updatePlayerNames = (name1, name2) => {
            if (name1) player1 = player(name1, "X");
            if (name2) player2 = player(name2, "O");
            displayController.updatePlayerNames(player1.getName(), player2.getName());
        };

        return { startGame, makeMove, updatePlayerNames };
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

        const updateScore = (scoreP1, scoreP2) => {
            const player1Score = scoreBoard.querySelector('div:nth-child(1) p');
            const player2Score = scoreBoard.querySelector('div:nth-child(2) p');

            player1Score.textContent = scoreP1;
            player2Score.textContent = scoreP2;
        };

        const updatePlayerNames = (name1, name2) => {
            const player1Text = scoreBoard.querySelector('div:nth-child(1) h1 input');
            const player2Text = scoreBoard.querySelector('div:nth-child(2) h1 input');

            player1Text.value = name1;
            player2Text.value = name2;
        };

        return { renderBoard, updateScore, showMessage, updatePlayerNames };
    })();


    gameController.startGame();
});
