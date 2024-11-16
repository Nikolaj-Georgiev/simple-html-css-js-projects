'use strict'

const message = document.querySelector('.message')
const score = document.querySelector('.score');
const h1 = document.querySelector('h1');
const number = document.querySelector('.number');
const body = document.querySelector('body');


export const displayMessage = function (msg) {
  message.textContent = msg;
};

export const displayTitle = function (titl) {
  h1.textContent = titl;
};

export const displayNumber = function (n) {
  number.textContent = n;
};

export const displayScore = function (scr) {
  score.textContent = scr;
};

export const bodyBackground = function (color) {
  body.style.backgroundColor = color;
};

export const numberWidth = (width) => {
  number.style.width = width;
};