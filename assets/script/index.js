'use strict';

import { onEvent, select } from './utils.js';
import { Score } from './Score.js';

const modal = select('.modal');
const frontModal = select('.modal-front');
const backModal = select('.modal-back');
const overlay = select('.overlay');
const closeModalBtn = select('.modal-close');
const startBtn = select('#start-btn');
const countdownStart = select('#countdown-start');

let words;
let currentWordIndex;
let correctWordCount;
let countdownInterval;

const openStartModal = function () {
    frontModal.classList.remove('hidden');
    backModal.classList.add('hidden');
    overlay.classList.remove('hidden');
    modal.style.display = 'flex';
};

const switchToGameModal = function () {
    frontModal.classList.add('hidden');
    backModal.classList.remove('hidden');
    modal.style.display = 'flex';
    startModalCountdown();
};

const closeStartModal = function () {
    frontModal.classList.add('hidden');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
};

const closeGameModal = function () {
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
            closeGameModal();
            startGame();
        }
    }, 1000);
};

let timerInterval;
let remainingSeconds;

const updateTimer = function () {
    remainingSeconds--;

    if (remainingSeconds >= 0) {
        select('#timer').textContent = remainingSeconds;
    } else {
        clearInterval(timerInterval);
        endGame();
    }
};

const startTimer = function () {
    remainingSeconds = 99;
    select('#timer').textContent = remainingSeconds;

    timerInterval = setInterval(updateTimer, 1000);
};

const startGame = function () {
    words = [
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

    currentWordIndex = 0;
    correctWordCount = 0;

    displayCurrentWord();
    startTimer();
};

const displayCurrentWord = function () {
    const wordOutput = select('#word-output');
    wordOutput.textContent = words[currentWordIndex];
};

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

        // Clear the input field
        select('#tap-touche').value = '';
    }
};

const endGame = function () {
    clearInterval(countdownInterval);
    const remainingSeconds = select('#timer').textContent;
    const score = new Score(new Date(), correctWordCount, (correctWordCount / words.length) * 100);
};

onEvent('keydown', document, function (e) {
    if (e.key === 'Escape' && !frontModal.classList.contains('hidden')) {
        closeStartModal();
    }
});

onEvent('click', overlay, closeStartModal);
onEvent('click', closeModalBtn, closeStartModal);
onEvent('click', startBtn, switchToGameModal);
onEvent('input', select('#tap-touche'), checkUserInput);

// Initial modal display
setTimeout(() => {
    openStartModal();
}, 100);
