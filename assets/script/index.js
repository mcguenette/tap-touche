'use strict';

import { onEvent, select } from './utils.js';

// DOM elements
const dialog = select('dialog');
const frontModal = select('.modal-front');
const backModal = select('.modal-back');
const startButton = select('#start-btn');
const countdownStart = select('#countdown-start');
const guessCard = select('.guess-card');
const buttonWrapper = select('.button-wrapper');
const timer = select('#timer');
const playAgain = select('#play-again');
const viewScores = select('#view-scores');
const wordInput = select('#type-dunk');
const wordCount = select('#word-count span');
const scoreCard = select('.score-card');
const gameDate = select('#game-date');
const gameScore = select('#game-score');
const toggleSidebar = select('#toggle-sidebar');
const highScoreSidebar = select('#high-scores');
const sidebarToggle = select('#toggle-sidebar span');

// Music
const backgroundMusic = select('#game-music');
const correctWordSound = select('#word-sound');

// Game variables
const MAX_HIGH_SCORES = 20;
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

// High score functions

function today(date) {
  return date instanceof Date ? date : new Date();
}
function generateHighScore(hits, percentage, date) {
  return { hits, percentage, date: today(date) };
}

function getHighScores() {
  const highScoresJSON = localStorage.getItem('highScores');
  return highScoresJSON ? JSON.parse(highScoresJSON) : [];
}

function saveHighScores(highScores, score) {
  const existingScoreIndex = highScores.findIndex(existingScore => 
    existingScore.hits === score.hits && existingScore.percentage === score.percentage
  );
  if (existingScoreIndex !== -1) {
    highScores[existingScoreIndex] = score;
  } else {
    highScores.push(score);
  }

  highScores.sort((a, b) => scoreCheck(b, 'hits', 0) - scoreCheck(a, 'hits', 0));
  highScores.splice(MAX_HIGH_SCORES);
  localStorage.setItem('highScores', JSON.stringify(highScores));
}


function displayHighScores() {
  const highScoresDiv = select('#high-scores ul');
  const highScores = getHighScores();
  let filteredScores = [];

  highScoresDiv.innerHTML = '';
  filteredScores = highScores.filter(score => score && score.hits > 0);

  if (filteredScores.length > 0) {
    const topScores = filteredScores
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    for (let i = 0; i < topScores.length; i++) {
      const score = topScores[i];
      const listItem = document.createElement('li');
      listItem.textContent = `${formatDate(score.date)}: ${score.hits} hits (${score.percentage.toFixed(2)}%)`;
      highScoresDiv.appendChild(listItem);
    }
  } else {
    const noScoresMessage = document.createElement('li');
    noScoresMessage.textContent = 'No games played';
    highScoresDiv.appendChild(noScoresMessage);
  }

  const highScoreSidebar = select('#high-scores');
  highScoreSidebar.style.display = highScoreSidebar.classList.contains('open') ? 'block' : 'none';
}



// Modal functions
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

// Timer functions
function updateTimer() {
  remainingSeconds--;

  if (remainingSeconds >= 0) {
    timer.textContent = remainingSeconds;

    if (remainingSeconds <= 10) {
      timer.style.backgroundColor = 'rgb(255 60 91)';
    }
  } else {
    timer.style.backgroundColor = '#61cce5';
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
    backgroundMusic.volume = 0.4;
    backgroundMusic.play();
  }
  timerInterval = setInterval(updateTimer, 1000);
}

// Helper functions
function scoreCheck(obj, prop, defaultValue = null) {
  return obj && obj[prop] !== undefined && obj[prop] !== null ? obj[prop] : defaultValue;
}

// Game functions
function startGame() {
  currentWordIndex = 0;
  correctWordCount = 0;
  wordCount.textContent = correctWordCount;
  playAgain.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset';
  buttonWrapper.style.justifyContent = 'center';
  viewScores.style.display = 'none';
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
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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
  viewScores.style.display = 'inline-block';
  wordInput.value = '';
  const hits = correctWordCount;
  const percentage = (hits / words.length) * 100;
  timer.style.backgroundColor = 'rgb(255 60 91)';

  if (hits > 0) {
    const score = generateHighScore(hits, percentage, new Date());

    const highScores = getHighScores();
    highScores.push(score);
      highScores.sort((a, b) => scoreCheck(a, 'percentage', 0) - scoreCheck(b, 'percentage', 0));
    saveHighScores(highScores, score);
    wordInput.setAttribute('disabled', true);
    showEndGame(score);
  } else {
    showEndGame();
  }
}

function showEndGame(score) {
  scoreCard.classList.remove('hidden');
  guessCard.classList.add('hidden');
  scoreCard.style.display = 'flex';
  buttonWrapper.style.justifyContent = 'space-between';

  if (score) {
    gameDate.textContent = formatDate(score.date ? score.date : today());
    gameScore.textContent = `${score.hits} hits (${score.percentage.toFixed(2)}%)`;
  } else {
    gameDate.textContent = formatDate(today());
    gameScore.textContent = 'No score';
  }
}


function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Sidebar toggle
toggleSidebar.addEventListener('click', () => {
  highScoreSidebar.classList.toggle('open');
  updateToggle();
});

function updateToggle() {
  const sidebarIsOpen = highScoreSidebar.classList.contains('open');
  toggleSidebar.style.left = sidebarIsOpen ? '290px' : '25px';
  toggleSidebar.classList.toggle('fa-circle-chevron-right', !sidebarIsOpen);
  toggleSidebar.classList.toggle('fa-circle-chevron-left', sidebarIsOpen);
  toggleSidebar.style.color = sidebarIsOpen ? '#61cce5' : '#61cce5';
  sidebarToggle.style.display = sidebarIsOpen ? 'none' : 'inline';
}


function openSideBar() {
  highScoreSidebar.classList.add('open');
  updateToggle();
  displayHighScores();
}

function closeSideBar() {
  highScoreSidebar.classList.remove('open');
  updateToggle();
}



// Event listeners

// Added new one to handle clicking reset or play again
onEvent('click', playAgain, () => {
  clearInterval(countdownInterval);
  clearInterval(timerInterval);

  countdownStart.textContent = '';
  timer.textContent = '';
  timer.style.backgroundColor = '';


  frontModal.classList.add('hidden');
  backModal.classList.remove('hidden');
  scoreCard.classList.add('hidden');
  guessCard.classList.add('hidden');

  dialog.showModal();
  startModalCountdown();
  closeSideBar();
});


onEvent('click', document, () => wordInput.focus());
onEvent('click', startButton, showBackDialog);
onEvent('click', viewScores, () => {
  const sidebarIsOpen = highScoreSidebar.classList.contains('open');
  if (sidebarIsOpen) {
    closeSideBar();
  } else {
    openSideBar();
  }
});

onEvent('input', wordInput, checkUserInput);

// Load modal right away
setTimeout(() => {
  dialog.showModal();
}, 100);
