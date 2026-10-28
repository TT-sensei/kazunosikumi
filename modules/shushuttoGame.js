const SG_LEVELS = [
  { label: '100まで', detail: '10と1でつくる', min: 10, max: 99, units: [10, 1] },
  { label: '1000まで', detail: '100・10・1でつくる', min: 100, max: 999, units: [100, 10, 1] },
  { label: '10000まで', detail: '1000・100・10・1でつくる', min: 1000, max: 9999, units: [1000, 100, 10, 1] }
];

const SG_UNITS = {
  1: { name: '1の手裏剣', short: '手裏剣', symbol: '✦' },
  10: { name: '10の弾', short: 'エネルギー弾', symbol: '●' },
  100: { name: '100の大手裏剣', short: '大手裏剣', symbol: '✹' },
  1000: { name: '1000の月手裏剣', short: '月の手裏剣', symbol: '☄' }
};

export function initShushuttoGame(root) {
  if (!root) return;

  let levelIndex = 0;
  let mode = 'exact';
  let target = makeTarget();
  let total = 0;
  let history = [];
  let completed = false;

  function makeTarget() {
    const level = SG_LEVELS[levelIndex];
    return Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
  }

  function resetRound(nextTarget = false) {
    total = 0;
    history = [];
    completed = false;
    if (nextTarget) target = makeTarget();
    render();
  }

  function unitCount(unit) {
    return history.filter(item => item === unit).length;
  }

  function minThrowsFor(number) {
    return String(number).split('').reduce((sum, digit) => sum + Number(digit), 0);
  }

  function actualExpression() {
    const level = SG_LEVELS[levelIndex];
    const parts = level.units
      .filter(unit => unitCount(unit) > 0)
      .map(unit => `${unit} × ${unitCount(unit)}`);
    return parts.length ? parts.join(' ＋ ') : 'まだ投げていません';
  }

  function throwUnit(unit) {
    if (completed || total > target) return;
    history.push(unit);
    total += unit;
    completed = total === target;
    render();
    launchProjectile(unit);
  }

  function undoLast() {
    if (!history.length || completed) return;
    total -= history.pop();
    render();
  }

  function launchProjectile(unit) {
    const scene = root.querySelector('.sg-scene');
    if (!scene) return;
    const projectile = document.createElement('span');
    projectile.className = `sg-projectile unit-${unit}`;
    projectile.textContent = SG_UNITS[unit].symbol;
    projectile.setAttribute('aria-hidden', 'true');
    scene.append(projectile);
    requestAnimationFrame(() => projectile.classList.add('is-flying'));
    projectile.addEventListener('animationend', () => projectile.remove(), { once: true });
    window.setTimeout(() => projectile.remove(), 1000);
  }

  function render() {
    const level = SG_LEVELS[levelIndex];
    const remaining = target - total;
    const over = total > target;
    const won = completed;
    const used = history.length;
    const minimum = minThrowsFor(target);
    const modeCaption = mode === 'exact'
      ? '数をよく見て、ぴったりになるように投げよう。'
      : 'できるだけ少ない投数で、お宝の数を完成させよう。';
    let status = '';
    let statusClass = '';

    if (won) {
      statusClass = ' is-success';
      if (mode === 'treasure') {
        status = `<strong>大成功！ お宝ゲット！</strong> ${used}投で完成！この数を作る最小の投数は${minimum}投だよ。${used === minimum ? '最小投数でクリア！名人だ！' : '次は、もっと少ない投数の組み合わせも探してみよう。'}`;
      } else {
        status = '<strong>ぴったり！ クリア！</strong> 目標の数ができたよ。どんな数を何回投げたか、見てみよう！';
      }
    } else if (over) {
      statusClass = ' is-over';
      status = `<strong>あっ、こえちゃった！</strong> 目標より ${total - target} 大きいよ。「1つ戻す」で最後の手裏剣を戻せるよ。`;
    } else {
      status = `<strong>あと ${remaining}！</strong> ${mode === 'treasure' ? '大きな数の弾を使うと、投数をへらせるかも？' : 'どの手裏剣を使うと、ぴったりになるかな？'}`;
    }

    const units = level.units.map(unit => {
      const meta = SG_UNITS[unit];
      return `
        <button class="sg-throw-btn sg-unit-${unit}" type="button" data-unit="${unit}" ${won || over ? 'disabled' : ''} aria-label="${unit}の弾を1回投げる">
          <span class="sg-throw-symbol" aria-hidden="true">${meta.symbol}</span>
          <strong>${unit.toLocaleString('ja-JP')}</strong>
          <small>${meta.short}</small>
        </button>`;
    }).join('');

    const chips = level.units.map(unit => `
      <span class="sg-count-chip"><b>${unit.toLocaleString('ja-JP')}</b> を ${unitCount(unit)}こ</span>
    `).join('');

    const breakdown = level.units.map(unit => {
      const digit = Math.floor(target / unit) % 10;
      return `
        <div class="sg-breakdown-item sg-unit-${unit}">
          <span>${unit.toLocaleString('ja-JP')}のまとまり</span>
          <strong>${digit}こ</strong>
        </div>`;
    }).join('');

    root.innerHTML = `
      <div class="sg-game">
        <div class="sg-intro">
          <div class="sg-intro-copy">
            <span class="sg-kicker">NUMBER NINJA TRAINING</span>
            <h3 class="sg-title">シュシュっと かず作り</h3>
            <p>数字をシュシュッと飛ばして、目標の数を完成させよう！<br>遊びながら、数のまとまりや位取りを発見しよう。</p>
          </div>
          <div class="sg-ninja-mark" aria-hidden="true">🥷</div>
        </div>

        <div class="sg-choice-block">
          <div class="sg-control-heading">
            <div><h3>修行のレベル</h3><p>今の学習に合うレベルを選ぼう。</p></div>
          </div>
          <div class="sg-levels" role="group" aria-label="修行のレベル">
            ${SG_LEVELS.map((item, index) => `
              <button class="sg-level-btn ${index === levelIndex ? 'is-selected' : ''}" type="button" data-level="${index}" aria-pressed="${index === levelIndex}">
                <strong>${item.label}</strong><span>${item.detail}</span>
              </button>`).join('')}
          </div>
        </div>

        <div class="sg-mode-row">
          <div class="sg-mode-toggle" role="group" aria-label="ゲームモード">
            <button class="sg-mode-btn ${mode === 'exact' ? 'is-selected' : ''}" type="button" data-mode="exact" aria-pressed="${mode === 'exact'}">🎯 ぴったりモード</button>
            <button class="sg-mode-btn ${mode === 'treasure' ? 'is-selected' : ''}" type="button" data-mode="treasure" aria-pressed="${mode === 'treasure'}">💎 お宝モード</button>
          </div>
          <p class="sg-footnote">${modeCaption}</p>
        </div>

        <div class="sg-scene" aria-label="目標の数を作るゲーム画面">
          <span class="sg-scene-spark one" aria-hidden="true">✧</span>
          <span class="sg-scene-spark two" aria-hidden="true">✦</span>
          <span class="sg-scene-spark three" aria-hidden="true">✧</span>
          <div class="sg-mission">
            <p class="sg-mission-label">今回の目標</p>
            <div class="sg-target-number" aria-live="polite">${target.toLocaleString('ja-JP')}</div>
            <p class="sg-progress-copy">いまの数<br><span>${total.toLocaleString('ja-JP')}</span> ／ ${target.toLocaleString('ja-JP')}</p>
          </div>
          <div class="sg-scene-figure">
            <div class="sg-target" aria-hidden="true"><span>${target.toLocaleString('ja-JP')}</span></div>
            <div class="sg-ninja" aria-hidden="true">🥷</div>
          </div>
        </div>

        <div class="sg-control-card">
          <div class="sg-control-heading">
            <div><h3>どの数を投げる？</h3><p>ボタンを押すと、手裏剣がシュシュッと飛ぶよ。</p></div>
          </div>
          <div class="sg-throw-grid">${units}</div>
          <div class="sg-counts" aria-label="これまでに投げた数">${chips}</div>
          <div class="sg-status${statusClass}" role="status" aria-live="polite">${status}</div>
          ${won ? `
            <div class="sg-result-area">
              <p class="sg-footnote">今回のつくり方：<strong>${actualExpression()}</strong></p>
              <h3>目標の数のしくみ</h3>
              <div class="sg-breakdown">${breakdown}</div>
              <p class="sg-footnote" style="margin-top:10px">${target.toLocaleString('ja-JP')} は、${breakdownText(target, level.units)} でできているよ。</p>
            </div>` : ''}
          <div class="sg-actions">
            ${won
              ? '<button class="sg-action-btn sg-action-primary" type="button" data-action="next">つぎのミッション！</button>'
              : '<button class="sg-action-btn sg-action-secondary" type="button" data-action="undo" ' + (!history.length ? 'disabled' : '') + '>↩ 1つ戻す</button>'}
            <button class="sg-action-btn sg-action-gold" type="button" data-action="reset">${won ? '同じ数でもう一度' : '最初からやりなおす'}</button>
          </div>
        </div>
        <p class="sg-footnote">ヒント：100は10が10こ分、1000は100が10こ分だよ。いろいろな作り方を試してみよう。</p>
      </div>`;

    root.querySelectorAll('[data-level]').forEach(button => {
      button.addEventListener('click', () => {
        levelIndex = Number(button.dataset.level);
        target = makeTarget();
        resetRound();
      });
    });

    root.querySelectorAll('[data-mode]').forEach(button => {
      button.addEventListener('click', () => {
        mode = button.dataset.mode;
        render();
      });
    });

    root.querySelectorAll('[data-unit]').forEach(button => {
      button.addEventListener('click', () => throwUnit(Number(button.dataset.unit)));
    });

    root.querySelector('[data-action="undo"]')?.addEventListener('click', undoLast);
    root.querySelector('[data-action="reset"]')?.addEventListener('click', () => resetRound());
    root.querySelector('[data-action="next"]')?.addEventListener('click', () => resetRound(true));
  }

  render();
}

function breakdownText(number, units) {
  return units.map(unit => {
    const count = Math.floor(number / unit) % 10;
    return `${unit.toLocaleString('ja-JP')}が${count}こ`;
  }).join('、');
}
