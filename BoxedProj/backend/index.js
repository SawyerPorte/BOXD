const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();

app.use(cors());


// Serve all frontend files
app.use(express.static(path.join(__dirname, "public")));

// Catch-all to serve index.html for any unknown route (for client-side routing)
//app.get("/*", (req, res) => {
//    res.sendFile(path.join(__dirname, "public", "index.html"));
//});


// ---- WORD GENERATION LOGIC ----
//let words = JSON.parse(fs.readFileSync('./words.json', 'utf8')).map(w => w.toUpperCase());
// Use __dirname to get the path of the current file (index.js)
const wordsPath = path.join(__dirname, 'words.json');
let words = JSON.parse(fs.readFileSync(wordsPath, 'utf8')).map(w => w.toUpperCase());


function filterByStart(words, letter) {
    return words.filter(w => w[0] === letter);
}
function filterByEnd(words, letter) {
    return words.filter(w => w[w.length - 1] === letter);
}
function filterByStartEnd(words, start, end) {
    return words.filter(w => w[0] === start && w[w.length - 1] === end);
}

function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function getDailySeed() {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}
function pickRandomFromList(list, seed) {
    if (list.length === 0) return null;
    const index = Math.floor(seededRandom(seed) * list.length);
    return list[index];
}

function generateWordBox(firstPick, firstWord, words, seed) {
    firstWord = firstWord.toUpperCase();
    let top, left, right, bottom;

    switch (firstPick) {
        case 'top':
            top = firstWord;
            left = pickRandomFromList(filterByStart(words, top[0]), seed + 1);
            right = pickRandomFromList(filterByStart(words, top[4]), seed + 2);
            bottom = pickRandomFromList(filterByStartEnd(words, left?.[4], right?.[4]), seed + 3);
            break;
        case 'left':
            left = firstWord;
            top = pickRandomFromList(filterByStart(words, left[0]), seed + 1);
            bottom = pickRandomFromList(filterByStart(words, left[4]), seed + 2);
            right = pickRandomFromList(filterByStartEnd(words, top?.[4], bottom?.[4]), seed + 3);
            break;
        case 'right':
            right = firstWord;
            top = pickRandomFromList(filterByEnd(words, right[0]), seed + 1);
            bottom = pickRandomFromList(filterByEnd(words, right[4]), seed + 2);
            left = pickRandomFromList(filterByStartEnd(words, top?.[0], bottom?.[0]), seed + 3);
            break;
        case 'bottom':
            bottom = firstWord;
            left = pickRandomFromList(filterByEnd(words, bottom[0]), seed + 1);
            right = pickRandomFromList(filterByEnd(words, bottom[4]), seed + 2);
            top = pickRandomFromList(filterByStartEnd(words, left?.[0], right?.[0]), seed + 3);
            break;
    }

    if (!top || !left || !right || !bottom) {
        return generateWordBox(firstPick, firstWord, words, seed + 10);
    }
    return { top, left, right, bottom };
}

// ---- ROUTE ----
app.get('/daily-box', (req, res) => {
    const dailySeed = getDailySeed();
    const picks = ['top', 'left', 'right', 'bottom'];
    const firstPick = pickRandomFromList(picks, dailySeed);
    const firstWord = pickRandomFromList(words, dailySeed + 1);
    const box = generateWordBox(firstPick, firstWord, words, dailySeed + 2);
    res.json(box);
});



// ---- START SERVER ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

