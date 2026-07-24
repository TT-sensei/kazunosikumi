// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
import { problems } from './problemSets.js';

export function playCorrectSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  const osc = ctx.createOscillator();
  osc.frequency.value = 800;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function initQuizEngine(root) {
  let currentProblem = null;

  root.innerHTML = `
    <p>いろいろな問題にチャレンジします。問題は problemSets.js に追加できます。</p>
    <div class="math-card big-unit">
      <span id="quiz-type"></span>
      <strong id="quiz-question"></strong>
    </div>
    <label>答え<input id="quiz-answer" type="number" inputmode="numeric"></label>
    <div class="quiz-actions">
      <button id="quiz-check">答え合わせ</button>
      <button id="quiz-hint">ヒント</button>
      <button id="quiz-next">つぎの問題</button>
    </div>
    <div class="result" id="quiz-result">答えを入れてみよう。</div>
    <div class="hint" id="quiz-hint-box"></div>
  `;

  const type = root.querySelector('#quiz-type');
  const question = root.querySelector('#quiz-question');
  const answer = root.querySelector('#quiz-answer');
  const result = root.querySelector('#quiz-result');
  const hint = root.querySelector('#quiz-hint-box');

  function pickProblem() {
    currentProblem = problems[Math.floor(Math.random() * problems.length)];
    type.textContent = `タイプ: ${currentProblem.type}`;
    question.textContent = currentProblem.question;
    answer.value = '';
    result.textContent = '答えを入れてみよう。';
    hint.textContent = '';
    answer.focus();
  }

  root.querySelector('#quiz-check').addEventListener('click', () => {
    if (Number(answer.value) === currentProblem.answer) {
      result.textContent = '正解！よくできました。';
      playCorrectSound();
    } else {
      result.textContent = 'もう一度考えてみよう。ヒントも使えるよ。';
    }
  });

  root.querySelector('#quiz-hint').addEventListener('click', () => {
    hint.textContent = currentProblem.hint;
  });

  root.querySelector('#quiz-next').addEventListener('click', pickProblem);
  pickProblem();
}
