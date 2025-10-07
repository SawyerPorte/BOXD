let dailyBox = {};
//let wordsList = [];
const maxGuesses = 5;
let guessCount = 0;
let words = [];

const grid = document.getElementById("grid");
const guessesList = document.getElementById("guesses");

let currentGuess = [];
let cells = [];

// Map grid positions
const gridMap = {
    top: [0, 1, 2, 3, 4],
    left: [0, 5, 10, 15, 20],
    right: [4, 9, 14, 19, 24],
    bottom: [20, 21, 22, 23, 24]
};

// Initialize grid
for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    // Hide center 4 squares
    if ([6, 7, 8, 11, 12, 13, 16, 17, 18].includes(i)) {
        cell.style.backgroundColor = "#222";
        cell.style.border = "none";
    }

    cell.textContent = "";
    grid.appendChild(cell);
    cells.push(cell);
}

// Current guess display
const currentGuessRow = document.createElement("div");
currentGuessRow.id = "current-guess";
grid.parentNode.insertBefore(currentGuessRow, grid);

// Load word list
async function loadWordList() {
    const res = await fetch("wordsList.json");
    words = (await res.json()).map(w => w.toUpperCase());
    console.log("Word list loaded:", words);
}
loadWordList();

// Load daily box
async function loadDailyBox() {
    const res = await fetch("https://boxd-5hg1.onrender.com/daily-box");
    dailyBox = await res.json();
    console.log("Daily Box:", dailyBox);
}
loadDailyBox();

// Update current guess display
function updateCurrentGuessDisplay() {
    currentGuessRow.innerHTML = "";
    for (let i = 0; i < 5; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = currentGuess[i] || "";
        currentGuessRow.appendChild(cell);
    }
}

// Keyboard setup
const keyboardLayout = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
];

function createKeyboard() {
    const keyboard = document.getElementById("keyboard");

    keyboardLayout.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        for (const letter of row) {
            const key = document.createElement("button");
            key.textContent = letter;
            key.classList.add("key");
            key.addEventListener("click", () => addLetter(letter));
            rowDiv.appendChild(key);
        }

        keyboard.appendChild(rowDiv);
    });

    // Control row
    const controlRow = document.createElement("div");
    controlRow.classList.add("keyboard-row");

    const backKey = document.createElement("button");
    backKey.textContent = "⌫";
    backKey.classList.add("key", "special");
    backKey.addEventListener("click", removeLetter);

    const enterKey = document.createElement("button");
    enterKey.textContent = "ENTER";
    enterKey.classList.add("key", "special");
    enterKey.addEventListener("click", handleGuess);

    controlRow.appendChild(backKey);
    controlRow.appendChild(enterKey);
    keyboard.appendChild(controlRow);
}
createKeyboard();

function addLetter(letter) {
    if (currentGuess.length < 5) {
        currentGuess.push(letter);
        updateCurrentGuessDisplay();
    }
}

function removeLetter() {
    currentGuess.pop();
    updateCurrentGuessDisplay();
}

// Handle guesses
function handleGuess() {
    if (currentGuess.length !== 5) {
        alert("Guess must be 5 letters!");
        return;
    }

    const guess = currentGuess.join("").toUpperCase();

    if (!words.includes(guess)) {
        alert("Word not in list!");
        return;
    }

    guessCount++;
    revealGuessLetters(guess);
    updateKeyboardColors(guess);
    addGuessToList(guess);

    currentGuess = [];
    updateCurrentGuessDisplay();

    if (checkWin()) {
        revealAll();
        alert("🎉 You win! All words revealed!");
        disableKeyboard();
        return;
    }

    //if (guessCount >= maxGuesses) {
    //    revealAll();
    //    alert("Game over! Check all correct letters on the grid.");
    //    disableKeyboard();
    //}
}

// Reveal letters in the grid
function revealGuessLetters(guess) {
    ["top", "left", "right", "bottom"].forEach(pos => {
        const word = dailyBox[pos];
        for (let i = 0; i < 5; i++) {
            const index = gridMap[pos][i];
            const letter = word[i];

            if (guess[i] === letter) {
                cells[index].textContent = letter;
                cells[index].style.backgroundColor = "green";
            } else if (guess.includes(letter)) {
                cells[index].textContent = letter;
                cells[index].style.backgroundColor = "goldenrod";
            }
        }
    });
}

// Add guess to list
function addGuessToList(guess) {
    const li = document.createElement("li");
    li.textContent = guess;
    guessesList.appendChild(li);
}

// Check win
function checkWin() {
    return ["top", "left", "right", "bottom"].every(pos => {
        return cells[gridMap[pos][0]].textContent === dailyBox[pos][0] &&
            cells[gridMap[pos][1]].textContent === dailyBox[pos][1] &&
            cells[gridMap[pos][2]].textContent === dailyBox[pos][2] &&
            cells[gridMap[pos][3]].textContent === dailyBox[pos][3] &&
            cells[gridMap[pos][4]].textContent === dailyBox[pos][4];
    });
}

// Reveal all words
function revealAll() {
    ["top", "left", "right", "bottom"].forEach(pos => {
        const word = dailyBox[pos];
        for (let i = 0; i < 5; i++) {
            const index = gridMap[pos][i];
            cells[index].textContent = word[i];
            cells[index].style.backgroundColor = "green";
        }
    });
}

// Disable keyboard
function disableKeyboard() {
    document.querySelectorAll(".key").forEach(k => k.disabled = true);
}

// Color the keyboard based on guess
function updateKeyboardColors(guess) {
    guess.split("").forEach(letter => {
        const key = [...document.querySelectorAll(".key")].find(k => k.textContent === letter);
        if (!key) return;

        let correct = false;
        let exists = false;

        ["top", "left", "right", "bottom"].forEach(pos => {
            const word = dailyBox[pos];
            for (let i = 0; i < 5; i++) {
                if (word[i] === letter) {
                    exists = true;
                    if (guess[i] === word[i]) correct = true;
                }
            }
        });

        if (correct) key.style.backgroundColor = "green";
        else if (exists) key.style.backgroundColor = "goldenrod";
        else key.style.backgroundColor = "#555";
    });
}

