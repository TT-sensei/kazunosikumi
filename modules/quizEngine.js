import { generateProblems, levelSettings, problemTypes } from './problemSets.js';
import {
  getBadgeSummary,
  getNaviSrc,
  publishNavi,
  recordQuizAnswer,
  recordQuizComplete
} from './numberParkFeatures.js';

export function playCorrectSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = ctx.currentTime;
    playNote(523.25, now, 0.12);
    playNote(659.25, now + 0.1, 0.12);
    playNote(783.99, now + 0.2, 0.25);
  } catch (error) {
    console.warn('Audio error:', error);
  }
}

function normalize(value) {
  if (value === null || value === undefined) return '';
  return String(value).replaceAll(',', '').replaceAll('，', '').replaceAll(' ', '').trim();
}

function formatNumber(value) {
  return typeof value === 'number' ? value.toLocaleString('ja-JP') : value;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[char]));
}

export function initQuizEngine(root) {
  if (!root) return;

  const state = {
    mode: 'setup',
    selectedLevel: 1,
    selectedType: null,
    problems: [],
    currentIndex: 0,
    correctCount: 0,
    answersById: {},
    userInputValue: '',
    selectedCards: [],
    availableCards: [],
    isAnswered: false,
    isCorrect: false,
    showHint: false,
    validationMessage: ''
  };

  function render() {
    if (state.mode === 'setup') {
      renderSetup();
      return;
    }
    if (state.mode === 'result') {
      renderResult();
      return;
    }
    renderQuiz();
  }

  function renderSetup() {
    const summary = getBadgeSummary();
    root.innerHTML = `
      <div class="np-quiz-wrapper np-setup-wrapper">
        <div class="np-setup-welcome">
          <img src="${getNaviSrc('sora', 'welcome')}" alt="そらが数のしくみを案内しています">
          <div>
            <span class="np-kicker">NUMBER PARK CHALLENGE</span>
            <h3>今日は、どの問題に挑戦する？</h3>
            <p>学年と問題の種類を選んでから、10問のチャレンジを始めよう。</p>
          </div>
        </div>

        <div class="np-choice-section">
          <div class="np-choice-title"><span>1</span><div><strong>学年を選ぶ</strong><small>数字の大きさに合わせて選ぼう</small></div></div>
          <div class="np-selection-grid np-level-grid">
            ${Object.entries(levelSettings).map(([level, setting]) => `
              <button class="np-selection-card ${state.selectedLevel === Number(level) ? 'is-selected' : ''}" data-level="${level}">
                <strong>レベル${level}</strong><span>${setting.label.replace(/^レベル\d（/, '（').replace(/）$/, '）')}</span>
                <i>${state.selectedLevel === Number(level) ? '✓ 選択中' : 'このレベルを選ぶ'}</i>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="np-choice-section">
          <div class="np-choice-title"><span>2</span><div><strong>問題の種類を選ぶ</strong><small>選んだ種類だけが10問出題されるよ</small></div></div>
          <div class="np-selection-grid np-type-grid">
            ${problemTypes.map(type => `
              <button class="np-selection-card np-type-card ${state.selectedType === type.id ? 'is-selected' : ''}" data-type="${type.id}" style="--type-color:${type.color}">
                <b>${type.icon}</b><strong>${type.title}</strong><span>${type.description}</span>
                <i>${state.selectedType === type.id ? '✓ 選択中' : 'この問題を選ぶ'}</i>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="np-setup-footer">
          <span class="np-collection-mini">🏅 バッジ ${summary.count} / ${summary.total} 個</span>
          <button class="np-btn np-btn-primary np-start-btn" id="np-start" ${state.selectedType ? '' : 'disabled'}>この設定で10問を始める ▶</button>
        </div>
        ${state.validationMessage ? `<p class="np-validation">${state.validationMessage}</p>` : ''}
      </div>
    `;

    root.querySelectorAll('[data-level]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedLevel = Number(button.dataset.level);
        state.validationMessage = '';
        render();
      });
    });
    root.querySelectorAll('[data-type]').forEach(button => {
      button.addEventListener('click', () => {
        state.selectedType = button.dataset.type;
        state.validationMessage = '';
        render();
      });
    });
    root.querySelector('#np-start')?.addEventListener('click', () => {
      if (!state.selectedType) {
        state.validationMessage = '問題の種類を1つ選んでね。';
        render();
        return;
      }
      startSet();
    });
  }

  function startSet() {
    state.mode = 'quiz';
    state.problems = generateProblems(state.selectedLevel, 10, state.selectedType);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answersById = {};
    state.validationMessage = '';
    loadProblem();
    publishNavi('sora', 'welcome', `${problemTypes.find(type => type.id === state.selectedType)?.title || '問題'}を10問、やってみよう！`);
  }

  function returnToSetup() {
    state.mode = 'setup';
    state.problems = [];
    state.currentIndex = 0;
    state.answersById = {};
    state.selectedType = null;
    state.validationMessage = '';
    publishNavi('sora', 'welcome', '数のしくみを見つけにいこう！');
    render();
  }

  function loadProblem() {
    state.userInputValue = '';
    state.showHint = false;
    state.validationMessage = '';
    const current = state.problems[state.currentIndex];
    const previousAnswer = current ? state.answersById[current.id] : undefined;
    state.isAnswered = previousAnswer !== undefined;
    state.isCorrect = previousAnswer === true;

    if (current?.extraData?.uiType === 'cards' && Array.isArray(current.extraData.digits)) {
      state.availableCards = [...current.extraData.digits];
      state.selectedCards = [];
    } else {
      state.availableCards = [];
      state.selectedCards = [];
    }
    render();
  }

  function checkAnswer(answerOverride) {
    if (state.isAnswered) return;
    const current = state.problems[state.currentIndex];
    const rawAnswer = answerOverride !== undefined ? answerOverride : state.userInputValue;
    if (normalize(rawAnswer) === '') {
      state.validationMessage = '答えを入力してから、答え合わせをしよう。';
      render();
      return;
    }

    state.isCorrect = normalize(rawAnswer) === normalize(current.answer);
    state.isAnswered = true;
    state.answersById[current.id] = state.isCorrect;
    state.correctCount = Object.values(state.answersById).filter(Boolean).length;
    state.validationMessage = '';
    recordQuizAnswer({ correct: state.isCorrect, type: current.type });
    if (state.isCorrect) {
      playCorrectSound();
      publishNavi('sora', 'correct', '正解！数の見方がつながったね！');
    } else {
      publishNavi('tsuki', 'retry', 'まちがいは発見のチャンス。もう一度見てみよう！');
    }
    render();
  }

  function finishSet() {
    if (Object.keys(state.answersById).length < state.problems.length) {
      state.validationMessage = '10問すべて答えてから、結果を見よう。';
      render();
      return;
    }
    recordQuizComplete({
      correctCount: state.correctCount,
      total: state.problems.length,
      type: state.selectedType,
      level: state.selectedLevel
    });
    state.mode = 'result';
    publishNavi('sora', 'complete', `${state.correctCount}問正解！10問のチャレンジ、おつかれさま！`);
    render();
  }

  function renderQuiz() {
    const current = state.problems[state.currentIndex];
    if (!current) return;
    const total = state.problems.length;
    const progressPercent = Math.round(((state.currentIndex + 1) / total) * 100);
    const typeInfo = problemTypes.find(type => type.id === state.selectedType) || problemTypes[0];
    const naviCharacter = state.isAnswered ? (state.isCorrect ? 'sora' : 'tsuki') : state.showHint ? 'kai' : 'sora';
    const naviPose = state.isAnswered ? (state.isCorrect ? 'correct' : 'retry') : state.showHint ? 'hint' : 'welcome';
    const naviMessage = state.isAnswered ? (state.isCorrect ? '正解！' : '答えを見直そう') : state.showHint ? 'ヒントを見て考えよう' : 'じっくり考えてみよう';

    root.innerHTML = `
      <div class="np-quiz-wrapper">
        <div class="np-quiz-topbar">
          <div><span class="np-kicker">${typeInfo.icon} ${typeInfo.title}</span><strong>レベル${state.selectedLevel}</strong></div>
          <div class="np-quiz-top-actions"><button class="np-small-btn" id="np-btn-setup">問題を選びなおす</button><button class="np-small-btn" id="np-btn-regen">同じ設定で新しい10問</button></div>
        </div>
        <div class="np-progress-box"><div class="np-progress-info"><span>問題 ${state.currentIndex + 1} / ${total}</span><span>⭐ 正解：${state.correctCount}問</span></div><div class="np-progress-bar"><div class="np-progress-fill" style="width:${progressPercent}%"></div></div></div>

        <div class="np-quiz-navi"><img src="${getNaviSrc(naviCharacter, naviPose)}" alt="${naviCharacter === 'sora' ? 'そら' : naviCharacter === 'tsuki' ? 'つき' : 'かい'}｜${naviMessage}"><span>${naviMessage}</span></div>
        <div class="np-card">
          <div class="np-meta"><span class="np-badge-type">${typeInfo.icon} ${current.type}</span><span class="np-badge-diff">${current.difficulty}</span></div>
          <div class="np-question-text">問${state.currentIndex + 1}. ${current.question}</div>
          ${current.extraData?.uiType === 'number-line' ? renderNumberLineGraphic(current.extraData) : ''}
          <div class="np-interactive-area">${renderInteractiveInput(current)}</div>
        </div>

        <div class="np-actions">
          <button class="np-btn np-btn-secondary" id="np-btn-prev" ${state.currentIndex === 0 ? 'disabled' : ''}>◀ 前へ</button>
          <button class="np-btn np-btn-secondary" id="np-btn-hint">💡 ヒント</button>
          <button class="np-btn np-btn-primary" id="np-btn-check" ${state.isAnswered ? 'disabled' : ''}>答え合わせ</button>
          <button class="np-btn np-btn-secondary" id="np-btn-next">${state.currentIndex === total - 1 ? '結果を見る ▶' : 'つぎへ ▶'}</button>
        </div>
        ${state.validationMessage ? `<p class="np-validation">${state.validationMessage}</p>` : ''}
        ${state.showHint ? `<div class="np-hint-box">💡 <strong>ヒント:</strong> ${current.hint}</div>` : ''}
        ${state.isAnswered ? `<div class="np-feedback ${state.isCorrect ? 'correct' : 'wrong'}">${state.isCorrect ? '🎉 正解！位や数のかさなりをよく見られたね！' : `もう一度考えてみよう。正解は「 <strong>${formatNumber(current.answer)}</strong> 」だよ。`}</div>` : ''}
      </div>
    `;
    bindEvents();
  }

  function renderResult() {
    const total = state.problems.length;
    const percent = Math.round((state.correctCount / total) * 100);
    const resultNavi = state.correctCount === total ? 'sora' : state.correctCount >= 7 ? 'tsuki' : 'kai';
    const resultPose = state.correctCount === total ? 'complete' : state.correctCount >= 7 ? 'correct' : 'hint';
    root.innerHTML = `
      <div class="np-quiz-wrapper np-result-wrapper">
        <div class="np-result-hero"><img src="${getNaviSrc(resultNavi, resultPose)}" alt="チャレンジ結果を応援するナビキャラ"><div><span class="np-kicker">CHALLENGE COMPLETE</span><h3>${state.correctCount === total ? 'パーフェクト！' : 'チャレンジ完了！'}</h3><p>選んだ「${problemTypes.find(type => type.id === state.selectedType)?.title || ''}」を10問やりきったね。</p></div></div>
        <div class="np-score"><strong>${state.correctCount}</strong><span> / ${total} 問正解</span><b>${percent}%</b></div>
        <div class="np-result-message">${state.correctCount === total ? '全部正解。数のしくみをしっかり見抜けたね！' : state.correctCount >= 7 ? 'あと少しでパーフェクト。まちがえた問題も宝物だよ。' : '挑戦したことがすばらしい。もう一度やると、きっと発見が増えるよ。'}</div>
        <div class="np-result-answers"><h3>今回のチャレンジ</h3>${state.problems.map((problem, index) => `<div><span class="${state.answersById[problem.id] ? 'is-correct' : 'is-wrong'}">${state.answersById[problem.id] ? '○' : '△'}</span><strong>問${index + 1}</strong><small>${escapeHtml(problem.type)}</small></div>`).join('')}</div>
        <div class="np-result-actions"><button class="np-btn np-btn-primary" id="np-btn-again">同じ問題をもう10問</button><button class="np-btn np-btn-secondary" id="np-btn-change">問題を選びなおす</button></div>
      </div>
    `;
    root.querySelector('#np-btn-again')?.addEventListener('click', startSet);
    root.querySelector('#np-btn-change')?.addEventListener('click', returnToSetup);
  }

  function renderNumberLineGraphic(data) {
    let ticksHtml = '';
    for (let index = 0; index <= data.tickCount; index += 1) {
      const value = data.start + data.step * index;
      const target = index === data.blank;
      ticksHtml += `<div class="np-tick-item"><div class="np-tick-mark"></div><div class="np-tick-label ${target ? 'target' : ''}">${target ? '❓ □' : formatNumber(value)}</div></div>`;
    }
    return `<div class="np-number-line"><div class="np-line-hint-banner">💡 1めもりは ${formatNumber(data.step)} ずつ 増えているよ！</div><div class="np-line-ticks">${ticksHtml}</div></div>`;
  }

  function renderInteractiveInput(problem) {
    const uiType = problem.extraData?.uiType;
    if (uiType === 'cards') {
      const slotCount = problem.extraData.digits.length;
      return `<div class="np-input-instruction">カードをタップして並べよう</div><div class="np-cards-container">${Array.from({ length: slotCount }).map((_, index) => state.selectedCards[index] !== undefined ? `<div class="np-num-card selected-slot" data-index="${index}">${state.selectedCards[index]}</div>` : '<div class="np-card-slot"></div>').join('')}</div><div class="np-cards-container">${state.availableCards.map((number, index) => `<div class="np-num-card hand-card" data-index="${index}">${number}</div>`).join('')}</div>`;
    }
    if (uiType === 'compare') {
      return `<div class="np-input-instruction">○に入る記号をえらぼう</div><div class="np-compare-buttons"><button class="np-compare-btn" data-val=">">＞</button><button class="np-compare-btn" data-val="=">＝</button><button class="np-compare-btn" data-val="<">＜</button></div>`;
    }
    const isKanji = problem.extraData?.inputMode === 'kanji';
    const keys = isKanji ? ['一', '二', '三', '四', '五', '六', '七', '八', '九', '零', '万', '千', '百', '十'] : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    return `<div class="np-input-row"><input type="text" id="np-text-input" value="${escapeHtml(state.userInputValue)}" placeholder="答えを入力..." ${state.isAnswered ? 'disabled' : ''}></div>${!state.isAnswered ? `<div class="np-keypad">${keys.map(key => `<button class="np-key-btn num-key" data-key="${key}">${key}</button>`).join('')}<button class="np-key-btn action" id="np-btn-clear">けす</button></div>` : ''}`;
  }

  function bindEvents() {
    root.querySelector('#np-btn-setup')?.addEventListener('click', returnToSetup);
    root.querySelector('#np-btn-regen')?.addEventListener('click', startSet);
    root.querySelector('#np-btn-prev')?.addEventListener('click', () => {
      if (state.currentIndex === 0) return;
      state.currentIndex -= 1;
      loadProblem();
    });
    root.querySelector('#np-btn-next')?.addEventListener('click', () => {
      if (!state.isAnswered) {
        state.validationMessage = '答え合わせをしてから、つぎへ進もう。';
        render();
        return;
      }
      if (state.currentIndex === state.problems.length - 1) finishSet();
      else {
        state.currentIndex += 1;
        loadProblem();
      }
    });
    root.querySelector('#np-btn-hint')?.addEventListener('click', () => {
      state.showHint = !state.showHint;
      publishNavi('kai', 'hint', state.showHint ? 'ヒントを見ながら考えてみよう！' : '自分の力でもう一度考えてみよう！');
      render();
    });
    root.querySelector('#np-btn-check')?.addEventListener('click', () => {
      const current = state.problems[state.currentIndex];
      checkAnswer(current.extraData?.uiType === 'cards' ? state.selectedCards.join('') : undefined);
    });
    const textInput = root.querySelector('#np-text-input');
    textInput?.addEventListener('input', event => { state.userInputValue = event.target.value; });
    textInput?.addEventListener('keydown', event => { if (event.key === 'Enter') checkAnswer(); });
    root.querySelectorAll('.hand-card').forEach(card => card.addEventListener('click', () => {
      if (state.isAnswered) return;
      const index = Number(card.dataset.index);
      const value = state.availableCards.splice(index, 1)[0];
      state.selectedCards.push(value);
      render();
    }));
    root.querySelectorAll('.selected-slot').forEach(card => card.addEventListener('click', () => {
      if (state.isAnswered) return;
      const index = Number(card.dataset.index);
      const value = state.selectedCards.splice(index, 1)[0];
      state.availableCards.push(value);
      render();
    }));
    root.querySelectorAll('.np-compare-btn').forEach(button => button.addEventListener('click', () => checkAnswer(button.dataset.val)));
    root.querySelectorAll('.num-key').forEach(button => button.addEventListener('click', () => {
      if (state.isAnswered) return;
      state.userInputValue += button.dataset.key;
      render();
    }));
    root.querySelector('#np-btn-clear')?.addEventListener('click', () => {
      state.userInputValue = '';
      render();
    });
  }

  render();
}
