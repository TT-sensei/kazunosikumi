// number-park: どこを比べればよいかを視覚的に強調する比較コンポーネント

export function initComparison(root) {
  if (!root) return;

  root.innerHTML = `
    <style>
      .np-comp-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        max-width: 680px;
        margin: 0 auto;
        padding: 1.25rem;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        color: #2d3748;
      }
      .np-comp-title {
        font-size: 1.1rem;
        font-weight: bold;
        color: #2b6cb0;
        margin-bottom: 0.3rem;
      }
      .np-comp-desc {
        font-size: 0.9rem;
        color: #4a5568;
        margin-bottom: 1rem;
      }
      .np-comp-presets {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1.25rem;
      }
      .np-preset-btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
        font-weight: bold;
        background: #edf2f7;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        cursor: pointer;
      }
      .np-preset-btn:hover { background: #e2e8f0; }

      .np-input-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .np-input-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: bold;
        color: #4a5568;
        margin-bottom: 0.3rem;
      }
      .np-input-group input {
        width: 100%;
        padding: 0.6rem;
        font-size: 1.2rem;
        font-weight: bold;
        border: 2px solid #cbd5e0;
        border-radius: 8px;
        box-sizing: border-box;
      }

      /* 位くらべ表（どこを見るか一目でわかるエリア） */
      .np-place-section {
        background: #fffaf0;
        border: 2px solid #fbd38d;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.25rem;
      }
      .np-place-header {
        font-size: 0.95rem;
        font-weight: bold;
        color: #c05621;
        margin-bottom: 0.75rem;
        text-align: center;
      }
      .np-place-table-wrapper {
        display: flex;
        justify-content: center;
        overflow-x: auto;
      }
      .np-place-table {
        display: flex;
        gap: 6px;
      }
      .np-place-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 52px;
        padding: 6px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
      }
      .np-place-column.is-key {
        background: #feebc8;
        border: 2px solid #dd6b20;
        transform: scale(1.05);
        box-shadow: 0 4px 10px rgba(221, 107, 32, 0.25);
      }
      .np-place-pointer {
        font-size: 0.8rem;
        font-weight: bold;
        height: 22px;
        color: #dd6b20;
        display: flex;
        align-items: center;
      }
      .np-place-name {
        font-size: 0.75rem;
        font-weight: bold;
        color: #718096;
        margin-bottom: 4px;
      }
      .np-digit-box {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        font-weight: bold;
        border-radius: 6px;
        margin-bottom: 4px;
      }
      .np-digit-a { background: #ebf8ff; color: #2b6cb0; }
      .np-digit-b { background: #feebc8; color: #c05621; }
      .np-place-column.is-key .np-digit-box {
        font-size: 1.6rem;
      }

      /* テープ図 */
      .np-visual-section {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.25rem;
      }
      .np-bar-row { margin-bottom: 0.8rem; }
      .np-bar-row:last-child { margin-bottom: 0; }
      .np-bar-label {
        font-size: 0.85rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
        display: flex;
        justify-content: space-between;
      }
      .np-bar-bg {
        height: 24px;
        background: #edf2f7;
        border-radius: 6px;
        overflow: hidden;
      }
      .np-bar-fill {
        height: 100%;
        border-radius: 6px;
        transition: width 0.4s ease;
      }
      .np-bar-a { background: #4299e1; }
      .np-bar-b { background: #ed8936; }

      /* 解説カード */
      .np-result-card {
        background: #ebf8ff;
        border: 2px solid #90cdf4;
        border-radius: 12px;
        padding: 1rem;
      }
      .np-symbol-box {
        text-align: center;
        font-size: 1.6rem;
        font-weight: bold;
        color: #2b6cb0;
        margin-bottom: 0.4rem;
      }
      .np-conclusion-text {
        font-size: 1.05rem;
        font-weight: bold;
        text-align: center;
        color: #1a202c;
        margin-bottom: 0.75rem;
      }
      .np-step-list {
        background: #ffffff;
        border-radius: 8px;
        padding: 0.8rem;
        font-size: 0.9rem;
        line-height: 1.6;
      }
    </style>

    <div class="np-comp-container">
      <div class="np-comp-title">🔍 どこを見る？ 数のくらべっこ</div>
      <div class="np-comp-desc">一番大きい位から順に見ていこう！ちがいがある位が「パッと」光るよ。</div>

      <div class="np-comp-presets">
        <span style="font-size:0.85rem; font-weight:bold; align-self:center;">ためしてみよう：</span>
        <button class="np-preset-btn" data-a="520" data-b="320">520 と 320（百の位で決まる）</button>
        <button class="np-preset-btn" data-a="532" data-b="520">532 と 520（十の位で決まる）</button>
        <button class="np-preset-btn" data-a="1000" data-b="999">1000 と 999（桁数がちがう）</button>
      </div>

      <div class="np-input-grid">
        <div class="np-input-group">
          <label>左の数 (A)</label>
          <input id="compare-a" type="number" value="520" min="0" />
        </div>
        <div class="np-input-group">
          <label>右の数 (B)</label>
          <input id="compare-b" type="number" value="320" min="0" />
        </div>
      </div>

      <!-- 位くらべ表（どこを見るか強調） -->
      <div class="np-place-section" id="compare-place"></div>

      <!-- テープ図 -->
      <div class="np-visual-section" id="compare-visual"></div>

      <!-- 結果・解説カード -->
      <div class="np-result-card" id="compare-result"></div>
    </div>
  `;

  const inputA = root.querySelector('#compare-a');
  const inputB = root.querySelector('#compare-b');
  const placeEl = root.querySelector('#compare-place');
  const visualEl = root.querySelector('#compare-visual');
  const resultEl = root.querySelector('#compare-result');

  const placeNames = ['一の位', '十の位', '百の位', '千の位', '万の位', '十万の位', '百万の位', '千万の位', '一億の位'];

  function formatNum(num) {
    return typeof num === 'number' ? num.toLocaleString('ja-JP') : num;
  }

  function render() {
    const a = Math.max(0, Number(inputA.value) || 0);
    const b = Math.max(0, Number(inputB.value) || 0);

    const strA = String(a);
    const strB = String(b);
    const maxLen = Math.max(strA.length, strB.length);

    // 桁を揃える（左側を0埋め）
    const paddedA = strA.padStart(maxLen, '0');
    const paddedB = strB.padStart(maxLen, '0');

    // 左（一番大きい位）から順に比較して、最初に数字が異なるインデックスを探す
    let keyIndex = -1;
    if (a !== b) {
      for (let i = 0; i < maxLen; i++) {
        if (paddedA[i] !== paddedB[i]) {
          keyIndex = i;
          break;
        }
      }
    }

    // 1. 位くらべ表のレンダリング
    let columnsHtml = '';
    for (let i = 0; i < maxLen; i++) {
      const placeName = placeNames[maxLen - 1 - i] || '位';
      const digitA = paddedA[i];
      const digitB = paddedB[i];
      const isKey = (i === keyIndex);

      columnsHtml += `
        <div class="np-place-column ${isKey ? 'is-key' : ''}">
          <div class="np-place-pointer">${isKey ? '👀 ここ！' : ''}</div>
          <div class="np-place-name">${placeName}</div>
          <div class="np-digit-box np-digit-a">${strA.length >= (maxLen - i) ? digitA : '-'}</div>
          <div class="np-digit-box np-digit-b">${strB.length >= (maxLen - i) ? digitB : '-'}</div>
        </div>
      `;
    }

    const keyPlaceName = keyIndex !== -1 ? (placeNames[maxLen - 1 - keyIndex] || '位') : '';
    placeEl.innerHTML = `
      <div class="np-place-header">
        ${keyIndex !== -1
          ? `👉 【<strong>${keyPlaceName}</strong>】 を見ると大きさがわかるよ！`
          : `どちらもまったく同じ数だよ！`
        }
      </div>
      <div class="np-place-table-wrapper">
        <div class="np-place-table">${columnsHtml}</div>
      </div>
    `;

    // 2. テープ図のレンダリング
    const maxVal = Math.max(a, b, 1);
    const pctA = Math.round((a / maxVal) * 100);
    const pctB = Math.round((b / maxVal) * 100);

    visualEl.innerHTML = `
      <div class="np-bar-row">
        <div class="np-bar-label">
          <span>🔵 A： ${formatNum(a)}</span>
        </div>
        <div class="np-bar-bg"><div class="np-bar-fill np-bar-a" style="width: ${pctA}%;"></div></div>
      </div>
      <div class="np-bar-row">
        <div class="np-bar-label">
          <span>🟠 B： ${formatNum(b)}</span>
        </div>
        <div class="np-bar-bg"><div class="np-bar-fill np-bar-b" style="width: ${pctB}%;"></div></div>
      </div>
    `;

    // 3. 解説テキスト
    const diff = Math.abs(a - b);
    let symbol = '＝';
    let conclusion = '';
    let steps = [];

    if (a === b) {
      symbol = '＝';
      conclusion = `どちらも 【 ${formatNum(a)} 】 で同じ大きさです`;
      steps = ['・すべての位の数字が同じなので、差は 0 です。'];
    } else {
      symbol = a > b ? '＞' : '＜';
      const biggerName = a > b ? 'A' : 'B';
      const biggerVal = Math.max(a, b);
      const smallerVal = Math.min(a, b);

      conclusion = `${biggerName} のほうが 【 ${formatNum(diff)} 】 大きい！`;

      steps.push(`・<strong>見分け方：</strong> 一番大きい位から順に見ていくと、<strong>【${keyPlaceName}】</strong> で差がついているよ！`);
      steps.push(`・<strong>ちがい：</strong> ${formatNum(biggerVal)} − ${formatNum(smallerVal)} ＝ <strong>${formatNum(diff)}</strong>`);
    }

    resultEl.innerHTML = `
      <div class="symbol-box np-symbol-box">${formatNum(a)} &nbsp;${symbol}&nbsp; ${formatNum(b)}</div>
      <div class="np-conclusion-text">${conclusion}</div>
      <div class="np-step-list">
        ${steps.map((s) => `<div>${s}</div>`).join('')}
      </div>
    `;
  }

  inputA.addEventListener('input', render);
  inputB.addEventListener('input', render);

  root.querySelectorAll('.np-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      inputA.value = btn.dataset.a;
      inputB.value = btn.dataset.b;
      render();
    });
  });

  render();
}
