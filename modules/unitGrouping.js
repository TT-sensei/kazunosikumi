/**
 * number-park: 単位グループ分けモジュール
 */
const UNITS = [
  { value: 1, label: '1 （一）', sub: '一' },
  { value: 10, label: '10 （十）', sub: '十' },
  { value: 100, label: '100 （百）', sub: '百' },
  { value: 1000, label: '1,000 （千）', sub: '千' },
  { value: 10000, label: '10,000 （1万）', sub: '1万' },
  { value: 100000, label: '100,000 （10万）', sub: '10万' },
  { value: 1000000, label: '1,000,000 （100万）', sub: '100万' },
  { value: 10000000, label: '10,000,000 （1000万）', sub: '1000万' }
];

export function initUnitGrouping(root) {
  if (!root) return;

  root.innerHTML = `
    <style>
      .number-park {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 680px;
        margin: 0 auto;
        padding: 1rem;
        box-sizing: border-box;
      }
      .number-park * {
        box-sizing: border-box;
      }
      .number-park .description {
        font-size: 0.95rem;
        color: #4a5568;
        margin-bottom: 1rem;
        line-height: 1.5;
      }
      .number-park .input-grid {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        background: #f7fafc;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      .number-park .input-grid label {
        display: flex;
        flex-direction: column;
        font-weight: 600;
        font-size: 0.875rem;
        flex: 1;
        color: #2d3748;
      }
      .number-park .input-grid input,
      .number-park .input-grid select {
        margin-top: 0.5rem;
        padding: 0.6rem 0.8rem;
        font-size: 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        background-color: #ffffff;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .number-park .input-grid input:focus,
      .number-park .input-grid select:focus {
        border-color: #3182ce;
        box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
      }
      
      /* 数式カードエリア */
      .number-park .cards-display {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1.5rem 0;
        padding: 1.5rem 0.75rem;
        background: #edf2f7;
        border-radius: 12px;
      }
      .number-park .card {
        background: #ffffff;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
        text-align: center;
        min-width: 95px;
      }
      .number-park .card-title {
        font-size: 0.75rem;
        color: #718096;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .number-park .card-value {
        font-size: 1.25rem;
        font-weight: 700;
        word-break: break-all;
      }
      .number-park .card-sub {
        font-size: 0.75rem;
        font-weight: 400;
        margin-top: 0.2rem;
        opacity: 0.85;
      }

      /* カードカラー設定 */
      .number-park .card-unit {
        border: 2px solid #3182ce;
        color: #2b6cb0;
      }
      .number-park .card-count {
        border: 2px solid #38a169;
        color: #2f855a;
      }
      .number-park .card-remainder {
        border: 2px solid #dd6b20;
        color: #c05621;
        background-color: #fffaf0;
      }
      .number-park .card-total {
        border: 2px solid #4a5568;
        color: #2d3748;
        background-color: #f7fafc;
      }
      .number-park .operator {
        font-size: 1.25rem;
        font-weight: bold;
        color: #a0aec0;
        user-select: none;
      }

      /* 解説メッセージ */
      .number-park .message-box {
        text-align: center;
        padding: 1.25rem 1rem;
        border-radius: 10px;
        font-size: 1rem;
        line-height: 1.6;
      }
      .number-park .message-box.perfect {
        background: #e6fffa;
        color: #234e52;
        border: 1px solid #b2f5ea;
      }
      .number-park .message-box.remainder {
        background: #fffaf0;
        color: #744210;
        border: 1px solid #feebc8;
      }
    </style>

    <div class="number-park">
      <p class="description">「1000が290こで290000（29万）」のように、単位がいくつ分あるかを調べます。</p>
      
      <div class="input-grid">
        <label>調べたい数
          <input id="group-total" type="number" min="0" value="290000">
        </label>
        <label>単位
          <select id="group-unit">
            ${UNITS.map((u) => `
              <option value="${u.value}" ${u.value === 1000 ? 'selected' : ''}>
                ${u.label}
              </option>
            `).join('')}
          </select>
        </label>
      </div>

      <div class="cards-display" id="cards-display"></div>
      <div class="message-box" id="message-box"></div>
    </div>
  `;

  const totalInput = root.querySelector('#group-total');
  const unitSelect = root.querySelector('#group-unit');
  const cardsDisplay = root.querySelector('#cards-display');
  const messageBox = root.querySelector('#message-box');

  function render() {
    const total = Math.max(0, Number(totalInput.value) || 0);
    const unitVal = Number(unitSelect.value);
    
    const selectedUnit = UNITS.find((u) => u.value === unitVal) || UNITS[0];

    const count = Math.floor(total / unitVal);
    const remainder = total % unitVal;

    const fmtTotal = total.toLocaleString();
    const fmtUnit = unitVal.toLocaleString();
    const fmtCount = count.toLocaleString();
    const fmtRemainder = remainder.toLocaleString();

    // 1. 数式カードの生成
    let cardsHtml = `
      <div class="card card-unit">
        <div class="card-title">単位</div>
        <div class="card-value">${fmtUnit}</div>
        <div class="card-sub">（${selectedUnit.sub}）</div>
      </div>
      <div class="operator">×</div>
      <div class="card card-count">
        <div class="card-title">集まった数</div>
        <div class="card-value">${fmtCount} 個</div>
      </div>
    `;

    if (remainder > 0) {
      cardsHtml += `
        <div class="operator">+</div>
        <div class="card card-remainder">
          <div class="card-title">あまり</div>
          <div class="card-value">${fmtRemainder}</div>
        </div>
      `;
    }

    cardsHtml += `
      <div class="operator">=</div>
      <div class="card card-total">
        <div class="card-title">もとの数</div>
        <div class="card-value">${fmtTotal}</div>
      </div>
    `;

    cardsDisplay.innerHTML = cardsHtml;

    // 2. 解説文の表示
    if (remainder === 0) {
      messageBox.className = 'message-box perfect';
      messageBox.innerHTML = `
        <strong>ぴったり分けられました！</strong><br>
        <strong>${fmtTotal}</strong> は、<strong>${fmtUnit}（${selectedUnit.sub}）</strong> が <strong>${fmtCount} 個</strong> 集まった数です。
      `;
    } else {
      messageBox.className = 'message-box remainder';
      messageBox.innerHTML = `
        <strong>あまりがでました。</strong><br>
        <strong>${fmtTotal}</strong> は、<strong>${fmtUnit}（${selectedUnit.sub}）</strong> が <strong>${fmtCount} 個</strong> と、あまりが <strong>${fmtRemainder}</strong> になります。
      `;
    }
  }

  totalInput.addEventListener('input', render);
  unitSelect.addEventListener('change', render);

  render();
}
