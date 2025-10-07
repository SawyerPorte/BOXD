

let dailyBox = {};
let wordsList = [];
const maxGuesses = 5;
let guessCount = 0;
let words = [];

const grid = document.getElementById("grid");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const guessesList = document.getElementById("guesses");




async function loadWordList() {
    const res = await fetch("wordsList.json"); // must be in same folder
    words = (await res.json()).map(word => word.toUpperCase());
    console.log("Word list loaded:", words);
}
loadWordList();
// Map grid positions
const gridMap = {
    top: [0, 1, 2, 3, 4],
    left: [0, 5, 10, 15, 20],
    right: [4, 9, 14, 19, 24],
    bottom: [20, 21, 22, 23, 24]
};

let cells = [];

// Initialize grid
for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    // Hide center 4 squares
    if ([6, 7, 8, 11, 12,13,16,17,18].includes(i)) {
        cell.style.backgroundColor = "#222"; // same as body
        cell.style.border = "none";
    }

    cell.textContent = "";
    grid.appendChild(cell);
    cells.push(cell);
}

// Load daily box and word list from backend
async function loadDailyBox() {
    // Fetch the daily box from your backend
    const res = await fetch("https://boxd-5hg1.onrender.com/daily-box");
    dailyBox = await res.json();
    console.log("Daily Box:", dailyBox);

    //// Fetch the word list from your backend
    //const wordsRes = await fetch("https://boxd-5hg1.onrender.com/words.json");
    //wordsList = await wordsRes.json();
    //wordsList = wordsList.map(w => w.toUpperCase());
}

loadDailyBox();

function checkWin() {
    return ["top", "left", "right", "bottom"].every(pos => {
        return cells[gridMap[pos][0]].textContent === dailyBox[pos][0] &&
            cells[gridMap[pos][1]].textContent === dailyBox[pos][1] &&
            cells[gridMap[pos][2]].textContent === dailyBox[pos][2] &&
            cells[gridMap[pos][3]].textContent === dailyBox[pos][3] &&
            cells[gridMap[pos][4]].textContent === dailyBox[pos][4];
    });
}


guessBtn.addEventListener("click", handleGuess);

// Add listener for Enter key
guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleGuess();
    }
});
// Handle guesses
function handleGuess() {
    const guess = guessInput.value.toUpperCase();
    
    if (guess.length !== 5) {
        alert("Guess must be 5 letters!");
        return;
    }

    if (!words.includes(guess)) {
        alert("Word not in list!");
        return;
    }

    guessCount++;
    revealGuessLetters(guess);

    // Add guess to list
    const li = document.createElement("li");
    li.textContent = guess;
    guessesList.appendChild(li);

    guessInput.value = "";

    if (checkWin()) {
        
        revealAll();
        alert("🎉 You win! All words revealed!");
        guessInput.disabled = true;
        guessBtn.disabled = true;
        return;
    }

    if (guessCount >= maxGuesses) {
        guessInput.disabled = true;
        guessBtn.disabled = true;
        revealAll();
        alert("Game over! Check all correct letters on the grid.");
    }
}



function revealGuessLetters(guess) {
    // For each box word, reveal letters that match the guess
    ["top", "left", "right", "bottom"].forEach(position => {
        const word = dailyBox[position];
        for (let i = 0; i < 5; i++) {
            if (guess.includes(word[i])) {
                const index = gridMap[position][i];
                cells[index].textContent = word[i];
            }
        }
    });
}

function revealAll() {
    ["top", "left", "right", "bottom"].forEach(position => {
        const word = dailyBox[position];
        for (let i = 0; i < 5; i++) {
            const index = gridMap[position][i];
            cells[index].textContent = word[i];
        }
    });
}
