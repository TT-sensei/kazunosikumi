import { celebrate } from './numberParkFeatures.js';

const SG_LEVELS = [
  { label: '100まで', detail: '10と1でつくる', min: 10, max: 99, units: [10, 1] },
  { label: '1000まで', detail: '100・10・1でつくる', min: 100, max: 999, units: [100, 10, 1] },
  { label: '10000まで', detail: '1000・100・10・1でつくる', min: 1000, max: 9999, units: [1000, 100, 10, 1] }
];
const SG_UNITS = {
  1: { short: '1の手裏剣', symbol: '✦' },
  10: { short: '10の弾', symbol: '●' },
  100: { short: '100の大手裏剣', symbol: '✹' },
  1000: { short: '1000の月手裏剣', symbol: '☄' }
};
const FANTASY_RIKU = 'https://tt-sensei.github.io/navi-character-/assets/web/fantasy/riku-ninja.webp';

export function initShushuttoGame(root) {
  if (!root) return;
  let levelIndex = 0, mode = 'exact', target = makeTarget(), total = 0;
  let history = [], completed = false, soundOn = true, audioContext = null, roundToken = 0;

  function makeTarget() {
    const level = SG_LEVELS[levelIndex];
    return Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
  }
  function unitCount(unit) { return history.filter(item => item === unit).length; }
  function countText(n) { return n.toLocaleString('ja-JP'); }
  function playTone(freq, duration, type = 'sine', volume = .045, delay = 0) {
    if (!soundOn) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext ||= new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();
      const start = audioContext.currentTime + delay;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(start); oscillator.stop(start + duration + .02);
    } catch (_) { /* 音声が使えない環境でもゲームは続けられる */ }
  }
  function soundThrow(unit) {
    playTone(unit >= 100 ? 520 : 760, .11, 'triangle', .035);
    playTone(unit >= 100 ? 260 : 390, .13, 'sine', .025, .035);
  }
  function soundHit() {
    playTone(880, .09, 'triangle', .05);
    playTone(1320, .14, 'sine', .035, .045);
  }
  function soundClear() {
    [523, 659, 784, 1047].forEach((freq, i) => playTone(freq, .22, 'sine', .045, i * .09));
  }
  function resetRound(nextTarget = false) {
    roundToken++;
    total = 0; history = []; completed = false;
    if (nextTarget) target = makeTarget();
    render();
  }
  function breakdownText(number, units) {
    return units.map(unit => `${countText(unit)}が${Math.floor(number / unit) % 10}こ`).join('、');
  }
  function actualExpression() {
    const parts = SG_LEVELS[levelIndex].units.filter(unit => unitCount(unit) > 0).map(unit => `${unit} × ${unitCount(unit)}`);
    return parts.length ? parts.join(' ＋ ') : 'まだ投げていません';
  }
  function launchProjectile(unit, token) {
    const scene = root.querySelector('.sg-scene');
    if (!scene) return;
    const projectile = document.createElement('span');
    projectile.className = `sg-projectile unit-${unit}`;
    projectile.textContent = SG_UNITS[unit].symbol;
    projectile.setAttribute('aria-hidden', 'true');
    scene.append(projectile);
    requestAnimationFrame(() => projectile.classList.add('is-flying'));
    projectile.addEventListener('animationend', () => {
      projectile.remove();
      if (token !== roundToken) return;
      soundHit();
      const number = root.querySelector('.sg-current-number');
      if (number) number.classList.add('sg-number-pop');
      if (completed) soundClear();
    }, { once: true });
    window.setTimeout(() => projectile.remove(), 1100);
  }
  function throwUnit(unit) {
    if (completed || total > target) return;
    const before = total, token = roundToken;
    history.push(unit); total += unit; completed = total === target;
    soundThrow(unit);
    render();
    if (completed) celebrate();
    const scene = root.querySelector('.sg-scene');
    if (scene) {
      scene.classList.remove('sg-impact', 'sg-impact-over');
      void scene.offsetWidth;
      scene.classList.add(total > target ? 'sg-impact-over' : 'sg-impact');
    }
    const flying = root.querySelector('.sg-flying-total');
    if (flying) {
      flying.textContent = `${countText(before)} → ${countText(total)}`;
      flying.classList.add('is-visible');
    }
    launchProjectile(unit, token);
  }
  function undoLast() {
    if (!history.length || completed) return;
    total -= history.pop();
    render();
  }

  function render() {
    const level = SG_LEVELS[levelIndex], remaining = target - total;
    const over = total > target, won = completed, used = history.length;
    let status = '', statusClass = '';
    if (won) {
      statusClass = ' is-success';
      status = mode === 'treasure'
        ? `<strong>大成功！ お宝ゲット！</strong>${used}投で完成！もっと少ない投数の組み合わせも探してみよう。`
        : '<strong>ぴったり！ クリア！</strong>目標の数ができたよ。どんな数を何回投げたか、見てみよう！';
    } else if (over) {
      statusClass = ' is-over';
      status = `<strong>あっ、こえちゃった！</strong>目標より ${countText(total - target)} 大きいよ。「1つ戻す」で最後の手裏剣を戻せるよ。`;
    } else {
      status = `<strong>あと ${countText(remaining)}！</strong>${mode === 'treasure' ? '大きな数の弾を使うと、投数をへらせるかも？' : 'どの手裏剣を使うと、ぴったりになるかな？'}`;
    }
    const units = level.units.map(unit => `
      <button class="sg-throw-btn sg-unit-${unit}" type="button" data-unit="${unit}" ${won || over ? 'disabled' : ''} aria-label="${unit}を1回投げる">
        <span class="sg-throw-symbol" aria-hidden="true">${SG_UNITS[unit].symbol}</span><strong>${countText(unit)}</strong><small>${SG_UNITS[unit].short}</small>
      </button>`).join('');
    const chips = level.units.map(unit => `<span class="sg-count-chip"><b>${countText(unit)}</b> を ${unitCount(unit)}こ</span>`).join('');
    const breakdown = level.units.map(unit => `<div class="sg-breakdown-item sg-unit-${unit}"><span>${countText(unit)}のまとまり</span><strong>${Math.floor(target / unit) % 10}こ</strong></div>`).join('');
    root.innerHTML = `
      <div class="sg-game">
        <div class="sg-intro"><div class="sg-intro-copy"><span class="sg-kicker">NUMBER PARK QUEST</span><h3 class="sg-title">シュシュっと かず作り</h3><p>りくといっしょに、数のエネルギーを飛ばそう！<br>数が増える動きに注目してね。</p></div><img class="sg-riku-portrait" src="${FANTASY_RIKU}" alt="ファンタジーの忍者 りく"></div>
        <div class="sg-choice-block"><div class="sg-control-heading"><div><h3>修行のレベル</h3><p>今の学習に合うレベルを選ぼう。</p></div></div><div class="sg-levels" role="group" aria-label="修行のレベル">
          ${SG_LEVELS.map((item, index) => `<button class="sg-level-btn ${index === levelIndex ? 'is-selected' : ''}" type="button" data-level="${index}" aria-pressed="${index === levelIndex}"><strong>${item.label}</strong><span>${item.detail}</span></button>`).join('')}
        </div></div>
        <div class="sg-mode-row"><div class="sg-mode-toggle" role="group" aria-label="ゲームモード"><button class="sg-mode-btn ${mode === 'exact' ? 'is-selected' : ''}" type="button" data-mode="exact" aria-pressed="${mode === 'exact'}">🎯 ぴったりモード</button><button class="sg-mode-btn ${mode === 'treasure' ? 'is-selected' : ''}" type="button" data-mode="treasure" aria-pressed="${mode === 'treasure'}">💎 お宝モード</button></div><button class="sg-sound-toggle" type="button" data-action="sound" aria-pressed="${soundOn}">${soundOn ? '🔊 音あり' : '🔇 音なし'}</button></div>
        <div class="sg-scene" aria-label="目標の数を作るゲーム画面">
          <span class="sg-scene-spark one" aria-hidden="true">✧</span><span class="sg-scene-spark two" aria-hidden="true">✦</span><span class="sg-scene-spark three" aria-hidden="true">✧</span>
          <div class="sg-mission"><p class="sg-mission-label">今回の目標</p><div class="sg-target-number">${countText(target)}</div>
            <div class="sg-now-card"><span>いまの数</span><strong class="sg-current-number">${countText(total)}</strong><span class="sg-total-denom">／ ${countText(target)}</span><div class="sg-progress-track"><span style="width:${Math.min(100, total / target * 100)}%"></span></div><p class="sg-remaining">あと <b>${countText(Math.abs(remaining))}</b>${over ? ' こえた！' : ''}</p><div class="sg-flying-total" aria-live="polite"></div></div>
          </div>
          <div class="sg-scene-figure"><div class="sg-target" aria-hidden="true"><span>${countText(target)}</span></div><img class="sg-scene-riku" src="${FANTASY_RIKU}" alt="" aria-hidden="true"></div>
        </div>
        <div class="sg-control-card"><div class="sg-control-heading"><div><h3>どの数を投げる？</h3><p>投げると数が増えて、残りが減るよ。</p></div></div><div class="sg-throw-grid">${units}</div><div class="sg-counts" aria-label="これまでに投げた数">${chips}</div><div class="sg-status${statusClass}" role="status" aria-live="polite">${status}</div>
          ${won ? `<div class="sg-result-area"><p class="sg-footnote">今回のつくり方：<strong>${actualExpression()}</strong></p><h3>目標の数のしくみ</h3><div class="sg-breakdown">${breakdown}</div><p class="sg-footnote" style="margin-top:10px">${countText(target)} は、${breakdownText(target, level.units)} でできているよ。</p></div>` : ''}
          <div class="sg-actions">${won ? '<button class="sg-action-btn sg-action-primary" type="button" data-action="next">つぎのミッション！</button>' : '<button class="sg-action-btn sg-action-secondary" type="button" data-action="undo" ' + (!history.length ? 'disabled' : '') + '>↩ 1つ戻す</button>'}<button class="sg-action-btn sg-action-gold" type="button" data-action="reset">${won ? '同じ数でもう一度' : '最初からやりなおす'}</button></div>
        </div><p class="sg-footnote">ヒント：100は10が10こ分、1000は100が10こ分。いろいろな作り方を試そう。</p>
      </div>`;
    root.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => { levelIndex = Number(button.dataset.level); target = makeTarget(); resetRound(); }));
    root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; render(); }));
    root.querySelectorAll('[data-unit]').forEach(button => button.addEventListener('click', () => throwUnit(Number(button.dataset.unit))));
    root.querySelector('[data-action="undo"]')?.addEventListener('click', undoLast);
    root.querySelector('[data-action="reset"]')?.addEventListener('click', () => resetRound());
    root.querySelector('[data-action="next"]')?.addEventListener('click', () => resetRound(true));
    root.querySelector('[data-action="sound"]')?.addEventListener('click', () => { soundOn = !soundOn; if (soundOn) { playTone(660, .1); } render(); });
  }
  render();
}
