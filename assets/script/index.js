'use strict';

import { onEvent, select } from './utils.js';
import { Score } from './Score.js';

const modal = select('.modal');
const frontModal = select('.modal-front');
const backModal = select('.modal-back');
const overlay = select('.overlay');
const startBtn = select('#start-btn');
const countdownStart = select('#countdown-start');
const guessContainer = select('.guess-card');
const timer = select('#timer');
const playAgain = select('#play-again');

// Game variables
const words = [
    'dinosaur', 'love', 'pineapple', 'calendar', 'robot', 'building',
    'population', 'weather', 'bottle', 'history', 'dream', 'character', 'money',
    'absolute', 'discipline', 'machine', 'accurate', 'connection', 'rainbow',
    'bicycle', 'eclipse', 'calculator', 'trouble', 'watermelon', 'developer',
    'philosophy', 'database', 'periodic', 'capitalism', 'abominable',
    'component', 'future', 'pasta', 'microwave', 'jungle', 'wallet', 'canada',
    'coffee', 'beauty', 'agency', 'chocolate', 'eleven', 'technology', 'promise',
    'alphabet', 'knowledge', 'magician', 'professor', 'triangle', 'earthquake',
    'baseball', 'beyond', 'evolution', 'banana', 'perfume', 'computer',
    'management', 'discovery', 'ambition', 'music', 'eagle', 'crown', 'chess',
    'laptop', 'bedroom', 'delivery', 'enemy', 'button', 'superman', 'library',
    'unboxing', 'bookstore', 'language', 'homework', 'fantastic', 'economy',
    'interview', 'awesome', 'challenge', 'science', 'mystery', 'famous',
    'league', 'memory', 'leather', 'planet', 'software', 'update', 'yellow',
    'keyboard', 'window', 'beans', 'truck', 'sheep', 'band', 'level', 'hope',
    'download', 'blue', 'actor', 'desk', 'watch', 'giraffe', 'brazil', 'mask',
    'audio', 'school', 'detective', 'hero', 'progress', 'winter', 'passion',
    'rebel', 'amber', 'jacket', 'article', 'paradox', 'social', 'resort', 'escape'
];

let currentWordIndex = 0;
let correctWordCount = 0;
let countdownInterval;
let timerInterval;
let remainingSeconds;

// Modal 
const defaultModal = function () {
    frontModal.classList.remove('hidden');
    backModal.classList.add('hidden');
    overlay.classList.remove('hidden');
    modal.style.display = 'flex';
};

const switchModal = function () {
    frontModal.classList.add('hidden');
    backModal.classList.remove('hidden');
    modal.style.display = 'flex';
    startModalCountdown();
};

const closeDefaultModal = function () {
    frontModal.classList.add('hidden');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
};

const closeBackModal = function () {
    backModal.classList.add('hidden');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
};

const startModalCountdown = function () {
    let count = 3;
    countdownStart.textContent = count;

    countdownInterval = setInterval(() => {
        count--;

        if (count > 0) {
            countdownStart.textContent = count;
        } else if (count === 0) {
            countdownStart.textContent = 'GO!';
        } else {
            clearInterval(countdownInterval);
            closeBackModal();
            startGame();
        }
    }, 1000);
};

// Timer 
const updateTimer = function () {
    remainingSeconds--;
    // tried to use guard clause here but did not work as expected.
    if (remainingSeconds >= 0) {
        timer.textContent = remainingSeconds;
    if (remainingSeconds <= 10) {
        timer.style.backgroundColor = '#db2806';
    }
    } else {
        clearInterval(timerInterval);
        showPlayAgain();
        endGame();
    }
};

const startGameTimer = function () {
    remainingSeconds = 99;
    timer.textContent = remainingSeconds;

    timerInterval = setInterval(updateTimer, 1000);
};

// Game 
const startGame = function () {
    currentWordIndex = 0;
    correctWordCount = 0;
    playAgain.style.visibility = 'hidden';

    displayCurrentWord();
    displayInput();
    startGameTimer();
};

const displayCurrentWord = function () {
    const wordOutput = select('#word-output');
    const shuffledWords = shuffleArray(words);

    wordOutput.textContent = shuffledWords[currentWordIndex];
};

const shuffleArray = function (array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const showPlayAgain = function () {
    playAgain.style.visibility = 'visible';
}


const displayInput = function() {
    guessContainer.style.display = 'flex';
    guessContainer.style.backgroundColor = 'rgb(240 80 51 / 80%)';
}

const checkUserInput = function () {
    const userInput = select('#tap-touche').value.toLowerCase().trim();
    const currentWord = words[currentWordIndex].toLowerCase();

    if (userInput === currentWord) {
        correctWordCount++;

        if (currentWordIndex < words.length - 1) {
            currentWordIndex++;
            displayCurrentWord();
        } else {
            endGame();
        }

        select('#tap-touche').value = '';
        select('#word-count span').textContent = correctWordCount;
    }
};

const endGame = function () {
    clearInterval(countdownInterval);
    const remainingSeconds = timer.textContent;
    const score = new Score(new Date(), correctWordCount, (correctWordCount / words.length) * 100);
};

// Events
onEvent('keydown', document, function (e) {
    if (e.key === 'Escape' && !frontModal.classList.contains('hidden')) {
        closeDefaultModal();
    }
});

onEvent('click', overlay, closeDefaultModal);
onEvent('click', startBtn, switchModal);
onEvent('click', playAgain, startGame);
onEvent('input', select('#tap-touche'), checkUserInput);

// Load modal right away
setTimeout(() => {
    defaultModal();
}, 100);
