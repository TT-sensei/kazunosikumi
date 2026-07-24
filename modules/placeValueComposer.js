// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
const units = [
  { key: 'hundreds', label: '100', value: 100 },
  { key: 'tens', label: '10', value: 10 },
  { key: 'ones', label: '1', value: 1 }
];

export function initPlaceValueComposer(root) {
  const counts = { hundreds: 0, tens: 0, ones: 0 };

  root.innerHTML = `
    <p>ボタンを押して、100・10・1を組み合わせた数をつくります。</p>
    <div class="tool-grid">
      ${units.map((unit) => `<button data-add="${unit.key}">+${unit.label}</button>`).join('')}
      <button data-reset>0にもどす</button>
    </div>
    <div class="card-grid" id="composer-cards"></div>
    <div class="result" id="composer-result"></div>
  `;

  const cards = root.querySelector('#composer-cards');
  const result = root.querySelector('#composer-result');

  function render() {
    const total = counts.hundreds * 100 + counts.tens * 10 + counts.ones;
    cards.innerHTML = units.map((unit) => `
      <div class="math-card ${unit.key}">
        <span>${unit.label}のカード</span>
        <strong>${counts[unit.key]}こ</strong>
      </div>
    `).join('');
    result.textContent = `100が${counts.hundreds}こ、10が${counts.tens}こ、1が${counts.ones}こ。合計は${total}です。`;
  }

  root.addEventListener('click', (event) => {
    const key = event.target.dataset.add;
    if (key) counts[key] += 1;
    if (event.target.dataset.reset !== undefined) {
      counts.hundreds = 0;
      counts.tens = 0;
      counts.ones = 0;
    }
    render();
  });

  render();
}
