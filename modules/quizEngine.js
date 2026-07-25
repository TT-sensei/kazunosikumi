// number-park: 体感的に楽しく学べる対話型クイズエンジン
import { generateProblems, levelSettings } from './problemSets.js';

// --- 正解効果音（Web Audio API） ---
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
    console.warn('Audio play error:', e);
  }
}

// --- 表記ゆれ吸収用正規化関数 ---
function normalize(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll(',', '')
    .replaceAll('，', '')
    .replaceAll(' ', '')
    .trim();
}

// --- 数値フォーマット ---
function formatNumber(num) {
  return typeof num === 'number' ? num.toLocaleString('ja-JP') : num;
}

// --- クイズエンジン本体 ---
export function initQuizEngine(root) {
  if (!root) return;

  // 内部状態
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

  // --- 初期化 & レベル変更 ---
  function resetSet() {
    state.problems = generateProblems(state.currentLevel);
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

  // --- 解答判定 ---
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

  // --- 描画ロジック ---
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

        .np-progress-box {
          margin-bottom: 1rem;
        }
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
        .np-badge-diff {
          font-size: 0.8rem;
          color: #718096;
        }
        .np-question-text {
          font-size: 1.2rem;
          font-weight: bold;
          line-height: 1.5;
          color: #1a202c;
        }

        /* 数直線グラフィック */
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
        .np-tick-label {
          font-size: 0.75rem;
          font-weight: bold;
          color: #4a5568;
        }
        .np-tick-label.target {
          background: #e53e3e;
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          box-shadow: 0 2px 4px rgba(229, 62, 62, 0.3);
        }

        /* 入力エリア */
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

        .np-cards-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
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

        .np-compare-buttons {
          display: flex;
          gap: 1rem;
        }
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

        .np-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .np-btn {
          flex: 1;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: bold;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
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
        <!-- ツールバー -->
        <div class="np-toolbar">
          <div class="np-level-select">
            <label>学年：
              <select id="np-quiz-level">
                <option value="1" ${state.currentLevel === 1 ? 'selected' : ''}>レベル1（小2：1000〜10000）</option>
                <option value="2" ${state.currentLevel === 2 ? 'selected' : ''}>level 2（小3：万〜1億）</option>
              </select>
            </label>
          </div>
          <button class="np-regen-btn" id="np-btn-regen">🔄 新しい問題セット</button>
        </div>

        <!-- プログレスバー -->
        <div class="np-progress-box">
          <div class="np-progress-info">
            <span>問題 ${state.currentIndex + 1} / ${total}</span>
            <span>⭐ 正解：${state.correctCount} 問</span>
          </div>
          <div class="np-progress-bar">
            <div class="np-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <!-- メイン問題カード -->
        <div class="np-card">
          <div class="np-meta">
            <span class="np-badge-type">${current.type}</span>
            <span class="np-badge-diff">難しさ：${current.difficulty}</span>
          </div>
          <div class="np-question-text">問${state.currentIndex + 1}. ${current.question}</div>

          <!-- 数直線描画（該当問題のみ） -->
          ${current.extraData?.uiType === 'number-line' ? renderNumberLineGraphic(current.extraData) : ''}

          <!-- インタラクティブ入力エリア -->
          <div class="np-interactive-area">
            ${renderInteractiveInput(current)}
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="np-actions">
          <button class="np-btn np-btn-secondary" id="np-btn-prev">◀ 前へ</button>
          <button class="np-btn np-btn-secondary" id="np-btn-hint">💡 ヒント</button>
          <button class="np-btn np-btn-primary" id="np-btn-check" ${state.isAnswered ? 'disabled' : ''}>答え合わせ</button>
          <button class="np-btn np-btn-secondary" id="np-btn-next">つぎへ ▶</button>
        </div>

        <!-- ヒント表示 -->
        ${state.showHint ? `<div class="np-hint-box">💡 <strong>ヒント:</strong> ${current.hint}</div>` : ''}

        <!-- フィードバック（正解・不正解） -->
        ${state.isAnswered ? `
          <div class="np-feedback ${state.isCorrect ? 'correct' : 'wrong'}">
            ${state.isCorrect
              ? '🎉 正解！位や数のかさなりをよく見られたね！'
              : `❌ ざんねん… 正解は 「 <strong>${formatNumber(current.answer)}</strong> 」 だよ。`
            }
          </div>
        ` : ''}

        <!-- 先生向け解答一覧 -->
        <details class="np-teacher-answers">
          <summary style="cursor:pointer; font-weight:bold;">先生向け：答え一覧</summary>
          <ol id="np-answers-list" style="margin-top:0.5rem; padding-left:1.2rem;"></ol>
        </details>
      </div>
    `;

    bindEvents();
  }

  // 数直線グラフィック描画
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

  // 入力コントロールの動的レンダリング
  function renderInteractiveInput(problem) {
    const uiType = problem.extraData?.uiType;

    // 1. カード問題の場合
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

    // 2. 不等号比較の場合
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

    // 3. 通常入力（数字または漢字）
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

  // 先生向け正解リスト描画
  function renderAnswersTable() {
    const listEl = root.querySelector('#np-answers-list');
    if (!listEl) return;
    listEl.innerHTML = state.problems
      .map((p) => `<li>問${p.id}. <strong>${formatNumber(p.answer)}</strong> (${p.type})</li>`)
      .join('');
  }

  // --- イベントバインド ---
  function bindEvents() {
    // レベル切り替え
    root.querySelector('#np-quiz-level')?.addEventListener('change', (e) => {
      state.currentLevel = Number(e.target.value);
      resetSet();
    });

    // 問題再生成
    root.querySelector('#np-btn-regen')?.addEventListener('click', resetSet);

    // 問題移動
    root.querySelector('#np-btn-prev')?.addEventListener('click', () => {
      state.currentIndex = (state.currentIndex + state.problems.length - 1) % state.problems.length;
      loadProblem();
    });

    root.querySelector('#np-btn-next')?.addEventListener('click', () => {
      state.currentIndex = (state.currentIndex + 1) % state.problems.length;
      loadProblem();
    });

    // ヒントボタン
    root.querySelector('#np-btn-hint')?.addEventListener('click', () => {
      state.showHint = !state.showHint;
      render();
    });

    // 答え合わせボタン
    root.querySelector('#np-btn-check')?.addEventListener('click', () => {
      if (state.problems[state.currentIndex]?.extraData?.uiType === 'cards') {
        checkAnswer(state.selectedCards.join(''));
      } else {
        checkAnswer();
      }
    });

    // テキスト入力のリアルタイム反映
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

    // カード操作
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

    // 不等号ボタン直接クリック
    root.querySelectorAll('.np-compare-btn').forEach((el) => {
      el.addEventListener('click', () => {
        checkAnswer(el.dataset.val);
      });
    });

    // 画面キーパッド
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

  // 初回起動
  resetSet();
}    const digit = Math.floor(number / unit.value) % 10;
    if (digit === 0) return '';
    return `${digit === 1 && unit.value > 1 ? '' : kanjiDigits[digit]}${unit.label}`;
  }).join('') || '零';
}

function toKanji(number) {
  if (number === 100000000) return '一億';
  const man = Math.floor(number / 10000);
  const rest = number % 10000;
  return `${man ? `${toKanjiUnder10000(man)}万` : ''}${rest ? toKanjiUnder10000(rest) : ''}`;
}

function makeProblem(type, question, answer, hint, difficulty = 'ふつう', extraData = {}) {
  return { type, question, answer, hint, difficulty, extraData };
}

function numberLineText(start, end, blanks, tickCount) {
  const parts = [];
  for (let index = 0; index <= tickCount; index += 1) {
    if (index === 0) parts.push(formatNumber(start));
    else if (index === tickCount) parts.push(formatNumber(end));
    else if (blanks.includes(index)) parts.push('□');
    else parts.push('・');
  }
  return parts.join(' ─ ');
}

function makeNumberLineProblem({ start, step, tickCount, blanks, label = '数直線' }) {
  const end = start + step * tickCount;
  const answers = blanks.map((blank) => formatNumber(start + step * blank)).join('、');
  return makeProblem(
    '数直線・前後・大小比較',
    `${label}：${numberLineText(start, end, blanks, tickCount)}。□に入る数を左から答えよう。`,
    answers,
    `両端の差 ${formatNumber(end - start)} を ${tickCount} 等分して、1目盛りを考えよう。`,
    'むずかしい',
    { uiType: 'number-line', start, end, blanks, tickCount, step }
  );
}

function placeValueQuestions(level) {
  if (level === 1) {
    const zeroNumber = choice([3040, 4050, 6008, 7005, 9020]);
    const writeNumber = randomInt(2, 9) * 1000 + randomInt(1, 9) * 100 + randomInt(1, 9);
    const missing = randomInt(3, 9) * 1000 + randomInt(1, 9) * 10;
    return [
      makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書きましょう。`, toKanji(zeroNumber), '0がある位は読まないけれど、位は空いているよ。', 'ふつう', { inputMode: 'kanji' }),
      makeProblem('読み書き・位取り', `${toKanji(writeNumber)}を数字で書きましょう。`, writeNumber, '千・百・十・一の位に分けよう。', 'ふつう', { inputMode: 'number' }),
      makeProblem('読み書き・位取り', `${formatNumber(missing)}の十の位の数字はいくつ？`, Math.floor(missing / 10) % 10, '右から2番目が十の位だよ。', 'ふつう', { inputMode: 'number' })
    ];
  }
  const zeroNumber = choice([30040000, 5040000, 70080000, 9006000]);
  const writeNumber = randomInt(12, 980) * 10000 + choice([40, 300, 5000]);
  const target = choice([10000000, 1000000, 10000]);
  const digit = randomInt(2, 9);
  const placeValueNumber = target * digit + 50000;
  return [
    makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書きましょう。`, toKanji(zeroNumber), '万のまとまりと下4けたに分けよう。', 'ふつう', { inputMode: 'kanji' }),
    makeProblem('読み書き・位取り', `${toKanji(writeNumber)}を数字で書きましょう。`, writeNumber, '万より下は4けたになるように0を入れるよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('読み書き・位取り', `${formatNumber(placeValueNumber)}の${formatNumber(target)}の位の数字はいくつ？`, Math.floor(placeValueNumber / target) % 10, '位をそろえてから数字を見よう。', 'ふつう', { inputMode: 'number' })
  ];
}

function groupingQuestions(level) {
  const unit = level === 1 ? choice([10, 100, 1000]) : choice([10000, 1000000, 10000000]);
  const count = level === 1 ? randomInt(12, 98) : randomInt(12, 90);
  const anotherUnit = level === 1 ? 100 : 10000;
  const anotherCount = level === 1 ? choice([40, 50, 60, 70, 80, 90]) : choice([990, 1000, 1200]);
  return [
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit)}を${count}こ集めた数はいくつ？`, unit * count, 'まとまりの大きさ×個数で考えよう。', 'ふつう', { inputMode: 'number' }),
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit * count)}は${formatNumber(unit)}を何こ集めた数？`, count, 'わる数を「1つのまとまり」にするよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('構成・相対的な大きさ', `${formatNumber(anotherUnit)}を${anotherCount}こ集めると、${level === 1 ? '1000' : '1万'}を何こ集めた数と同じ？`, (anotherUnit * anotherCount) / (level === 1 ? 1000 : 10000), '小さいまとまりを大きいまとまりに直そう。', 'ふつう', { inputMode: 'number' })
  ];
}

function scaleQuestions(level) {
  if (level === 1) {
    const base = randomInt(120, 890);
    const hundredBase = randomInt(12, 90);
    return [
      makeProblem('10倍・100倍・1/10', `${formatNumber(base)}を10倍するといくつ？`, base * 10, '位が1つ上がるよ。', 'ふつう', { inputMode: 'number' }),
      makeProblem('10倍・100倍・1/10', `${formatNumber(hundredBase)}を100倍するといくつ？`, hundredBase * 100, '位が2つ上がるよ。', 'ふつう', { inputMode: 'number' }),
      makeProblem('10倍・100倍・1/10', `${formatNumber(choice([4000, 5000, 6000, 8000, 9000]))}の1/10はいくつ？`, null, '位が1つ下がるよ。', 'ふつう', { inputMode: 'number' })
    ].map((p) => p.answer === null ? { ...p, answer: Number(p.question.match(/[\d,]+/)[0].replaceAll(',', '')) / 10 } : p);
  }
  const tenBase = randomInt(90, 990) * 10000;
  const hundredBase = randomInt(1, 100) * 10000;
  return [
    makeProblem('10倍・100倍・1/10', `${formatNumber(tenBase)}を10倍するといくつ？`, tenBase * 10, '万から億へまたぐことがあるよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('10倍・100倍・1/10', `${formatNumber(hundredBase)}を100倍するといくつ？`, hundredBase * 100, '位が2つ上がる。0の数だけで判断しないよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('10倍・100倍・1/10', `1億の1/10はいくつ？`, 10000000, '億の1つ下の大きなまとまりは千万だよ。', 'ふつう', { inputMode: 'number' })
  ];
}

function lineCompareQuestions(level) {
  if (level === 1) {
    const start = randomInt(56, 78) * 100;
    const step = choice([10, 20, 50]);
    const tickCount = choice([10, 12, 16]);
    const left = randomInt(4, 8) * 1000 + 40;
    const right = left + choice([-90, 90, 100]);
    return [
      makeNumberLineProblem({ start, step, tickCount, blanks: shuffle([3, 7, tickCount - 2]).slice(0, 3) }),
      makeProblem('数直線・前後・大小比較', `10,000より1小さい数はいくつ？`, 9999, '9999→10000の境界に注意。', 'むずかしい', { inputMode: 'number' }),
      makeProblem('数直線・前後・大小比較', `${formatNumber(left)} ○ ${formatNumber(right)}。○に入る不等号を答えましょう。`, left > right ? '>' : left < right ? '<' : '=', '千の位から順にくらべよう。', 'ふつう', { uiType: 'compare' }),
      makeProblem('数直線・前後・大小比較', `${formatNumber(start + 10)}より10小さい数はいくつ？`, start, '十の位が1つ下がるよ。', 'ふつう', { inputMode: 'number' }),
      makeProblem('数直線・前後・大小比較', `${formatNumber(start + 100)}より100小さい数はいくつ？`, start, '百の位が1つ下がるよ。', 'ふつう', { inputMode: 'number' })
    ];
  }
  const start = randomInt(120, 780) * 100000;
  const step = choice([100000, 500000, 1000000]);
  const tickCount = choice([10, 12, 20]);
  const left = randomInt(30, 80) * 1000000 + 40000;
  const right = left + choice([-10000, 10000, 100000]);
  return [
    makeNumberLineProblem({ start, step, tickCount, blanks: shuffle([2, 9, tickCount - 3]).slice(0, 3) }),
    makeProblem('数直線・前後・大小比較', `1億より1小さい数はいくつ？`, 99999999, '99,999,999→100,000,000の境界に注意。', 'むずかしい', { inputMode: 'number' }),
    makeProblem('数直線・前後・大小比較', `1,000万より1万小さい数はいくつ？`, 9990000, '1000万−1万は、万のまとまりを1つ減らすよ。', 'むずかしい', { inputMode: 'number' }),
    makeProblem('数直線・前後・大小比較', `${formatNumber(left)} ○ ${formatNumber(right)}。○に入る不等号を答えましょう。`, left > right ? '>' : left < right ? '<' : '=', '大きい位から順にくらべよう。', 'ふつう', { uiType: 'compare' }),
    makeProblem('数直線・前後・大小比較', `${formatNumber(start)}より1万小さい数はいくつ？`, start - 10000, '万の位を1つ下げる。くり下がりに注意。', 'ふつう', { inputMode: 'number' })
  ];
}

function permutations(digits) {
  const results = [];
  function build(rest, used) {
    if (!rest.length) {
      if (used[0] !== 0) results.push(Number(used.join('')));
      return;
    }
    rest.forEach((digit, index) => build([...rest.slice(0, index), ...rest.slice(index + 1)], [...used, digit]));
  }
  build(digits, []);
  return results;
}

function cardQuestions(level) {
  const digits = level === 1 ? shuffle([0, randomInt(2, 9), randomInt(1, 8), randomInt(3, 9)]) : shuffle([0, randomInt(1, 9), randomInt(2, 8), randomInt(3, 9), randomInt(4, 9)]);
  const desc = [...digits].sort((a, b) => b - a);
  const asc = [...digits].sort((a, b) => a - b);
  const firstNonZero = asc.findIndex((digit) => digit !== 0);
  const minDigits = [...asc];
  [minDigits[0], minDigits[firstNonZero]] = [minDigits[firstNonZero], minDigits[0]];
  const candidates = permutations(digits).filter((value) => String(value).length === digits.length);
  const target = level === 1 ? 7000 : 50000;
  const closest = candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];
  return [
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使ってできる${digits.length}けたの最大の数は？`, Number(desc.join('')), '大きい数字を左から置こう。', 'ふつう', { uiType: 'cards', digits }),
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使ってできる${digits.length}けたの最小の数は？`, Number(minDigits.join('')), 'いちばん左に0は置けないよ。', 'むずかしい', { uiType: 'cards', digits }),
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使って、${formatNumber(target)}に一番近い数を作りましょう。`, closest, 'まず一番大きい位を目標に近づけよう。', 'むずかしい', { uiType: 'cards', digits })
  ];
}

function compositeSet(level) {
  const step = level === 1 ? choice([10, 20, 50]) : choice([10000, 50000, 100000]);
  const tickCount = choice([10, 12, 15, 20]);
  const start = level === 1 ? randomInt(58, 96) * 100 : randomInt(120, 860) * 100000;
  const blanks = [2, Math.floor(tickCount / 2), tickCount - 2];
  const answerValues = blanks.map((blank) => start + step * blank);
  const groupingUnit = level === 1 ? 10 : 10000;
  return [
    makeNumberLineProblem({ start, step, tickCount, blanks, label: '複合（数直線＋位取り＋まとまり）' }),
    makeProblem('構成・相対的な大きさ', `上の数直線のまん中の□（${formatNumber(answerValues[1])}）は、${formatNumber(groupingUnit)}を何こ集めた数？`, answerValues[1] / groupingUnit, '数直線で数を決めてから、まとまりでわろう。', 'むずかしい', { inputMode: 'number' })
  ];
}

function buildProblemPool(level) {
  return [
    ...placeValueQuestions(level),
    ...groupingQuestions(level),
    ...scaleQuestions(level),
    ...lineCompareQuestions(level),
    ...cardQuestions(level),
    ...compositeSet(level)
  ];
}

export function generateProblems(level = 1, size = 10) {
  const required = buildProblemPool(level);
  const extras = [];
  while (required.length + extras.length < size) {
    extras.push(...shuffle(buildProblemPool(level)));
  }
  return shuffle([...required, ...extras.slice(0, Math.max(0, size - required.length))])
    .slice(0, size)
    .map((problem, index) => ({ ...problem, id: index + 1 }));
}


// --- 2. インタラクティブUIコンポーネント ---
export function renderNumberParkQuiz(root) {
  if (!root) return;

  let state = {
    level: 1,
    problems: [],
    currentIndex: 0,
    score: 0,
    selectedCards: [],
    availableCards: [],
    inputValue: '',
    isAnswered: false,
    isCorrect: false,
    showHint: false
  };

  function startQuiz() {
    state.problems = generateProblems(state.level, 10);
    state.currentIndex = 0;
    state.score = 0;
    loadProblem();
  }

  function loadProblem() {
    const current = state.problems[state.currentIndex];
    state.inputValue = '';
    state.isAnswered = false;
    state.isCorrect = false;
    state.showHint = false;

    if (current.extraData?.uiType === 'cards') {
      state.availableCards = [...current.extraData.digits];
      state.selectedCards = [];
    }
    render();
  }

  function checkAnswer(userAnswer) {
    if (state.isAnswered) return;

    const current = state.problems[state.currentIndex];
    // 文字列・数値、カンマを除去して比較
    const cleanUser = String(userAnswer).replace(/,/g, '').trim();
    const cleanTarget = String(current.answer).replace(/,/g, '').trim();

    state.isCorrect = cleanUser === cleanTarget;
    state.isAnswered = true;
    if (state.isCorrect) state.score += 10;
    render();
  }

  function render() {
    const current = state.problems[state.currentIndex];
    if (!current) {
      renderResult();
      return;
    }

    root.innerHTML = `
      <style>
        .np-quiz {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 1rem;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          color: #2d3748;
          user-select: none;
        }

        /* ヘッダー・進捗 */
        .np-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .np-level-select button {
          border: 1px solid #cbd5e0;
          background: #edf2f7;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .np-level-select button.active {
          background: #3182ce;
          color: white;
          border-color: #3182ce;
        }
        .np-score-badge {
          font-weight: bold;
          color: #dd6b20;
          font-size: 1.1rem;
        }
        .np-progress-bar {
          height: 8px;
          background: #edf2f7;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1.25rem;
        }
        .np-progress-fill {
          height: 100%;
          background: #48bb78;
          transition: width 0.3s ease;
        }

        /* 問題エリア */
        .np-card {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .np-tag {
          display: inline-block;
          background: #ebf8ff;
          color: #2b6cb0;
          font-size: 0.75rem;
          font-weight: bold;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          margin-bottom: 0.5rem;
        }
        .np-question-text {
          font-size: 1.15rem;
          font-weight: bold;
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }

        /* インタラクティブUIエリア */
        .np-interactive-area {
          margin-top: 1rem;
          padding: 1rem;
          background: #ffffff;
          border-radius: 10px;
          border: 1px dashed #cbd5e0;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* 1. カード演出 */
        .np-cards-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .np-num-card {
          width: 50px;
          height: 65px;
          border: 2px solid #3182ce;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: #2b6cb0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: transform 0.1s, background-color 0.2s;
        }
        .np-num-card:active {
          transform: scale(0.95);
        }
        .np-card-slot {
          width: 50px;
          height: 65px;
          border: 2px dashed #a0aec0;
          border-radius: 8px;
          background: #edf2f7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 2. 不等号ボタン */
        .np-compare-buttons {
          display: flex;
          gap: 1rem;
        }
        .np-compare-btn {
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
          font-weight: bold;
          border-radius: 12px;
          border: 2px solid #3182ce;
          background: #ebf8ff;
          color: #2b6cb0;
          cursor: pointer;
        }

        /* 3. カスタムキーパッド */
        .np-keypad {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.4rem;
          margin-top: 0.75rem;
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
        .np-key-btn:active {
          transform: translateY(2px);
          box-shadow: none;
        }
        .np-key-btn.action {
          background: #edf2f7;
          color: #e53e3e;
        }

        /* 回答入力表示エリア */
        .np-answer-display {
          font-size: 1.5rem;
          font-weight: bold;
          min-height: 2.2rem;
          border-bottom: 2px solid #3182ce;
          padding: 0 1rem;
          margin-bottom: 0.5rem;
          text-align: center;
          color: #2d3748;
        }

        /* 操作ボタン */
        .np-submit-btn {
          width: 100%;
          padding: 0.8rem;
          font-size: 1.1rem;
          font-weight: bold;
          background: #3182ce;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 0.75rem;
          box-shadow: 0 4px 6px rgba(49, 130, 206, 0.3);
        }

        /* フィードバックモーダル */
        .np-feedback {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          font-weight: bold;
          animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .np-feedback.correct {
          background: #c6f6d5;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }
        .np-feedback.wrong {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }
        .np-hint-box {
          margin-top: 0.5rem;
          background: #fffaf0;
          border: 1px solid #fbd38d;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #744210;
        }

        @keyframes pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>

      <div class="np-quiz">
        <!-- ヘッダー -->
        <div class="np-header">
          <div class="np-level-select">
            <button class="${state.level === 1 ? 'active' : ''}" id="btn-lvl1">小2（4けた）</button>
            <button class="${state.level === 2 ? 'active' : ''}" id="btn-lvl2">小3（大きな数）</button>
          </div>
          <div class="np-score-badge">⭐ ${state.score} 点</div>
        </div>

        <!-- プログレスバー -->
        <div class="np-progress-bar">
          <div class="np-progress-fill" style="width: ${((state.currentIndex + 1) / state.problems.length) * 100}%"></div>
        </div>

        <!-- 問題カード -->
        <div class="np-card">
          <span class="np-tag">${current.type}</span>
          <div class="np-question-text">問 ${state.currentIndex + 1}. ${current.question}</div>

          <!-- インタラクティブ回答UI -->
          <div class="np-interactive-area">
            ${renderInteractiveContent(current)}
          </div>
        </div>

        <!-- 結果フィードバック -->
        ${state.isAnswered ? `
          <div class="np-feedback ${state.isCorrect ? 'correct' : 'wrong'}">
            ${state.isCorrect ? '🎉 だいせいかい！' : `❌ ざんねん… 正解は 「 ${formatNumber(current.answer)} 」`}
            <div style="font-size:0.85rem; font-weight:normal; margin-top:0.4rem;">💡 ${current.hint}</div>
            <button class="np-submit-btn" id="btn-next" style="background:#48bb78;">つぎの問題へ ➔</button>
          </div>
        ` : ''}
      </div>
    `;

    bindEvents();
  }

  // 問題形式に応じたUI描画
  function renderInteractiveContent(problem) {
    const uiType = problem.extraData?.uiType;

    // 1. カード並べ替え問題
    if (uiType === 'cards') {
      const slotCount = problem.extraData.digits.length;
      return `
        <div style="font-size:0.85rem; color:#718096; margin-bottom:0.5rem;">カードをタップして作ろう：</div>
        <!-- 選択済みの枠 -->
        <div class="np-cards-container">
          ${Array.from({ length: slotCount }).map((_, i) => {
            const card = state.selectedCards[i];
            return card !== undefined
              ? `<div class="np-num-card selected-slot" data-index="${i}">${card}</div>`
              : `<div class="np-card-slot"></div>`;
          }).join('')}
        </div>
        <!-- 手持ちカード -->
        <div class="np-cards-container">
          ${state.availableCards.map((num, i) =>
            `<div class="np-num-card hand-card" data-index="${i}">${num}</div>`
          ).join('')}
        </div>
        ${!state.isAnswered ? `<button class="np-submit-btn" id="btn-submit-cards" ${state.selectedCards.length < slotCount ? 'disabled style="opacity:0.5;"' : ''}>これで決定！</button>` : ''}
      `;
    }

    // 2. 不等号ボタン（大小比較）
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

    // 3. テンキー / 漢字キーパッド入力
    const isKanji = problem.extraData?.inputMode === 'kanji';
    return `
      <div class="np-answer-display">${state.inputValue || '<span style="color:#a0aec0;">こたえ</span>'}</div>
      ${!state.isAnswered ? `
        <div class="np-keypad">
          ${isKanji
            ? ['一', '二', '三', '四', '五', '六', '七', '八', '九', '零', '万', '千', '百', '十'].map((k) => `<button class="np-key-btn num-key" data-key="${k}">${k}</button>`).join('')
            : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((k) => `<button class="np-key-btn num-key" data-key="${k}">${k}</button>`).join('')
          }
          <button class="np-key-btn action" id="btn-clear">けす</button>
        </div>
        <button class="np-submit-btn" id="btn-submit-input" ${!state.inputValue ? 'disabled style="opacity:0.5;"' : ''}>こたえる</button>
      ` : ''}
    `;
  }

  function renderResult() {
    root.innerHTML = `
      <div class="np-quiz" style="text-align:center; padding:2rem 1rem;">
        <h2 style="font-size:1.8rem; color:#2b6cb0;">🎉 おつかれさまでした！</h2>
        <p style="font-size:1.2rem; margin:1rem 0;">あなたのスコア: <strong>${state.score} / 100 点</strong></p>
        <button class="np-submit-btn" id="btn-restart" style="max-width:240px;">もう一度挑戦する 🚀</button>
      </div>
    `;
    root.querySelector('#btn-restart')?.addEventListener('click', startQuiz);
  }

  function bindEvents() {
    // レベル切り替え
    root.querySelector('#btn-lvl1')?.addEventListener('click', () => { state.level = 1; startQuiz(); });
    root.querySelector('#btn-lvl2')?.addEventListener('click', () => { state.level = 2; startQuiz(); });

    // 次へボタン
    root.querySelector('#btn-next')?.addEventListener('click', () => {
      state.currentIndex += 1;
      loadProblem();
    });

    // カード操作
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

    root.querySelector('#btn-submit-cards')?.addEventListener('click', () => {
      checkAnswer(state.selectedCards.join(''));
    });

    // 不等号ボタン操作
    root.querySelectorAll('.np-compare-btn').forEach((el) => {
      el.addEventListener('click', () => {
        checkAnswer(el.dataset.val);
      });
    });

    // キーパッド操作
    root.querySelectorAll('.num-key').forEach((el) => {
      el.addEventListener('click', () => {
        if (state.isAnswered) return;
        state.inputValue += el.dataset.key;
        render();
      });
    });

    root.querySelector('#btn-clear')?.addEventListener('click', () => {
      state.inputValue = '';
      render();
    });

    root.querySelector('#btn-submit-input')?.addEventListener('click', () => {
      checkAnswer(state.inputValue);
    });
  }

  // 初期化開始
  startQuiz();
}
