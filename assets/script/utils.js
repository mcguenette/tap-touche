'use strict';

// Add event listener
function onEvent(event, selector, callback) {
    return selector.addEventListener(event, callback);
}

// Select HTML element by selector
function select(selector, parent = document) {
    return parent.querySelector(selector);
}

// Get a (node) list of HTML elements
function selectAll(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}

export { onEvent, select, selectAll };