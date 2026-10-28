/**
 * number-park: くらいどり・数分解モジュール（折り紙束表示対応）
 * 入力した数を、10000のたば・1000のたば・100のたば・10のたば・1まいの
 * 位ごとの個数に分解して表示する（99999まで）。
 */
const UNITS = [
  {
    key: 'tenThousands',
    label: '10000',
    value: 10000,
    title: '10000のたば',
    color: '#6b46c1',
    bg: '#faf5ff',
    border: '#d6bcfa'
  },
  {
    key: 'thousands',
    label: '1000',
    value: 1000,
    title: '1000のたば',
    color: '#276749',
    bg: '#f0fff4',
    border: '#9ae6b4'
  },
  {
    key: 'hundreds',
    label: '100',
    value: 100,
    title: '100のたば',
    color: '#e53e3e',
    bg: '#fff5f5',
    border: '#feb2b2'
  },
  {
    key: 'tens',
    label: '10',
    value: 10,
    title: '10のたば',
    color: '#3182ce',
    bg: '#ebf8ff',
    border: '#90cdf4'
  },
  {
    key: 'ones',
    label: '1',
    value: 1,
    title: '1まい',
    color: '#dd6b20',
    bg: '#fffaf0',
    border: '#fbd38d'
  }
];

// SVGアイコン生成（折り紙の束）
function getOrigamiSvg(type) {
  if (type === 'tenThousands') {
    return `
      <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
        <rect x="4" y="14" width="48" height="30" rx="4" fill="#d6bcfa" stroke="#805ad5" stroke-width="2"/>
        <rect x="4" y="9" width="48" height="30" rx="4" fill="#b794f4" stroke="#805ad5" stroke-width="2"/>
        <rect x="4" y="4" width="48" height="30" rx="4" fill="#805ad5"/>
        <rect x="22" y="4" width="12" height="30" fill="#e9d8fd" opacity="0.9"/>
        <text x="28" y="23" font-size="9" font-weight="bold" fill="#44337a" text-anchor="middle">10000</text>
      </svg>
    `;
  } else if (type === 'thousands') {
    return `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="12" width="36" height="30" rx="4" fill="#9ae6b4" stroke="#38a169" stroke-width="2"/>
        <rect x="6" y="8" width="36" height="30" rx="4" fill="#68d391" stroke="#38a169" stroke-width="2"/>
        <rect x="6" y="4" width="36" height="30" rx="4" fill="#38a169"/>
        <rect x="18" y="4" width="12" height="30" fill="#c6f6d5" opacity="0.9"/>
        <text x="24" y="23" font-size="9" font-weight="bold" fill="#22543d" text-anchor="middle">1000</text>
      </svg>
    `;
  } else if (type === 'hundreds') {
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
        max-width: 860px;
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
      <p class="description">数を入力すると、位ごとに何この束があるかに分けて考えます（99999まで）。</p>

      <!-- 入力パネル -->
      <div class="input-panel">
        <div class="input-group">
          <label for="decompose-number">分けたい数</label>
          <div class="input-row">
            <input id="decompose-number" type="number" min="0" max="99999" value="320">
          </div>
          <div class="preset-buttons">
            <span class="preset-label">ためしてみよう：</span>
            <button class="preset-btn" data-value="320">320</button>
            <button class="preset-btn" data-value="504">504</button>
            <button class="preset-btn" data-value="450">450</button>
            <button class="preset-btn" data-value="5206">5,206</button>
            <button class="preset-btn" data-value="12034">12,034</button>
            <button class="preset-btn" data-value="34050">34,050</button>
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
    const number = Math.min(99999, Math.max(0, Math.floor(Number(input.value) || 0)));

    // 位ごとの個数（各0〜9）
    const counts = {};
    UNITS.forEach((u) => {
      counts[u.key] = Math.floor(number / u.value) % 10;
    });

    // 表示する位は「その数のいちばん大きい位」まで（ただし最低でも100の位までは見せる）
    const highestValue = UNITS.find((u) => number >= u.value)?.value || 1;
    const displayFrom = Math.max(highestValue, 100);
    const visibleUnits = UNITS.filter((u) => u.value <= displayFrom);

    // 1. ステージ（折り紙の束）の描画
    stageContainer.innerHTML = visibleUnits.map((u) => {
      const count = counts[u.key];
      let itemsHtml = '';

      for (let i = 0; i < count; i++) {
        itemsHtml += getOrigamiSvg(u.key);
      }

      return `
        <div class="stage-group">
          <div class="stage-items">${itemsHtml || '<span style="color:#cbd5e0; font-size:0.8rem;">(なし)</span>'}</div>
          <div class="stage-label" style="background-color: ${u.bg}; color: ${u.color}; border: 1px solid ${u.border};">
            ${u.title} × ${count}個
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
      ${visibleUnits.map((u, i) => `
        ${i > 0 ? '<div class="operator">+</div>' : ''}
        <div class="card" style="border: 2px solid ${u.border}; color: ${u.color};">
          <div class="card-title">${u.title}</div>
          <div class="card-value">${counts[u.key]} 個</div>
          <div class="card-sub">（${(counts[u.key] * u.value).toLocaleString()}）</div>
        </div>
      `).join('')}
    `;

    // 3. メッセージの描画
    const parts = visibleUnits.map((u) => `${u.title}が <strong>${counts[u.key]}個</strong>`);
    messageBox.innerHTML = `
      <strong style="font-size: 1.2rem; color: #2b6cb0;">${number.toLocaleString()}</strong> は、<br>
      ${parts.join('、')} です。
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
