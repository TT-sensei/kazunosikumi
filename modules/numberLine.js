/**
 * number-park: とび数・数直線モジュール
 */
const STEPS = [
  { value: 1, label: '1ずつ' },
  { value: 2, label: '2とび' },
  { value: 5, label: '5とび' },
  { value: 10, label: '10とび' },
  { value: 50, label: '50とび' },
  { value: 100, label: '100とび' }
];

export function initNumberLine(root) {
  if (!root) return;

  root.innerHTML = `
    <style>
      .number-park-line {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        max-width: 720px;
        margin: 0 auto;
        padding: 1rem;
        box-sizing: border-box;
      }
      .number-park-line * {
        box-sizing: border-box;
      }
      .number-park-line .description {
        font-size: 0.95rem;
        color: #4a5568;
        margin-bottom: 1rem;
        line-height: 1.5;
      }
      .number-park-line .input-grid {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.25rem;
        background: #f7fafc;
        padding: 1.25rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      .number-park-line .input-grid label {
        display: flex;
        flex-direction: column;
        font-weight: 600;
        font-size: 0.875rem;
        flex: 1;
        color: #2d3748;
      }
      .number-park-line .input-grid select,
      .number-park-line .input-grid input[type="range"] {
        margin-top: 0.5rem;
        height: 40px;
      }
      .number-park-line .input-grid select {
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        background-color: #ffffff;
      }
      .number-park-line .input-grid input[type="range"] {
        accent-color: #3182ce;
        cursor: pointer;
      }

      /* 数直線（SVGエリア） */
      .number-park-line .line-container {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem 0.5rem;
        margin-bottom: 1.25rem;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
      }
      .number-park-line svg {
        width: 100%;
        height: auto;
        display: block;
        overflow: visible;
      }

      /* 数式カードエリア */
      .number-park-line .cards-display {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1.25rem 0;
        padding: 1.25rem 0.75rem;
        background: #edf2f7;
        border-radius: 12px;
      }
      .number-park-line .card {
        background: #ffffff;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
        text-align: center;
        min-width: 95px;
      }
      .number-park-line .card-title {
        font-size: 0.75rem;
        color: #718096;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }
      .number-park-line .card-value {
        font-size: 1.25rem;
        font-weight: 700;
      }
      .number-park-line .card-step {
        border: 2px solid #3182ce;
        color: #2b6cb0;
      }
      .number-park-line .card-jump {
        border: 2px solid #38a169;
        color: #2f855a;
      }
      .number-park-line .card-result {
        border: 2px solid #805ad5;
        color: #553c9a;
        background-color: #faf5ff;
      }
      .number-park-line .operator {
        font-size: 1.25rem;
        font-weight: bold;
        color: #a0aec0;
        user-select: none;
      }

      /* メッセージエリア */
      .number-park-line .message-box {
        text-align: center;
        padding: 1rem;
        border-radius: 10px;
        font-size: 1rem;
        background: #ebf8ff;
        color: #2b6cb0;
        border: 1px solid #bee3f8;
        line-height: 1.6;
      }
    </style>

    <div class="number-park-line">
      <p class="description">スライダーを動かして、いくつずつ増えていくか（とび数）のならびを調べます。</p>
      
      <div class="input-grid">
        <label>とび数
          <select id="line-step">
            ${STEPS.map((s) => `<option value="${s.value}">${s.label}</option>`).join('')}
          </select>
        </label>
        <label>ジャンプ回数 （<span id="jump-count-label">3</span> 回）
          <input id="line-slider" type="range" min="0" max="15" value="3">
        </label>
      </div>

      <!-- 数直線描画キャンバス (SVG) -->
      <div class="line-container">
        <svg id="number-line-svg" viewBox="0 0 800 160"></svg>
      </div>

      <!-- 数式カード -->
      <div class="cards-display" id="cards-display"></div>

      <!-- 解説文 -->
      <div class="message-box" id="message-box"></div>
    </div>
  `;

  const stepSelect = root.querySelector('#line-step');
  const slider = root.querySelector('#line-slider');
  const jumpCountLabel = root.querySelector('#jump-count-label');
  const svg = root.querySelector('#number-line-svg');
  const cardsDisplay = root.querySelector('#cards-display');
  const messageBox = root.querySelector('#message-box');

  function render() {
    const step = Number(stepSelect.value);
    const jump = Number(slider.value);
    const maxJumps = Number(slider.max);
    const currentNumber = step * jump;

    jumpCountLabel.textContent = jump;

    // 1. SVGのパラメータ設定
    const svgWidth = 800;
    const paddingX = 45;
    const lineY = 110;
    const usableWidth = svgWidth - paddingX * 2;
    const stepWidth = usableWidth / maxJumps;

    let svgContent = '';

    // ① 数直線の土台（メインの水平線）
    svgContent += `<line x1="${paddingX - 15}" y1="${lineY}" x2="${svgWidth - paddingX + 15}" y2="${lineY}" stroke="#cbd5e0" stroke-width="4" stroke-linecap="round"/>`;

    // ② 目盛りと数字の描画
    for (let i = 0; i <= maxJumps; i++) {
      const x = paddingX + i * stepWidth;
      const numValue = (i * step).toLocaleString();
      const isReached = i <= jump;

      // 目盛り線
      const tickColor = isReached ? '#3182ce' : '#a0aec0';
      const tickHeight = i % 5 === 0 ? 14 : 8; // 5回ごとに目盛りを少し長く
      svgContent += `<line x1="${x}" y1="${lineY}" x2="${x}" y2="${lineY + tickHeight}" stroke="${tickColor}" stroke-width="${i % 5 === 0 ? 3 : 2}"/>`;

      // 数字ラベル（文字サイズは桁数に合わせて自動調整）
      const fontSize = numValue.length > 4 ? '10px' : '11px';
      const textColor = i === jump ? '#2b6cb0' : '#4a5568';
      const fontWeight = i === jump ? 'bold' : 'normal';

      svgContent += `
        <text x="${x}" y="${lineY + 30}" 
              font-size="${fontSize}" 
              font-weight="${fontWeight}"
              fill="${textColor}" 
              text-anchor="middle">
          ${numValue}
        </text>
      `;
    }

    // ③ ジャンプの軌跡（アーチ線）
    for (let i = 0; i < jump; i++) {
      const x1 = paddingX + i * stepWidth;
      const x2 = paddingX + (i + 1) * stepWidth;
      const midX = (x1 + x2) / 2;
      const arcHeight = Math.min(stepWidth * 0.7, 45); // ステップ幅に応じたアーチの高さ
      const controlY = lineY - arcHeight;

      svgContent += `
        <path d="M ${x1} ${lineY} Q ${midX} ${controlY} ${x2} ${lineY}" 
              fill="none" 
              stroke="#4299e1" 
              stroke-width="2.5" 
              stroke-dasharray="4 2"/>
      `;
    }

    // ④ 現在地のピン・マーカー (カエル風の可愛いドットアイコン)
    const currentX = paddingX + jump * stepWidth;
    svgContent += `
      <!-- 波紋エフェクト -->
      <circle cx="${currentX}" cy="${lineY}" r="12" fill="#3182ce" opacity="0.25"/>
      <!-- メインピン -->
      <circle cx="${currentX}" cy="${lineY}" r="7" fill="#3182ce" stroke="#ffffff" stroke-width="2"/>
      <!-- 上部の吹き出し数値 -->
      <g transform="translate(${currentX}, ${lineY - 38})">
        <rect x="-24" y="-16" width="48" height="22" rx="6" fill="#2b6cb0"/>
        <polygon points="0,10 -5,6 5,6" fill="#2b6cb0"/>
        <text x="0" y="-1" fill="#ffffff" font-size="11px" font-weight="bold" text-anchor="middle">
          ${currentNumber.toLocaleString()}
        </text>
      </g>
    `;

    svg.innerHTML = svgContent;

    // 2. 数式カードの生成
    cardsDisplay.innerHTML = `
      <div class="card card-step">
        <div class="card-title">とび数</div>
        <div class="card-value">${step.toLocaleString()}</div>
      </div>
      <div class="operator">×</div>
      <div class="card card-jump">
        <div class="card-title">ジャンプ</div>
        <div class="card-value">${jump} 回</div>
      </div>
      <div class="operator">=</div>
      <div class="card card-result">
        <div class="card-title">ついた数</div>
        <div class="card-value">${currentNumber.toLocaleString()}</div>
      </div>
    `;

    // 3. メッセージの生成
    messageBox.innerHTML = `
      <strong>${step.toLocaleString()}</strong> ずつ <strong>${jump} 回</strong> ジャンプすると、<strong>${currentNumber.toLocaleString()}</strong> に着きます。
    `;
  }

  stepSelect.addEventListener('change', render);
  slider.addEventListener('input', render);

  render();
}
