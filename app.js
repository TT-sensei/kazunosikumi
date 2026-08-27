import { initPlaceValueComposer } from './modules/placeValueComposer.js';
import { initPlaceValueDecomposer } from './modules/placeValueDecomposer.js';
import { initNumberLine } from './modules/numberLine.js';
import { initComparison } from './modules/comparison.js';
import { initUnitGrouping } from './modules/unitGrouping.js';
import { initQuizEngine } from './modules/quizEngine.js';
import { initBadgeCollection, initDailyNaviGroup } from './modules/numberParkFeatures.js';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(item => item.classList.remove('is-active'));
    panels.forEach(panel => panel.classList.remove('is-active'));
    tab.classList.add('is-active');
    document.getElementById(tab.dataset.tab)?.classList.add('is-active');
  });
});

initDailyNaviGroup(document.getElementById('navi-daily-root'));
initBadgeCollection(document.getElementById('badge-root'));
initPlaceValueComposer(document.getElementById('composer-root'));
initPlaceValueDecomposer(document.getElementById('decomposer-root'));
initNumberLine(document.getElementById('number-line-root'));
initComparison(document.getElementById('comparison-root'));
initUnitGrouping(document.getElementById('grouping-root'));
initQuizEngine(document.getElementById('quiz-root'));
