'use strict';

import { onEvent, select } from './utils.js';
import { Score } from './Score.js';

const modal = select('.modal');
const frontModal = select('.modal-front');
const backModal = select('.modal-back');
const overlay = select('.overlay');
const startBtn = select('#start-btn');
const countdownStart = select('#countdown-start');
const guessCard = select('.guess-card');
const timer = select('#timer');
const playAgain = select('#play-again');
const wordInput = select('#tap-touche');
const wordCount = select('#word-count span');
const scoreCard = select('.score-card');
const gameDate = select('#game-date');
const gameScore = select('#game-score');

//music
const backgroundMusic = select('#game-music');
const correctWordSound = select('#word-sound');

let currentWordIndex = 0;
let correctWordCount = 0;
let countdownInterval;
let timerInterval;
let remainingSeconds;
let usedWords = []; // could not finish this part in time, should have
                    // completed it when creating shuffle.
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

// Modal Functions
function showDefaultModal() {
  showFrontModal();
}

function showFrontModal() {
  frontModal.classList.remove('hidden');
  backModal.classList.add('hidden');
  overlay.classList.remove('hidden');
  modal.style.display = 'flex';
}

function showBackModal() {
  frontModal.classList.add('hidden');
  backModal.classList.remove('hidden');
  modal.style.display = 'flex';
  startModalCountdown();
}

function closeModal() {
  frontModal.classList.add('hidden');
  backModal.classList.add('hidden');
  overlay.classList.add('hidden');
  modal.style.display = 'none';
}

function startModalCountdown() {
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
      closeModal();
      startGame();
    }
  }, 1000);
}

// Timer Functions
function updateTimer() {
  remainingSeconds--;

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
}

function startGameTimer() {
  remainingSeconds = 99; 
  timer.textContent = remainingSeconds;
  backgroundMusic.play();
  timerInterval = setInterval(updateTimer, 1000);
}

// Game Functions
function startGame() {
  currentWordIndex = 0;
  correctWordCount = 0;
  wordCount.textContent = correctWordCount;
  playAgain.style.visibility = 'hidden';
  scoreCard.style.display = 'none';
  wordInput.removeAttribute('disabled');

  displayCurrentWord();
  displayInput();
  startGameTimer();
}

function displayCurrentWord() {
  const wordOutput = select('#word-output');
  const shuffledWords = shuffleArray(words);

  wordOutput.textContent = shuffledWords[currentWordIndex];
}

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function showPlayAgain() {
  playAgain.style.visibility = 'visible';
  wordInput.value = '';
}

function displayInput() {
  guessCard.style.display = 'flex';
  guessCard.style.backgroundColor = 'rgb(240 80 51 / 80%)';
}

function checkUserInput() {
    const userInput = wordInput.value.toLowerCase().trim();
    const currentWord = words[currentWordIndex].toLowerCase();
  
    if (userInput === currentWord) {
      correctWordCount++;
      correctWordSound.play();
      if (currentWordIndex < words.length - 1) {
        currentWordIndex++;
      } else {
        endGame();
        return;
      }
  
      displayCurrentWord();
  
      wordInput.value = '';
      wordCount.textContent = correctWordCount;
    }
  }
  

function endGame() {
  clearInterval(countdownInterval);
  backgroundMusic.pause();

  const hits = correctWordCount;
  const percentage = (hits / words.length) * 100;

  const score = new Score(new Date(), hits, percentage);
  wordInput.setAttribute('disabled', true);
  showEndGame(score);
}

function showEndGame(score) {
  scoreCard.classList.remove('hidden');
  guessCard.classList.add('hidden');
  scoreCard.style.display = 'flex';
  gameDate.textContent = formatDate(score.date);
  gameScore.textContent = `${score.hits} hits (${score.percentage.toFixed(2)}%)`;
}

function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Event Listeners
onEvent('keydown', document, function (e) {
  if (e.key === 'Escape' && !frontModal.classList.contains('hidden')) {
    closeModal();
  }
});

onEvent('click', overlay, closeModal);
onEvent('click', startBtn, showBackModal);
onEvent('click', playAgain, startGame);
onEvent('input', wordInput, checkUserInput);

// Load modal right away
setTimeout(showDefaultModal, 100);
