const NAVI_BASE = 'https://tt-sensei.github.io/navi-character-/assets/web/characters/';
const BADGE_BASE = 'https://tt-sensei.github.io/edu-assets/assets/web/badges/';

export const NAVI_ASSETS = {
  sora: {
    name: 'そら',
    color: '#2563eb',
    poses: {
      welcome: 'fullbody/waving.webp',
      correct: 'fullbody/correct.webp',
      hint: 'fullbody/hint.webp',
      retry: 'fullbody/retry.webp',
      complete: 'fullbody/complete.webp'
    }
  },
  tsuki: {
    name: 'つき',
    color: '#f97316',
    poses: {
      welcome: 'fullbody/tying-hair.webp',
      correct: 'fullbody/correct.webp',
      hint: 'fullbody/hint.webp',
      retry: 'fullbody/retry.webp',
      complete: 'fullbody/complete.webp'
    }
  },
  kai: {
    name: 'かい',
    color: '#0891b2',
    poses: {
      welcome: 'fullbody/checking-note.webp',
      correct: 'fullbody/correct.webp',
      hint: 'fullbody/thinking.webp',
      retry: 'fullbody/retry.webp',
      complete: 'fullbody/complete.webp'
    }
  }
};

export function getNaviSrc(character = 'sora', pose = 'welcome') {
  const navi = NAVI_ASSETS[character] || NAVI_ASSETS.sora;
  return `${NAVI_BASE}${character}/${navi.poses[pose] || navi.poses.welcome}`;
}

export function publishNavi(character, pose, message) {
  window.dispatchEvent(new CustomEvent('numberpark:navi', {
    detail: { character, pose, message }
  }));
}

const BADGES = [
  { id: 'first-step', group: 'common', label: 'はじめの一歩', description: 'チャレンジに1問こたえた', path: 'first-step', check: s => s.answered >= 1 },
  { id: 'number-sense', group: 'math', label: '数のセンス', description: '正解を5問集めた', path: 'number-sense', check: s => s.correct >= 5 },
  { id: 'number-line', group: 'math', label: '数直線マスター', description: '数直線・前後・大小比較を1セット完了', path: 'number-line', check: s => s.completedTypes['数直線・前後・大小比較'] >= 1 },
  { id: 'math-discovery', group: 'math', label: '数の発見者', description: '3種類の問題に挑戦した', path: 'math-discovery', check: s => Object.keys(s.completedTypes).length >= 3 },
  { id: 'representation-link', group: 'math', label: 'つながり発見', description: '2種類の問題をセット完了', path: 'representation-link', check: s => Object.keys(s.completedTypes).length >= 2 },
  { id: 'perfect', group: 'common', label: 'パーフェクト', description: '10問を全問正解した', path: 'perfect', check: s => s.perfectSets >= 1 },
  { id: 'mission-complete', group: 'common', label: 'ミッション完了', description: '10問セットを最後まで終えた', path: 'mission-complete', check: s => s.completedSets >= 1 },
  { id: 'level-up', group: 'common', label: 'レベルアップ', description: 'レベル1・2をクリアした', path: 'level-up', check: s => s.levels[1] >= 1 && s.levels[2] >= 1 },
  { id: 'treasure', group: 'common', label: '数のたからもの', description: '3セットをクリアした', path: 'treasure', check: s => s.completedSets >= 3 },
  { id: 'accuracy', group: 'common', label: '正確な目', description: '正解を50問集めた', path: 'accuracy', check: s => s.correct >= 50 }
];

const STATS_KEY = 'kazunosikumi.progress.v1';
const APP_BADGES_KEY = 'kazunosikumi.badges.v1';
const SHARED_BADGES_KEY = 'badgeCollection';

function emptyStats() {
  return { answered: 0, correct: 0, completedSets: 0, perfectSets: 0, completedTypes: {}, levels: {} };
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function readStats() {
  return { ...emptyStats(), ...readJson(STATS_KEY, {}) };
}

function readUnlocked() {
  const local = readJson(APP_BADGES_KEY, {});
  const ids = new Set(Array.isArray(local.unlocked) ? local.unlocked : []);
  const shared = readJson(SHARED_BADGES_KEY, null);
  if (Array.isArray(shared)) {
    shared.filter(id => String(id).startsWith('kazunosikumi:')).forEach(id => ids.add(String(id).replace('kazunosikumi:', '')));
  }
  const sharedApp = shared?.apps?.kazunosikumi?.unlocked || shared?.kazunosikumi?.unlocked;
  if (Array.isArray(sharedApp)) sharedApp.forEach(id => ids.add(id));
  return ids;
}

function saveUnlocked(ids) {
  const unlocked = [...ids];
  localStorage.setItem(APP_BADGES_KEY, JSON.stringify({ unlocked }));
  const shared = readJson(SHARED_BADGES_KEY, {});
  if (Array.isArray(shared)) {
    const next = [...shared];
    unlocked.forEach(id => {
      const key = `kazunosikumi:${id}`;
      if (!next.includes(key)) next.push(key);
    });
    localStorage.setItem(SHARED_BADGES_KEY, JSON.stringify(next));
    return;
  }
  const next = {
    ...(shared && typeof shared === 'object' ? shared : {}),
    apps: {
      ...(shared?.apps && typeof shared.apps === 'object' ? shared.apps : {}),
      kazunosikumi: { ...(shared?.apps?.kazunosikumi || {}), unlocked }
    }
  };
  localStorage.setItem(SHARED_BADGES_KEY, JSON.stringify(next));
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function updateBadges() {
  const stats = readStats();
  const unlocked = readUnlocked();
  const newBadges = [];
  BADGES.forEach(badge => {
    if (badge.check(stats) && !unlocked.has(badge.id)) {
      unlocked.add(badge.id);
      newBadges.push(badge);
    }
  });
  if (newBadges.length) {
    saveUnlocked(unlocked);
    newBadges.forEach(badge => window.dispatchEvent(new CustomEvent('numberpark:badge-unlocked', { detail: badge })));
  }
  window.dispatchEvent(new CustomEvent('numberpark:stats-updated'));
}

export function recordQuizAnswer({ correct, type }) {
  const stats = readStats();
  stats.answered += 1;
  if (correct) stats.correct += 1;
  saveStats(stats);
  updateBadges();
}

export function recordQuizComplete({ correctCount, total, type, level }) {
  const stats = readStats();
  stats.completedSets += 1;
  if (correctCount === total) stats.perfectSets += 1;
  stats.completedTypes[type] = (stats.completedTypes[type] || 0) + 1;
  stats.levels[level] = (stats.levels[level] || 0) + 1;
  saveStats(stats);
  updateBadges();
}

export function getBadgeSummary() {
  const stats = readStats();
  const unlocked = readUnlocked();
  return { stats, unlocked, total: BADGES.length, count: unlocked.size };
}

export function initNavi(root) {
  if (!root) return;
  let state = { character: 'sora', pose: 'welcome', message: '数のしくみを見つけにいこう！' };

  function render() {
    const current = NAVI_ASSETS[state.character] || NAVI_ASSETS.sora;
    root.innerHTML = `
      <div class="np-navi-party" aria-label="ナビキャラ">
        ${Object.entries(NAVI_ASSETS).map(([id, navi]) => `
          <img class="np-navi-side ${id === state.character ? 'is-selected' : ''}" src="${getNaviSrc(id, 'welcome')}" alt="${navi.name}" loading="lazy">
        `).join('')}
        <div class="np-navi-main">
          <img src="${getNaviSrc(state.character, state.pose)}" alt="${current.name}｜${state.message}">
          <div class="np-navi-bubble"><strong>${current.name}</strong><span>${state.message}</span></div>
        </div>
      </div>
    `;
  }

  window.addEventListener('numberpark:navi', event => {
    state = { ...state, ...event.detail };
    render();
  });
  render();
}

export function initBadgeCollection(root) {
  if (!root) return;

  function render() {
    const { stats, unlocked, total, count } = getBadgeSummary();
    root.innerHTML = `
      <div class="np-badge-head">
        <div><span class="np-kicker">NUMBER PARK COLLECTION</span><h2>数のしくみバッジ</h2><p>問題に挑戦して、数の力をバッジに変えよう。</p></div>
        <div class="np-badge-count"><strong>${count}</strong><span>/ ${total} 個</span></div>
      </div>
      <div class="np-badge-stats"><span>正解 ${stats.correct}問</span><span>クリア ${stats.completedSets}セット</span><span>あと ${total - count}個</span></div>
      <div class="np-badge-grid">
        ${BADGES.map(badge => {
          const got = unlocked.has(badge.id);
          const src = `${BADGE_BASE}${badge.group}/${badge.path}/badge.webp`;
          return `
            <article class="np-badge-card ${got ? 'is-unlocked' : 'is-locked'}">
              <div class="np-badge-image-wrap"><img src="${src}" alt="${got ? badge.label : 'ロック中のバッジ'}" loading="lazy"></div>
              <strong>${got ? badge.label : '？？？'}</strong>
              <small>${got ? badge.description : '条件を達成すると解放'}</small>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  window.addEventListener('numberpark:stats-updated', render);
  window.addEventListener('numberpark:badge-unlocked', event => {
    const badge = event.detail;
    const toast = document.createElement('div');
    toast.className = 'np-badge-toast';
    toast.innerHTML = `<span>🏅 バッジをゲット！</span><strong>${badge.label}</strong>`;
    document.body.append(toast);
    setTimeout(() => toast.remove(), 2600);
  });
  render();
}
