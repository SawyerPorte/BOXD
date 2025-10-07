let dailyBox = {};

const maxGuesses = 26; // optional, can be set to 26 letters
let guessCount = 0;
let words = [];
let guessedLetters = []; // add this at the top with other variables
const grid = document.getElementById("grid");
const guessesList = document.getElementById("guesses");
const keyboard = document.getElementById("keyboard")

let currentLetter = "";
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

// Single-letter current guess display
const letterBox = document.createElement("div");
letterBox.id = "current-letter";
letterBox.className = "cell";
grid.parentNode.insertBefore(letterBox, keyboard);

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

// Update the single-letter box
function updateCurrentLetterDisplay() {
    letterBox.textContent = currentLetter;
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
// Add letter
function addLetter(letter) {
    currentLetter = letter.toUpperCase();
    updateCurrentLetterDisplay();
}
// Remove letter
function removeLetter() {
    currentLetter = "";
    updateCurrentLetterDisplay();
}

// Handle guess
function handleGuess() {
    if (!currentLetter) {
        alert("Please select a letter!");
        return;
    }

    guessCount++;
    revealGuessLetter(currentLetter);
    updateKeyboardColors(currentLetter);
    addGuessToList(currentLetter);

    currentLetter = "";
    updateCurrentLetterDisplay();

    if (checkWin()) {
        revealAll();
        alert("🎉 You win! All words revealed!");
        disableKeyboard();
        return;
    }

    if (guessCount >= maxGuesses) {
        revealAll();
        alert("Game over! Check all correct letters on the grid.");
        disableKeyboard();
    }
}
// Reveal letter in the grid
function revealGuessLetter(letter) {
    ["top", "left", "right", "bottom"].forEach(pos => {
        const word = dailyBox[pos];
        for (let i = 0; i < 5; i++) {
            const index = gridMap[pos][i];
            const wordLetter = word[i];

            if (wordLetter === letter) {
                cells[index].textContent = wordLetter;
                cells[index].style.backgroundColor = "green";
            }
            // Do NOT reveal letters that are in the word but not guessed
        }
    });
}



// Replace your old addGuessToList function with this:
function addGuessToList(letter) {
    guessedLetters.push(letter); // store guessed letters
    guessesList.textContent = guessedLetters.join(", "); // show letters horizontally with commas
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
//Reveal all words
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

// Keyboard color
function updateKeyboardColors(letter) {
    const key = [...document.querySelectorAll(".key")].find(k => k.textContent === letter);
    if (!key) return;

    let correct = false;

    ["top", "left", "right", "bottom"].forEach(pos => {
        const word = dailyBox[pos];
        for (let i = 0; i < 5; i++) {
            if (word[i] === letter) correct = true;
        }
    });

    key.style.backgroundColor = correct ? "green" : "#555";
}
