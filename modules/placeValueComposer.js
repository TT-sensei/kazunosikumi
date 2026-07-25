/**
 * number-park: くらいどり・数づくりモジュール（折り紙束表示対応）
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
    border: '#feb2b2',
    btnBg: '#e53e3e'
  },
  {
    key: 'tens',
    label: '10',
    value: 10,
    title: '10のたば',
    sub: '10枚入り',
    color: '#3182ce',
    bg: '#ebf8ff',
    border: '#90cdf4',
    btnBg: '#3182ce'
  },
  {
    key: 'ones',
    label: '1',
    value: 1,
    title: '1まい',
    sub: 'ばら',
    color: '#dd6b20',
    bg: '#fffaf0',
    border: '#fbd38d',
    btnBg: '#dd6b20'
  }
];

// SVGアイコン生成（折り紙の束）
function getOrigamiSvg(type) {
  if (type === 'hundreds') {
    // 100の束（重なった大きな箱・束）
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
    // 10の束（細長い束）
    return `
      <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
        <rect x="3" y="4" width="18" height="40" rx="3" fill="#3182ce"/>
        <rect x="1" y="20" width="22" height="8" rx="1" fill="#bee3f8" stroke="#2b6cb0" stroke-width="1.5"/>
        <text x="12" y="15" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">10</text>
      </svg>
    `;
  } else {
    // 1枚（ばらの折り紙）
    return `
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M 4 4 L 32 4 L 32 24 L 20 32 L 4 32 Z" fill="#dd6b20"/>
        <path d="M 32 24 L 20 24 L 20 32 Z" fill="#c05621"/>
        <text x="17" y="19" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">1</text>
      </svg>
    `;
  }
}

export function initPlaceValueComposer(root) {
  if (!root) return;

  const counts = { hundreds: 2, tens: 3, ones: 5 }; // 初期値

  root.innerHTML = `
    <style>
      .number-park-composer {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 720px;
        margin: 0 auto;
        padding: 1rem;
        box-sizing: border-box;
      }
      .number-park-composer * {
        box-sizing: border-box;
      }
      .number-park-composer .description {
        font-size: 0.95rem;
        color: #4a5568;
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      /* 操作ボタンエリア */
      .number-park-composer .control-panel {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }
      .number-park-composer .unit-control {
        background: #f7fafc;
        border-radius: 12px;
        padding: 0.75rem;
        text-align: center;
        border: 1px solid #e2e8f0;
      }
      .number-park-composer .unit-control-title {
        font-size: 0.85rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      .number-park-composer .btn-group {
        display: flex;
        gap: 0.4rem;
        justify-content: center;
      }
      .number-park-composer button {
        border: none;
        color: white;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.1s, opacity 0.2s;
        user-select: none;
      }
      .number-park-composer button:active {
        transform: scale(0.95);
      }
      .number-park-composer .btn-add {
        flex: 2;
      }
      .number-park-composer .btn-sub {
        flex: 1;
        background-color: #718096;
      }
      .number-park-composer .btn-reset-container {
        text-align: right;
        margin-bottom: 1rem;
      }
      .number-park-composer .btn-reset {
        background-color: #e2e8f0;
        color: #4a5568;
        font-size: 0.8rem;
        padding: 0.4rem 0.8rem;
      }

      /* 折り紙が並ぶステージ（塊表示） */
      .number-park-composer .stage-container {
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
      .number-park-composer .stage-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
      .number-park-composer .stage-items {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        justify-content: center;
        align-items: flex-end;
        min-height: 55px;
      }
      .number-park-composer .stage-label {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        font-weight: bold;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
      }

      /* 数式カードエリア */
      .number-park-composer .cards-display {
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
      .number-park-composer .card {
        background: #ffffff;
        border-radius: 10px;
        padding: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
        text-align: center;
        min-width: 90px;
      }
      .number-park-composer .card-title {
        font-size: 0.75rem;
        color: #718096;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .number-park-composer .card-value {
        font-size: 1.2rem;
        font-weight: 700;
      }
      .number-park-composer .operator {
        font-size: 1.2rem;
        font-weight: bold;
        color: #a0aec0;
      }

      /* 結果メッセージ */
      .number-park-composer .message-box {
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

    <div class="number-park-composer">
      <p class="description">ボタンを押して折り紙の束をあつめ、数をつくります。</p>

      <div class="btn-reset-container">
        <button class="btn-reset" data-reset>0にもどす</button>
      </div>

      <!-- 操作パネル -->
      <div class="control-panel">
        ${UNITS.map((u) => `
          <div class="unit-control" style="border-color: ${u.border}; background-color: ${u.bg};">
            <div class="unit-control-title" style="color: ${u.color};">${u.title}</div>
            <div class="btn-group">
              <button class="btn-add" data-add="${u.key}" style="background-color: ${u.btnBg};">+ ${u.label}</button>
              <button class="btn-sub" data-sub="${u.key}">-</button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 折り紙の塊表示ステージ -->
      <div class="stage-container" id="stage-container"></div>

      <!-- 数式カード -->
      <div class="cards-display" id="cards-display"></div>

      <!-- 解説テキスト -->
      <div class="message-box" id="message-box"></div>
    </div>
  `;

  const stageContainer = root.querySelector('#stage-container');
  const cardsDisplay = root.querySelector('#cards-display');
  const messageBox = root.querySelector('#message-box');

  function render() {
    const total = counts.hundreds * 100 + counts.tens * 10 + counts.ones;

    // 1. ステージ（塊グラフィック）の描画
    stageContainer.innerHTML = UNITS.map((u) => {
      const count = counts[u.key];
      let itemsHtml = '';
      
      // アイコンを個数分生成（上限15個で表示調整）
      const displayCount = Math.min(count, 15);
      for (let i = 0; i < displayCount; i++) {
        itemsHtml += getOrigamiSvg(u.key);
      }
      if (count > 15) {
        itemsHtml += `<span style="font-size:0.8rem; font-weight:bold; color:${u.color};">+${count - 15}</span>`;
      }

      return `
        <div class="stage-group">
          <div class="stage-items">${itemsHtml || '<span style="color:#cbd5e0; font-size:0.8rem;">(なし)</span>'}</div>
          <div class="stage-label" style="background-color: ${u.bg}; color: ${u.color}; border: 1px solid ${u.border};">
            ${u.title} × ${count}
          </div>
        </div>
      `;
    }).join('');

    // 2. カードの描画
    cardsDisplay.innerHTML = `
      <div class="card" style="border: 2px solid ${UNITS[0].border}; color: ${UNITS[0].color};">
        <div class="card-title">100のたば</div>
        <div class="card-value">${counts.hundreds * 100}</div>
      </div>
      <div class="operator">+</div>
      <div class="card" style="border: 2px solid ${UNITS[1].border}; color: ${UNITS[1].color};">
        <div class="card-title">10のたば</div>
        <div class="card-value">${counts.tens * 10}</div>
      </div>
      <div class="operator">+</div>
      <div class="card" style="border: 2px solid ${UNITS[2].border}; color: ${UNITS[2].color};">
        <div class="card-title">1まい</div>
        <div class="card-value">${counts.ones}</div>
      </div>
      <div class="operator">=</div>
      <div class="card" style="border: 2px solid #4a5568; background-color: #f7fafc; color: #2d3748;">
        <div class="card-title">できた数</div>
        <div class="card-value">${total.toLocaleString()}</div>
      </div>
    `;

    // 3. メッセージの描画
    messageBox.innerHTML = `
      100のたばが <strong>${counts.hundreds}個</strong>、10のたばが <strong>${counts.tens}個</strong>、1まいが <strong>${counts.ones}個</strong> で<br>
      あわせて <strong style="font-size: 1.2rem; color: #2b6cb0;">${total.toLocaleString()}</strong> です。
    `;
  }

  // イベントハンドラ（加算・減算・リセット）
  root.addEventListener('click', (event) => {
    const addKey = event.target.dataset.add;
    const subKey = event.target.dataset.sub;
    const isReset = event.target.hasAttribute('data-reset');

    if (addKey) {
      counts[addKey] = Math.min(99, counts[addKey] + 1);
      render();
    } else if (subKey) {
      counts[subKey] = Math.max(0, counts[subKey] - 1);
      render();
    } else if (isReset) {
      counts.hundreds = 0;
      counts.tens = 0;
      counts.ones = 0;
      render();
    }
  });

  render();
}
