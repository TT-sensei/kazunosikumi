import { initPlaceValueComposer } from './modules/placeValueComposer.js';
import { initPlaceValueDecomposer } from './modules/placeValueDecomposer.js';
import { initNumberLine } from './modules/numberLine.js';
import { initComparison } from './modules/comparison.js';
import { initUnitGrouping } from './modules/unitGrouping.js';
import { initQuizEngine } from './modules/quizEngine.js';
import { initBadgeCollection, initDailyNaviGroup } from './modules/numberParkFeatures.js';
import { initShushuttoGame } from './modules/shushuttoGame.js';
import { initFurigana } from './modules/furigana.js';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

function activateTab(tab) {
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  panels.forEach(panel => panel.classList.toggle('is-active', panel.id === tab.dataset.tab));
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
});

initDailyNaviGroup(document.getElementById('navi-daily-root'));
initBadgeCollection(document.getElementById('badge-root'));
initPlaceValueComposer(document.getElementById('composer-root'));
initShushuttoGame(document.getElementById('shushutto-root'));
initPlaceValueDecomposer(document.getElementById('decomposer-root'));
initNumberLine(document.getElementById('number-line-root'));
initComparison(document.getElementById('comparison-root'));
initUnitGrouping(document.getElementById('grouping-root'));
initQuizEngine(document.getElementById('quiz-root'));
initFurigana(document.getElementById('furigana-toggle'));
