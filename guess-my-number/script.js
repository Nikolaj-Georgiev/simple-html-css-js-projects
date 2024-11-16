'use strict';

import { bodyBackground, displayMessage, displayNumber, displayScore, displayTitle, numberWidth } from "./utils.js";

const highScore = document.querySelector('.highscore');
const guessField = document.querySelector('.guess');

let secretNumber = Math.trunc(Math.random() * 20) + 1;
let highScoreCount = 0;
let scoreCount = 20; //state variable;

const gameOver = function () {
  scoreCount = 0;
  displayScore(scoreCount);
  displayMessage('💥 You lost the game!');
  displayTitle('GAME OVER!');
  bodyBackground('#682579');
  displayNumber('💀');
};

document.querySelector('.check').addEventListener('click', function () {

  const guess = Number(guessField.value);

  // when there is no input
  if (!guess) {
    displayMessage('⛔ No number!');

    // when player wins
  } else if (guess === secretNumber) {
    displayMessage('🎉 Correct Number!');
    displayTitle('YOU WIN!');
    bodyBackground('#60b347');
    displayNumber(secretNumber);
    numberWidth('30rem');
    if (scoreCount > highScoreCount) {
      highScoreCount = scoreCount;
      highScore.textContent = highScoreCount;
      displayNumber('🏆');
      numberWidth('15rem');
    }
    // highScoreCount = scoreCount > highScoreCount ? scoreCount : highScoreCount;
    // highScore.textContent = highScoreCount;

    // when player is wrong
  } else if (guess !== secretNumber) {
    if (scoreCount > 1) {
      displayMessage(guess > secretNumber ? '📈 Too high!' : '📉 Too low!');
      scoreCount--;
      displayScore(scoreCount);
    } else {
      gameOver();
    }
  }
});

document.querySelector('.again').addEventListener('click', () => {
  bodyBackground('#222');
  displayNumber('?');
  scoreCount = 20;
  displayScore(scoreCount);
  secretNumber = Math.trunc(Math.random() * 20) + 1;
  guessField.value = '';
  numberWidth('15rem');
  displayMessage('Start guessing...');
  displayTitle('Guess My Number!');
});


