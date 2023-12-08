'use strict';

import { onEvent, select } from './utils.js';

const dialog = select('dialog');
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

// Music
const backgroundMusic = select('#game-music');
const correctWordSound = select('#word-sound');

let currentWordIndex = 0;
let correctWordCount = 0;
let countdownInterval;
let timerInterval;
let remainingSeconds;
let usedWords = [];
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

// Function to generate high score object
function generateHighScore(hits, percentage, date) {
  return {
    hits,
    percentage,
    date,
  };
}

// Function to get high scores from localStorage
function getHighScores() {
  const highScoresJSON = localStorage.getItem('highScores');
  return highScoresJSON ? JSON.parse(highScoresJSON) : [];
}

// Function to save high scores to localStorage
function saveHighScores(highScores) {
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function displayHighScores() {
  const highScoresContainer = select('#high-scores ul');
  const highScores = getHighScores();

  highScoresContainer.innerHTML = '';

  const topScores = highScores.slice(0, 5);

  for (let i = 0; i < topScores.length; i++) {
    const score = topScores[i];
    const listItem = document.createElement('li');
    listItem.textContent = `${formatDate(score.date)}: ${score.hits} hits (${score.percentage.toFixed(2)}%)`;
    highScoresContainer.appendChild(listItem);
  }

  // Update the display based on whether the sidebar is open
  const highScoreSidebar = select('#high-scores');
  if (highScoreSidebar.classList.contains('open')) {
    highScoreSidebar.style.display = 'block';
  } else {
    highScoreSidebar.style.display = 'none';
  }
}



function showBackDialog() {
  frontModal.classList.add('hidden');
  backModal.classList.remove('hidden');
  startModalCountdown();
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
      dialog.close();
      startGame();
    }
  }, 1000);
}

function updateTimer() {
  remainingSeconds--;

  if (remainingSeconds >= 0) {
    timer.textContent = remainingSeconds;

    if (remainingSeconds <= 10) {
      timer.style.backgroundColor = 'rgb(255 60 91)';
    }
  } else {
    clearInterval(timerInterval);
    endGame();
  }
}

function startGameTimer() {
  remainingSeconds = 20;
  timer.textContent = remainingSeconds;
  wordInput.focus();
  if (backgroundMusic.paused) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
  }
  timerInterval = setInterval(updateTimer, 1000);
}

function startGame() {
  currentWordIndex = 0;
  correctWordCount = 0;
  wordCount.textContent = correctWordCount;
  playAgain.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset';
  scoreCard.style.display = 'none';
  wordInput.removeAttribute('disabled');
  wordInput.focus();

  clearInterval(timerInterval);
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

function displayInput() {
  guessCard.style.display = 'flex';
  guessCard.style.backgroundColor = 'rgb(143 70 233 / 80%)';
  wordInput.focus();
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
  playAgain.innerHTML = ' <i class="fa-solid fa-rotate-left"></i> Play again';
  wordInput.value = '';
  const hits = correctWordCount;
  const percentage = (hits / words.length) * 100;

  const score = generateHighScore(hits, percentage, new Date());
  wordInput.setAttribute('disabled', true);

  const highScores = getHighScores();
  highScores.push(score);
  highScores.sort((a, b) => b.percentage - a.percentage);
  saveHighScores(highScores);

  showEndGame(score);
}

function showEndGame(score) {
  scoreCard.classList.remove('hidden');
  guessCard.classList.add('hidden');
  scoreCard.style.display = 'flex';
  gameDate.textContent = formatDate(score.date);
  // Display the updated high scores in the sidebar
  gameScore.textContent = `${score.hits} hits (${score.percentage.toFixed(2)}%)`;
}

function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

const toggleSidebar = document.getElementById('toggle-sidebar');
const highScoreSidebar = document.getElementById('high-scores');

toggleSidebar.addEventListener('click', () => {
  highScoreSidebar.classList.toggle('open');
  updateToggleArrow();
});

function updateToggleArrow() {
  const isOpen = highScoreSidebar.classList.contains('open');
  toggleSidebar.style.left = isOpen ? '290px' : '10px';
  toggleSidebar.classList.toggle('fa-circle-chevron-right', !isOpen);
  toggleSidebar.classList.toggle('fa-circle-chevron-left', isOpen);
  displayHighScores();
}
// Added always focus on input - feedback
onEvent('click', document, () => {
  wordInput.focus();
});

onEvent('click', startBtn, showBackDialog);
onEvent('click', playAgain, startGame);
onEvent('input', wordInput, checkUserInput);

// Load modal right away
setTimeout(() => dialog.showModal(), 100);
displayHighScores();
