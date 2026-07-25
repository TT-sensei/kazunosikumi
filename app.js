// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
// 各タブを開いたタイミングで、対応する JS ファイルを個別に読み込みます。
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

const featureModules = {
  quiz: {
    rootId: 'quiz-root',
    modulePath: './modules/quizEngine.js',
    initName: 'initQuizEngine'
  },
  composer: {
    rootId: 'composer-root',
    modulePath: './modules/placeValueComposer.js',
    initName: 'initPlaceValueComposer'
  },
  decomposer: {
    rootId: 'decomposer-root',
    modulePath: './modules/placeValueDecomposer.js',
    initName: 'initPlaceValueDecomposer'
  },
  'number-line': {
    rootId: 'number-line-root',
    modulePath: './modules/numberLine.js',
    initName: 'initNumberLine'
  },
  comparison: {
    rootId: 'comparison-root',
    modulePath: './modules/comparison.js',
    initName: 'initComparison'
  },
  grouping: {
    rootId: 'grouping-root',
    modulePath: './modules/unitGrouping.js',
    initName: 'initUnitGrouping'
  }
};

const initializedTabs = new Set();

function showLoadError(root, error) {
  console.error('number-park module load error:', error);
  root.innerHTML = `
    <div class="hint" role="alert">
      このコーナーを読み込めませんでした。ページを再読み込みしてください。<br>
      <small>開発者向け: ${error instanceof Error ? error.message : String(error)}</small>
    </div>
  `;
}

async function loadFeature(tabName) {
  if (initializedTabs.has(tabName)) return;

  const feature = featureModules[tabName];
  if (!feature) return;

  const root = document.getElementById(feature.rootId);
  if (!root) return;

  root.innerHTML = '<p class="hint">読み込み中です…</p>';

  try {
    const module = await import(feature.modulePath);
    const init = module[feature.initName];

    if (typeof init !== 'function') {
      throw new Error(`${feature.modulePath} に ${feature.initName} が見つかりません。`);
    }

    init(root);
    initializedTabs.add(tabName);
  } catch (error) {
    showLoadError(root, error);
  }
}

function activateTab(tab) {
  const tabName = tab.dataset.tab;
  const panel = document.getElementById(tabName);
  if (!panel) return;

  tabs.forEach((item) => item.classList.remove('is-active'));
  panels.forEach((item) => item.classList.remove('is-active'));
  tab.classList.add('is-active');
  panel.classList.add('is-active');
  loadFeature(tabName);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab));
});

const initialTab = document.querySelector('.tab.is-active') || tabs[0];
if (initialTab) activateTab(initialTab);
