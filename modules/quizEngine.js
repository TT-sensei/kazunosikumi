// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
import { generateProblems, levelSettings } from './problemSets.js';

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
  let currentIndex = 0;
  let currentLevel = 1;
  let problems = generateProblems(currentLevel);
  let correctCount = 0;
  const answered = new Set();

  root.innerHTML = `
    <p class="quiz-lead">メイン練習です。毎回ちがう数で、0・境目・位のずれをしっかり練習します。</p>
    <div class="quiz-toolbar">
      <label>学年レベル
        <select id="quiz-level">
          <option value="1">レベル1（小2：1000〜10000）</option>
          <option value="2">レベル2（小3：万〜1億）</option>
        </select>
      </label>
      <button id="quiz-regenerate">新しい20問</button>
    </div>
    <div class="progress" id="quiz-progress"></div>
    <div class="math-card big-unit quiz-card">
      <span id="quiz-type"></span>
      <strong id="quiz-question"></strong>
      <small id="quiz-difficulty"></small>
    </div>
    <label>答え<input id="quiz-answer" type="text" autocomplete="off" placeholder="数字・漢字・>・<で答えよう"></label>
    <div class="quiz-actions">
      <button id="quiz-check">答え合わせ</button>
      <button id="quiz-hint">ヒント</button>
      <button id="quiz-prev">前の問題</button>
      <button id="quiz-next">つぎの問題</button>
    </div>
    <div class="result" id="quiz-result">答えを入れてみよう。</div>
    <div class="hint" id="quiz-hint-box"></div>
    <details class="answer-list"><summary>先生向け：答え一覧</summary><ol id="quiz-answers"></ol></details>
  `;

  const level = root.querySelector('#quiz-level');
  const type = root.querySelector('#quiz-type');
  const question = root.querySelector('#quiz-question');
  const difficulty = root.querySelector('#quiz-difficulty');
  const answer = root.querySelector('#quiz-answer');
  const result = root.querySelector('#quiz-result');
  const hint = root.querySelector('#quiz-hint-box');
  const progress = root.querySelector('#quiz-progress');
  const answers = root.querySelector('#quiz-answers');

  function normalize(value) {
    return String(value).replaceAll(',', '').replaceAll('，', '').trim();
  }

  function renderAnswers() {
    answers.innerHTML = problems.map((problem) => `<li>${problem.id}. ${problem.answer}</li>`).join('');
  }

  function renderProblem() {
    const currentProblem = problems[currentIndex];
    type.textContent = `${levelSettings[currentLevel].label} / ${currentProblem.type}`;
    question.textContent = `${currentProblem.id}. ${currentProblem.question}`;
    difficulty.textContent = `難しさ：${currentProblem.difficulty}`;
    progress.textContent = `問題 ${currentIndex + 1} / ${problems.length}　正解 ${correctCount}問`;
    answer.value = '';
    result.textContent = '答えを入れてみよう。';
    hint.textContent = '';
    answer.focus();
  }

  function resetSet() {
    problems = generateProblems(currentLevel);
    currentIndex = 0;
    correctCount = 0;
    answered.clear();
    renderAnswers();
    renderProblem();
  }

  root.querySelector('#quiz-check').addEventListener('click', () => {
    const currentProblem = problems[currentIndex];
    if (normalize(answer.value) === normalize(currentProblem.answer)) {
      result.textContent = '正解！位をよく見られたね。';
      if (!answered.has(currentProblem.id)) {
        answered.add(currentProblem.id);
        correctCount += 1;
      }
      progress.textContent = `問題 ${currentIndex + 1} / ${problems.length}　正解 ${correctCount}問`;
      playCorrectSound();
    } else {
      result.textContent = 'もう一度考えてみよう。0の位や、何倍かを見直そう。';
    }
  });

  root.querySelector('#quiz-hint').addEventListener('click', () => {
    hint.textContent = problems[currentIndex].hint;
  });

  root.querySelector('#quiz-next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % problems.length;
    renderProblem();
  });

  root.querySelector('#quiz-prev').addEventListener('click', () => {
    currentIndex = (currentIndex + problems.length - 1) % problems.length;
    renderProblem();
  });

  root.querySelector('#quiz-regenerate').addEventListener('click', resetSet);
  level.addEventListener('change', () => {
    currentLevel = Number(level.value);
    resetSet();
  });

  resetSet();
}
