'use strict';

import { onEvent, select, selectAll } from './utils.js';

const modal = select('.modal');
const frontModal = select('.modal-front');
const backModal = select('.modal-back');
const overlay = select('.overlay');
const closeModalBtn = select('.modal-close');
const startBtn = select('#start-btn');
const countdownStart = select('#countdown-start');
const countdownMessage = select('#countdown-message');

const openFrontModal = function () {
    frontModal.classList.remove('hidden');
    backModal.classList.add('hidden');
    overlay.classList.remove('hidden');
    modal.style.display = 'flex';
};

const switchToBackModal = function () {
    frontModal.classList.add('hidden');
    backModal.classList.remove('hidden');
    modal.style.display = 'flex';
    startCountdown();
};

const closeFrontModal = function () {
    frontModal.classList.add('hidden');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
};

const closeBackModal = function () {
    backModal.classList.add('hidden');
    overlay.classList.add('hidden');
    modal.style.display = 'none';
};

const startCountdown = function () {
    let count = 3;
    countdownStart.textContent = count;

    const countdownInterval = setInterval(() => {
        count--;

        if (count > 0) {
            countdownStart.textContent = count;
        } else if (count === 0) {
            countdownStart.textContent = 'GO!';
        } else {
            clearInterval(countdownInterval);
            closeBackModal();
        }
    }, 1000);
};

onEvent('keydown', document, function (e) {
    if (e.key === 'Escape' && !frontModal.classList.contains('hidden')) {
        closeFrontModal();
    }
});

onEvent('click', overlay, closeFrontModal);
onEvent('click', closeModalBtn, closeFrontModal);
onEvent('click', startBtn, switchToBackModal);

// Initial modal display
setTimeout(() => {
    openFrontModal();
}, 100);
