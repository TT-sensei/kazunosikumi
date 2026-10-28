/**
 * number-park: くらいどり・数づくりモジュール（折り紙束表示対応）
 * 10000のたば・1000のたば・100のたば・10のたば・1まいを扱える。
 * 「どこまで作る？」で扱う位の範囲を切り替える。
 */
const UNITS = [
  {
    key: 'tenThousands',
    label: '10000',
    value: 10000,
    title: '10000のたば',
    sub: '10000枚入り',
    color: '#6b46c1',
    bg: '#faf5ff',
    border: '#d6bcfa',
    btnBg: '#805ad5'
  },
  {
    key: 'thousands',
    label: '1000',
    value: 1000,
    title: '1000のたば',
    sub: '1000枚入り',
    color: '#276749',
    bg: '#f0fff4',
    border: '#9ae6b4',
    btnBg: '#38a169'
  },
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

// 扱う位の範囲（小さい位から何位まで使うか）
const RANGES = [
  { places: 3, label: '100のたばまで' },
  { places: 4, label: '1000のたばまで' },
  { places: 5, label: '10000のたばまで' }
];

// SVGアイコン生成（折り紙の束）
function getOrigamiSvg(type) {
  if (type === 'tenThousands') {
    // 10000の束（大きな箱）
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
    // 1000の束（重なった束）
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

  const counts = { tenThousands: 0, thousands: 0, hundreds: 2, tens: 3, ones: 5 }; // 初期値
  let rangePlaces = 3; // 最初は100のたばまで

  const activeUnits = () => UNITS.slice(UNITS.length - rangePlaces);

  root.innerHTML = `
    <style>
      .number-park-composer {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 860px;
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

      /* 範囲切り替え */
      .number-park-composer .range-panel {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .number-park-composer .range-label {
        font-size: 0.85rem;
        font-weight: bold;
        color: #4a5568;
      }
      .number-park-composer .range-chip {
        background: #edf2f7;
        color: #4a5568;
        border: 2px solid transparent;
        padding: 0.45rem 0.8rem;
        font-size: 0.85rem;
      }
      .number-park-composer .range-chip.is-active {
        background: #3182ce;
        color: #ffffff;
        border-color: #2b6cb0;
      }

      /* 操作ボタンエリア */
      .number-park-composer .control-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
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
      <p class="description">ボタンを押して折り紙の束をあつめ、数をつくります。「どこまで作る？」で、10000のたばまで広げられます。</p>

      <div class="range-panel">
        <span class="range-label">どこまで作る？</span>
        <span id="range-chips"></span>
        <span style="flex:1"></span>
        <button class="btn-reset" data-reset>0にもどす</button>
      </div>

      <!-- 操作パネル -->
      <div class="control-panel" id="control-panel"></div>

      <!-- 折り紙の塊表示ステージ -->
      <div class="stage-container" id="stage-container"></div>

      <!-- 数式カード -->
      <div class="cards-display" id="cards-display"></div>

      <!-- 解説テキスト -->
      <div class="message-box" id="message-box"></div>
    </div>
  `;

  const rangeChips = root.querySelector('#range-chips');
  const controlPanel = root.querySelector('#control-panel');
  const stageContainer = root.querySelector('#stage-container');
  const cardsDisplay = root.querySelector('#cards-display');
  const messageBox = root.querySelector('#message-box');

  function render() {
    const units = activeUnits();
    const total = units.reduce((sum, u) => sum + counts[u.key] * u.value, 0);

    // 0. 範囲チップ
    rangeChips.innerHTML = RANGES.map((r) => `
      <button class="range-chip ${r.places === rangePlaces ? 'is-active' : ''}" data-range="${r.places}">${r.label}</button>
    `).join('');

    // 0.5 操作パネル
    controlPanel.innerHTML = units.map((u) => `
      <div class="unit-control" style="border-color: ${u.border}; background-color: ${u.bg};">
        <div class="unit-control-title" style="color: ${u.color};">${u.title}</div>
        <div class="btn-group">
          <button class="btn-add" data-add="${u.key}" style="background-color: ${u.btnBg};">+ ${u.label}</button>
          <button class="btn-sub" data-sub="${u.key}">-</button>
        </div>
      </div>
    `).join('');

    // 1. ステージ（塊グラフィック）の描画
    stageContainer.innerHTML = units.map((u) => {
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
      ${units.map((u, i) => `
        ${i > 0 ? '<div class="operator">+</div>' : ''}
        <div class="card" style="border: 2px solid ${u.border}; color: ${u.color};">
          <div class="card-title">${u.title}</div>
          <div class="card-value">${(counts[u.key] * u.value).toLocaleString()}</div>
        </div>
      `).join('')}
      <div class="operator">=</div>
      <div class="card" style="border: 2px solid #4a5568; background-color: #f7fafc; color: #2d3748;">
        <div class="card-title">できた数</div>
        <div class="card-value">${total.toLocaleString()}</div>
      </div>
    `;

    // 3. メッセージの描画
    const parts = units.map((u) => `${u.title}が <strong>${counts[u.key]}個</strong>`);
    messageBox.innerHTML = `
      ${parts.join('、')} で<br>
      あわせて <strong style="font-size: 1.2rem; color: #2b6cb0;">${total.toLocaleString()}</strong> です。
    `;
  }

  // イベントハンドラ（加算・減算・リセット・範囲切替）
  root.addEventListener('click', (event) => {
    const addKey = event.target.dataset.add;
    const subKey = event.target.dataset.sub;
    const range = event.target.dataset.range;
    const isReset = event.target.hasAttribute('data-reset');

    if (addKey) {
      counts[addKey] = Math.min(99, counts[addKey] + 1);
      render();
    } else if (subKey) {
      counts[subKey] = Math.max(0, counts[subKey] - 1);
      render();
    } else if (range) {
      rangePlaces = Number(range);
      // 範囲外の位は0にもどす（見えない束が合計に残らないように）
      UNITS.forEach((u) => {
        if (!activeUnits().includes(u)) counts[u.key] = 0;
      });
      render();
    } else if (isReset) {
      UNITS.forEach((u) => { counts[u.key] = 0; });
      render();
    }
  });

  render();
}
