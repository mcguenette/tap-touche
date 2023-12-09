'use strict';

import { onEvent, select } from './utils.js';

// DOM elements
const dialog = select('dialog');
const frontModal = select('.modal-front');
const backModal = select('.modal-back');
const startButton = select('#start-btn');
const countdownStart = select('#countdown-start');
const guessCard = select('.guess-card');
const timer = select('#timer');
const playAgain = select('#play-again');
const viewScores = select('#view-scores');
const wordInput = select('#type-dunk');
const wordCount = select('#word-count span');
const scoreCard = select('.score-card');
const gameDate = select('#game-date');
const gameScore = select('#game-score');

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
function generateHighScore(hits, percentage, date) {
  return { hits, percentage, date };
}

function getHighScores() {
  const highScoresJSON = localStorage.getItem('highScores');
  console.log(highScoresJSON);
  return highScoresJSON ? JSON.parse(highScoresJSON) : [];
}

function saveHighScores(highScores) {
  highScores.sort((a, b) => a.hits - b.hits);
  const topScores = highScores.slice(0, MAX_HIGH_SCORES);
  localStorage.setItem('highScores', JSON.stringify(topScores));
}


function displayHighScores() {
  const highScoresDiv = select('#high-scores ul');
  const highScores = getHighScores();
  highScoresDiv.innerHTML = '';

  const filteredScores = highScores.filter(score => score.hits > 0);

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
    // Add a message for no scores if the array is empty
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
    backgroundMusic.play();
  }
  timerInterval = setInterval(updateTimer, 1000);
}

// Game functions
function startGame() {
  currentWordIndex = 0;
  correctWordCount = 0;
  wordCount.textContent = correctWordCount;
  playAgain.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Reset';
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

  // Only save the score if the user has scored points
  if (hits > 0) {
    const score = generateHighScore(hits, percentage, new Date());

    const highScores = getHighScores();
    highScores.push(score);
    highScores.sort((a, b) => a.percentage - b.percentage);
    saveHighScores(highScores);

    wordInput.setAttribute('disabled', true);
    showEndGame(score);
  } else {
    // If no points were scored, you might want to display a message or take appropriate action
    console.log('No points scored. Game over.');
  }
}



function showEndGame(score) {
  scoreCard.classList.remove('hidden');
  guessCard.classList.add('hidden');
  scoreCard.style.display = 'flex';
  gameDate.textContent = formatDate(score.date);
  gameScore.textContent = `${score.hits} hits (${score.percentage.toFixed(2)}%)`;
}

function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Sidebar toggle
const toggleSidebar = select('#toggle-sidebar');
const highScoreSidebar = select('#high-scores');

toggleSidebar.addEventListener('click', () => {
  highScoreSidebar.classList.toggle('open');
  updateToggleArrow();
});

function updateToggleArrow() {
  const isOpen = highScoreSidebar.classList.contains('open');
  toggleSidebar.style.left = isOpen ? '290px' : '25px';
  toggleSidebar.classList.toggle('fa-circle-chevron-right', !isOpen);
  toggleSidebar.classList.toggle('fa-circle-chevron-left', isOpen);
  displayHighScores();
}

function openSideBar() {
  highScoreSidebar.classList.toggle('open');
  updateToggleArrow();
}

function closeSideBar() {
  highScoreSidebar.classList.remove('open');
  updateToggleArrow();
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
onEvent('click', viewScores, openSideBar);
onEvent('input', wordInput, checkUserInput);

// Load modal right away
setTimeout(() => dialog.showModal(), 100);
displayHighScores();
