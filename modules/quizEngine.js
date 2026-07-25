// number-park: インタラクティブ型クイズエンジン
import { generateProblems, levelSettings } from './problemSets.js';

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
    playNote(523.25, now, 0.12);        // C5
    playNote(659.25, now + 0.1, 0.12);  // E5
    playNote(783.99, now + 0.2, 0.25);  // G5
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

function normalize(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll(',', '')
    .replaceAll('，', '')
    .replaceAll(' ', '')
    .trim();
}

function formatNumber(num) {
  return typeof num === 'number' ? num.toLocaleString('ja-JP') : num;
}

export function initQuizEngine(root) {
  if (!root) return;

  let state = {
    currentLevel: 1,
    currentIndex: 0,
    problems: [],
    correctCount: 0,
    answeredIds: new Set(),
    userInputValue: '',
    selectedCards: [],
    availableCards: [],
    isAnswered: false,
    isCorrect: false,
    showHint: false
  };

  function resetSet() {
    state.problems = generateProblems(state.currentLevel, 20);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answeredIds.clear();
    loadProblem();
  }

  function loadProblem() {
    state.userInputValue = '';
    state.isAnswered = false;
    state.isCorrect = false;
    state.showHint = false;

    const current = state.problems[state.currentIndex];
    if (current?.extraData?.uiType === 'cards' && Array.isArray(current.extraData.digits)) {
      state.availableCards = [...current.extraData.digits];
      state.selectedCards = [];
    }

    render();
    renderAnswersTable();
  }

  function checkAnswer(answerOverride) {
    if (state.isAnswered) return;

    const current = state.problems[state.currentIndex];
    const rawAnswer = answerOverride !== undefined ? answerOverride : state.userInputValue;
    const cleanUser = normalize(rawAnswer);
    const cleanTarget = normalize(current.answer);

    state.isCorrect = (cleanUser === cleanTarget);
    state.isAnswered = true;

    if (state.isCorrect) {
      playCorrectSound();
      if (!state.answeredIds.has(current.id)) {
        state.answeredIds.add(current.id);
        state.correctCount += 1;
      }
    }

    render();
  }

  function render() {
    const current = state.problems[state.currentIndex];
    if (!current) return;

    const total = state.problems.length;
    const progressPercent = Math.round(((state.currentIndex + 1) / total) * 100);

    root.innerHTML = `
      <style>
        .np-quiz-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 1rem;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
          color: #2d3748;
        }
        .np-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .np-level-select select {
          padding: 0.4rem 0.8rem;
          font-size: 0.95rem;
          font-weight: bold;
          border-radius: 8px;
          border: 1px solid #cbd5e0;
          background: #f7fafc;
          cursor: pointer;
        }
        .np-regen-btn {
          padding: 0.4rem 0.9rem;
          background: #edf2f7;
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .np-regen-btn:hover { background: #e2e8f0; }

        .np-progress-box { margin-bottom: 1rem; }
        .np-progress-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: bold;
          color: #4a5568;
          margin-bottom: 0.3rem;
        }
        .np-progress-bar {
          height: 10px;
          background: #edf2f7;
          border-radius: 5px;
          overflow: hidden;
        }
        .np-progress-fill {
          height: 100%;
          background: #4299e1;
          transition: width 0.3s ease;
        }

        .np-card {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .np-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }
        .np-badge-type {
          background: #ebf8ff;
          color: #2b6cb0;
          font-size: 0.8rem;
          font-weight: bold;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
        }
        .np-badge-diff { font-size: 0.8rem; color: #718096; }
        .np-question-text {
          font-size: 1.2rem;
          font-weight: bold;
          line-height: 1.5;
          color: #1a202c;
        }

        /* 数直線描画エリア */
        .np-number-line {
          margin: 1rem 0;
          padding: 1rem 0.5rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }
        .np-line-hint-banner {
          background: #feebc8;
          color: #744210;
          font-size: 0.85rem;
          font-weight: bold;
          text-align: center;
          padding: 0.4rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
        }
        .np-line-ticks {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          padding: 0 10px;
        }
        .np-line-ticks::before {
          content: '';
          position: absolute;
          bottom: 22px;
          left: 15px;
          right: 15px;
          height: 4px;
          background: #a0aec0;
          z-index: 1;
        }
        .np-tick-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        .np-tick-mark {
          width: 3px;
          height: 14px;
          background: #4a5568;
          margin-bottom: 6px;
        }
        .np-tick-label { font-size: 0.75rem; font-weight: bold; color: #4a5568; }
        .np-tick-label.target {
          background: #e53e3e;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          box-shadow: 0 2px 4px rgba(229, 62, 62, 0.3);
        }

        /* 解答入力領域 */
        .np-interactive-area {
          margin-top: 1rem;
          padding: 1rem;
          background: #ffffff;
          border-radius: 10px;
          border: 1px dashed #cbd5e0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .np-cards-container { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
        .np-num-card {
          width: 48px;
          height: 62px;
          border: 2px solid #3182ce;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: bold;
          color: #2b6cb0;
          cursor: pointer;
          box-shadow: 0 3px 5px rgba(0,0,0,0.08);
        }
        .np-card-slot {
          width: 48px;
          height: 62px;
          border: 2px dashed #a0aec0;
          border-radius: 8px;
          background: #edf2f7;
        }

        .np-compare-buttons { display: flex; gap: 1rem; }
        .np-compare-btn {
          width: 64px;
          height: 64px;
          font-size: 1.6rem;
          font-weight: bold;
          border-radius: 12px;
          border: 2px solid #3182ce;
          background: #ebf8ff;
          color: #2b6cb0;
          cursor: pointer;
        }

        .np-input-row {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          max-width: 360px;
          margin-bottom: 0.75rem;
        }
        .np-input-row input {
          flex: 1;
          padding: 0.6rem;
          font-size: 1.2rem;
          font-weight: bold;
          border: 2px solid #cbd5e0;
          border-radius: 8px;
          text-align: center;
        }

        .np-keypad {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.4rem;
          width: 100%;
          max-width: 360px;
        }
        .np-key-btn {
          padding: 0.6rem 0;
          font-size: 1.1rem;
          font-weight: bold;
          background: #ffffff;
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 0 #cbd5e0;
        }
        .np-key-btn:active { transform: translateY(2px); box-shadow: none; }
        .np-key-btn.action { background: #edf2f7; color: #e53e3e; }

        .np-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .np-btn {
          flex: 1;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: bold;
          border-radius: 10px;
          border: none;
          cursor: pointer;
        }
        .np-btn-primary { background: #3182ce; color: white; }
        .np-btn-primary:hover { background: #2b6cb0; }
        .np-btn-secondary { background: #edf2f7; color: #4a5568; border: 1px solid #cbd5e0; }
        .np-btn-secondary:hover { background: #e2e8f0; }

        .np-feedback {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          font-weight: bold;
        }
        .np-feedback.correct { background: #c6f6d5; color: #22543d; border: 1px solid #9ae6b4; }
        .np-feedback.wrong { background: #fed7d7; color: #742a2a; border: 1px solid #feb2b2; }

        .np-hint-box {
          margin-top: 0.75rem;
          padding: 0.8rem;
          background: #fefcbf;
          border: 1px solid #faf089;
          border-radius: 8px;
          color: #744210;
          font-size: 0.9rem;
        }

        details.np-teacher-answers {
          margin-top: 1.5rem;
          padding: 0.8rem;
          background: #f7fafc;
          border-radius: 8px;
          font-size: 0.85rem;
        }
      </style>

      <div class="np-quiz-wrapper">
        <div class="np-toolbar">
          <div class="np-level-select">
            <label>学年：
              <select id="np-quiz-level">
                <option value="1" ${state.currentLevel === 1 ? 'selected' : ''}>レベル1（小2：1000〜10000）</option>
                <option value="2" ${state.currentLevel === 2 ? 'selected' : ''}>レベル2（小3：万〜1億）</option>
              </select>
            </label>
          </div>
          <button class="np-regen-btn" id="np-btn-regen">🔄 新しい20問</button>
        </div>

        <div class="np-progress-box">
          <div class="np-progress-info">
            <span>問題 ${state.currentIndex + 1} / ${total}</span>
            <span>⭐ 正解：${state.correctCount} 問</span>
          </div>
          <div class="np-progress-bar">
            <div class="np-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="np-card">
          <div class="np-meta">
            <span class="np-badge-type">${current.type}</span>
            <span class="np-badge-diff">難しさ：${current.difficulty}</span>
          </div>
          <div class="np-question-text">問${state.currentIndex + 1}. ${current.question}</div>

          <!-- 数直線グラフィック描画 -->
          ${current.extraData?.uiType === 'number-line' ? renderNumberLineGraphic(current.extraData) : ''}

          <!-- 入力エリア -->
          <div class="np-interactive-area">
            ${renderInteractiveInput(current)}
          </div>
        </div>

        <div class="np-actions">
          <button class="np-btn np-btn-secondary" id="np-btn-prev">◀ 前へ</button>
          <button class="np-btn np-btn-secondary" id="np-btn-hint">💡 ヒント</button>
          <button class="np-btn np-btn-primary" id="np-btn-check" ${state.isAnswered ? 'disabled' : ''}>答え合わせ</button>
          <button class="np-btn np-btn-secondary" id="np-btn-next">つぎへ ▶</button>
        </div>

        ${state.showHint ? `<div class="np-hint-box">💡 <strong>ヒント:</strong> ${current.hint}</div>` : ''}

        ${state.isAnswered ? `
          <div class="np-feedback ${state.isCorrect ? 'correct' : 'wrong'}">
            ${state.isCorrect
              ? '🎉 正解！位や数のかさなりをよく見られたね！'
              : `❌ ざんねん… 正解は 「 <strong>${formatNumber(current.answer)}</strong> 」 だよ。`
            }
          </div>
        ` : ''}

        <details class="np-teacher-answers">
          <summary style="cursor:pointer; font-weight:bold;">先生向け：答え一覧</summary>
          <ol id="np-answers-list" style="margin-top:0.5rem; padding-left:1.2rem;"></ol>
        </details>
      </div>
    `;

    bindEvents();
  }

  function renderNumberLineGraphic(data) {
    const { start, step, tickCount, blank } = data;
    let ticksHtml = '';

    for (let i = 0; i <= tickCount; i++) {
      const val = start + step * i;
      const isTarget = (i === blank);

      ticksHtml += `
        <div class="np-tick-item">
          <div class="np-tick-mark"></div>
          <div class="np-tick-label ${isTarget ? 'target' : ''}">
            ${isTarget ? '❓ □' : formatNumber(val)}
          </div>
        </div>
      `;
    }

    return `
      <div class="np-number-line">
        <div class="np-line-hint-banner">💡 1めもりは 【 ${formatNumber(step)} 】 ずつ 増えているよ！</div>
        <div class="np-line-ticks">${ticksHtml}</div>
      </div>
    `;
  }

  function renderInteractiveInput(problem) {
    const uiType = problem.extraData?.uiType;

    if (uiType === 'cards') {
      const slotCount = problem.extraData.digits.length;
      return `
        <div style="font-size:0.85rem; color:#718096; margin-bottom:0.5rem;">カードをタップして並べよう：</div>
        <div class="np-cards-container">
          ${Array.from({ length: slotCount }).map((_, i) => {
            const card = state.selectedCards[i];
            return card !== undefined
              ? `<div class="np-num-card selected-slot" data-index="${i}">${card}</div>`
              : `<div class="np-card-slot"></div>`;
          }).join('')}
        </div>
        <div class="np-cards-container">
          ${state.availableCards.map((num, i) =>
            `<div class="np-num-card hand-card" data-index="${i}">${num}</div>`
          ).join('')}
        </div>
      `;
    }

    if (uiType === 'compare') {
      return `
        <div style="font-size:0.85rem; color:#718096; margin-bottom:0.75rem;">○に入る記号をえらぼう：</div>
        <div class="np-compare-buttons">
          <button class="np-compare-btn" data-val=">">＞</button>
          <button class="np-compare-btn" data-val="=">＝</button>
          <button class="np-compare-btn" data-val="<">＜</button>
        </div>
      `;
    }

    const isKanji = problem.extraData?.inputMode === 'kanji';
    const keys = isKanji
      ? ['一', '二', '三', '四', '五', '六', '七', '八', '九', '零', '万', '千', '百', '十']
      : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    return `
      <div class="np-input-row">
        <input type="text" id="np-text-input" value="${state.userInputValue}" placeholder="答えを入力..." ${state.isAnswered ? 'disabled' : ''} />
      </div>
      ${!state.isAnswered ? `
        <div class="np-keypad">
          ${keys.map((k) => `<button class="np-key-btn num-key" data-key="${k}">${k}</button>`).join('')}
          <button class="np-key-btn action" id="np-btn-clear">けす</button>
        </div>
      ` : ''}
    `;
  }

  function renderAnswersTable() {
    const listEl = root.querySelector('#np-answers-list');
    if (!listEl) return;
    listEl.innerHTML = state.problems
      .map((p) => `<li>問${p.id}. <strong>${formatNumber(p.answer)}</strong> (${p.type})</li>`)
      .join('');
  }

  function bindEvents() {
    root.querySelector('#np-quiz-level')?.addEventListener('change', (e) => {
      state.currentLevel = Number(e.target.value);
      resetSet();
    });

    root.querySelector('#np-btn-regen')?.addEventListener('click', resetSet);

    root.querySelector('#np-btn-prev')?.addEventListener('click', () => {
      state.currentIndex = (state.currentIndex + state.problems.length - 1) % state.problems.length;
      loadProblem();
    });

    root.querySelector('#np-btn-next')?.addEventListener('click', () => {
      state.currentIndex = (state.currentIndex + 1) % state.problems.length;
      loadProblem();
    });

    root.querySelector('#np-btn-hint')?.addEventListener('click', () => {
      state.showHint = !state.showHint;
      render();
    });

    root.querySelector('#np-btn-check')?.addEventListener('click', () => {
      if (state.problems[state.currentIndex]?.extraData?.uiType === 'cards') {
        checkAnswer(state.selectedCards.join(''));
      } else {
        checkAnswer();
      }
    });

    const textInput = root.querySelector('#np-text-input');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        state.userInputValue = e.target.value;
      });
      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          checkAnswer();
        }
      });
      if (!state.isAnswered) {
        textInput.focus();
      }
    }

    root.querySelectorAll('.hand-card').forEach((el) => {
      el.addEventListener('click', () => {
        if (state.isAnswered) return;
        const idx = Number(el.dataset.index);
        const card = state.availableCards.splice(idx, 1)[0];
        state.selectedCards.push(card);
        render();
      });
    });

    root.querySelectorAll('.selected-slot').forEach((el) => {
      el.addEventListener('click', () => {
        if (state.isAnswered) return;
        const idx = Number(el.dataset.index);
        const card = state.selectedCards.splice(idx, 1)[0];
        state.availableCards.push(card);
        render();
      });
    });

    root.querySelectorAll('.np-compare-btn').forEach((el) => {
      el.addEventListener('click', () => {
        checkAnswer(el.dataset.val);
      });
    });

    root.querySelectorAll('.num-key').forEach((el) => {
      el.addEventListener('click', () => {
        if (state.isAnswered) return;
        state.userInputValue += el.dataset.key;
        render();
      });
    });

    root.querySelector('#np-btn-clear')?.addEventListener('click', () => {
      state.userInputValue = '';
      render();
    });
  }

  resetSet();
}
