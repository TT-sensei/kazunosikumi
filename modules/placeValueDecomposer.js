/**
 * number-park: くらいどり・数分解モジュール（折り紙束表示対応）
 */
const UNITS = [
  {
    key: 'hundreds',
    label: '100',
    value: 100,
    title: '100のたば',
    sub: '100枚入り',
    color: '#e53e3e',
    bg: '#fff5f5',
    border: '#feb2b2'
  },
  {
    key: 'tens',
    label: '10',
    value: 10,
    title: '10のたば',
    sub: '10枚入り',
    color: '#3182ce',
    bg: '#ebf8ff',
    border: '#90cdf4'
  },
  {
    key: 'ones',
    label: '1',
    value: 1,
    title: '1まい',
    sub: 'ばら',
    color: '#dd6b20',
    bg: '#fffaf0',
    border: '#fbd38d'
  }
];

// SVGアイコン生成（折り紙の束）
function getOrigamiSvg(type) {
  if (type === 'hundreds') {
    return `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="12" width="36" height="30" rx="4" fill="#feb2b2" stroke="#e53e3e" stroke-width="2"/>
        <rect x="6" y="8" width="36" height="30" rx="4" fill="#fc8181" stroke="#e53e3e" stroke-width="2"/>
        <rect x="6" y="4" width="36" height="30" rx="4" fill="#e53e3e"/>
        <rect x="18" y="4" width="12" height="30" fill="#feebc8" opacity="0.9"/>
        <text x="24" y="23" font-size="11" font-weight="bold" fill="#742a2a" text-anchor="middle">100</text>
      </svg>
    `;
  } else if (type === 'tens') {
    return `
      <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
        <rect x="3" y="4" width="18" height="40" rx="3" fill="#3182ce"/>
        <rect x="1" y="20" width="22" height="8" rx="1" fill="#bee3f8" stroke="#2b6cb0" stroke-width="1.5"/>
        <text x="12" y="15" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">10</text>
      </svg>
    `;
  } else {
    return `
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M 4 4 L 32 4 L 32 24 L 20 32 L 4 32 Z" fill="#dd6b20"/>
        <path d="M 32 24 L 20 24 L 20 32 Z" fill="#c05621"/>
        <text x="17" y="19" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
      </svg>
    `;
  }
}

export function initPlaceValueDecomposer(root) {
  if (!root) return;

  root.innerHTML = `
    <style>
      .number-park-decomposer {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 720px;
        margin: 0 auto;
        padding: 1rem;
        box-sizing: border-box;
      }
      .number-park-decomposer * {
        box-sizing: border-box;
      }
      .number-park-decomposer .description {
        font-size: 0.95rem;
        color: #4a5568;
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      /* 入力パネル */
      .number-park-decomposer .input-panel {
        background: #f7fafc;
        border-radius: 12px;
        padding: 1.25rem;
        border: 1px solid #e2e8f0;
        margin-bottom: 1.25rem;
      }
      .number-park-decomposer .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .number-park-decomposer .input-group label {
        font-weight: bold;
        font-size: 0.9rem;
        color: #2d3748;
      }
      .number-park-decomposer .input-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .number-park-decomposer .input-row input {
        flex: 1;
        padding: 0.6rem 0.8rem;
        font-size: 1.2rem;
        font-weight: bold;
        border: 2px solid #cbd5e0;
        border-radius: 8px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        background-color: #ffffff;
      }
      .number-park-decomposer .input-row input:focus {
        border-color: #3182ce;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
      }

      /* サンプル数ボタン */
      .number-park-decomposer .preset-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 0.5rem;
      }
      .number-park-decomposer .preset-label {
        font-size: 0.8rem;
        color: #718096;
        font-weight: 600;
      }
      .number-park-decomposer .preset-btn {
        background: #ffffff;
        border: 1px solid #cbd5e0;
        color: #4a5568;
        padding: 0.3rem 0.65rem;
        font-size: 0.85rem;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .number-park-decomposer .preset-btn:hover {
        background: #edf2f7;
        border-color: #a0aec0;
      }

      /* 折り紙の塊表示ステージ */
      .number-park-decomposer .stage-container {
        background: #ffffff;
        border: 2px dashed #cbd5e0;
        border-radius: 12px;
        padding: 1rem;
        min-height: 140px;
        margin-bottom: 1.25rem;
        display: flex;
        gap: 1rem;
        justify-content: space-around;
        align-items: flex-end;
        background-color: #fcfcfc;
      }
      .number-park-decomposer .stage-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
      .number-park-decomposer .stage-items {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        justify-content: center;
        align-items: flex-end;
        min-height: 55px;
      }
      .number-park-decomposer .stage-label {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        font-weight: bold;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
      }

      /* 数式カードエリア */
      .number-park-decomposer .cards-display {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        padding: 1.25rem 0.5rem;
        background: #edf2f7;
        border-radius: 12px;
      }
      .number-park-decomposer .card {
        background: #ffffff;
        border-radius: 10px;
        padding: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
        text-align: center;
        min-width: 90px;
      }
      .number-park-decomposer .card-title {
        font-size: 0.75rem;
        color: #718096;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .number-park-decomposer .card-value {
        font-size: 1.2rem;
        font-weight: 700;
      }
      .number-park-decomposer .card-sub {
        font-size: 0.75rem;
        margin-top: 0.2rem;
        opacity: 0.85;
      }
      .number-park-decomposer .operator {
        font-size: 1.2rem;
        font-weight: bold;
        color: #a0aec0;
      }

      /* 解説テキスト */
      .number-park-decomposer .message-box {
        text-align: center;
        padding: 1rem;
        border-radius: 10px;
        font-size: 1.05rem;
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        color: #2d3748;
        line-height: 1.6;
      }
    </style>

    <div class="number-park-decomposer">
      <p class="description">数を入力すると、100のたば・10のたば・1まいが何こあるかに分けて考えます。</p>

      <!-- 入力パネル -->
      <div class="input-panel">
        <div class="input-group">
          <label for="decompose-number">分けたい数</label>
          <div class="input-row">
            <input id="decompose-number" type="number" min="0" max="99999999" value="320">
          </div>
          <div class="preset-buttons">
            <span class="preset-label">ためしてみよう：</span>
            <button class="preset-btn" data-value="320">320</button>
            <button class="preset-btn" data-value="504">504</button>
            <button class="preset-btn" data-value="123">123</button>
            <button class="preset-btn" data-value="450">450</button>
            <button class="preset-btn" data-value="888">888</button>
          </div>
        </div>
      </div>

      <!-- 折り紙の塊表示ステージ -->
      <div class="stage-container" id="stage-container"></div>

      <!-- 数式カード -->
      <div class="cards-display" id="cards-display"></div>

      <!-- 解説テキスト -->
      <div class="message-box" id="message-box"></div>
    </div>
  `;

  const input = root.querySelector('#decompose-number');
  const stageContainer = root.querySelector('#stage-container');
  const cardsDisplay = root.querySelector('#cards-display');
  const messageBox = root.querySelector('#message-box');

  function render() {
    const number = Math.max(0, Math.floor(Number(input.value) || 0));

    const hundreds = Math.floor(number / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;

    const counts = { hundreds, tens, ones };

    // 1. ステージ（折り紙の束）の描画
    stageContainer.innerHTML = UNITS.map((u) => {
      const count = counts[u.key];
      let itemsHtml = '';

      // 表示上限12個で調整（溢れる分は数字で補足）
      const displayCount = Math.min(count, 12);
      for (let i = 0; i < displayCount; i++) {
        itemsHtml += getOrigamiSvg(u.key);
      }
      if (count > 12) {
        itemsHtml += `<span style="font-size:0.8rem; font-weight:bold; color:${u.color};">+${count - 12}</span>`;
      }

      return `
        <div class="stage-group">
          <div class="stage-items">${itemsHtml || '<span style="color:#cbd5e0; font-size:0.8rem;">(なし)</span>'}</div>
          <div class="stage-label" style="background-color: ${u.bg}; color: ${u.color}; border: 1px solid ${u.border};">
            ${u.title} × ${count.toLocaleString()}個
          </div>
        </div>
      `;
    }).join('');

    // 2. 数式カードの描画
    cardsDisplay.innerHTML = `
      <div class="card" style="border: 2px solid #4a5568; background-color: #f7fafc; color: #2d3748;">
        <div class="card-title">もとの数</div>
        <div class="card-value">${number.toLocaleString()}</div>
      </div>
      <div class="operator">=</div>
      <div class="card" style="border: 2px solid ${UNITS[0].border}; color: ${UNITS[0].color};">
        <div class="card-title">100のたば</div>
        <div class="card-value">${hundreds.toLocaleString()} 個</div>
        <div class="card-sub">（${(hundreds * 100).toLocaleString()}）</div>
      </div>
      <div class="operator">+</div>
      <div class="card" style="border: 2px solid ${UNITS[1].border}; color: ${UNITS[1].color};">
        <div class="card-title">10のたば</div>
        <div class="card-value">${tens} 個</div>
        <div class="card-sub">（${tens * 10}）</div>
      </div>
      <div class="operator">+</div>
      <div class="card" style="border: 2px solid ${UNITS[2].border}; color: ${UNITS[2].color};">
        <div class="card-title">1まい</div>
        <div class="card-value">${ones} 個</div>
        <div class="card-sub">（${ones}）</div>
      </div>
    `;

    // 3. メッセージの描画
    messageBox.innerHTML = `
      <strong style="font-size: 1.2rem; color: #2b6cb0;">${number.toLocaleString()}</strong> は、<br>
      100のたばが <strong>${hundreds.toLocaleString()}個</strong>、10のたばが <strong>${tens}個</strong>、1まいが <strong>${ones}個</strong> です。
    `;
  }

  // 入力イベント
  input.addEventListener('input', render);

  // サンプルボタンのクリックイベント
  root.addEventListener('click', (event) => {
    if (event.target.classList.contains('preset-btn')) {
      const val = event.target.dataset.value;
      input.value = val;
      render();
    }
  });

  render();
}
