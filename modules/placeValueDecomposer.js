// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
export function initPlaceValueDecomposer(root) {
  root.innerHTML = `
    <p>数を入力すると、100・10・1が何こあるかに分けて考えます。</p>
    <label>分けたい数<input id="decompose-number" type="number" min="0" max="99999999" value="320"></label>
    <div class="card-grid" id="decompose-cards"></div>
    <div class="result" id="decompose-result"></div>
  `;

  const input = root.querySelector('#decompose-number');
  const cards = root.querySelector('#decompose-cards');
  const result = root.querySelector('#decompose-result');

  function render() {
    const number = Math.max(0, Number(input.value) || 0);
    const hundreds = Math.floor(number / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;
    cards.innerHTML = `
      <div class="math-card hundreds"><span>100</span><strong>${hundreds}こ</strong></div>
      <div class="math-card tens"><span>10</span><strong>${tens}こ</strong></div>
      <div class="math-card ones"><span>1</span><strong>${ones}こ</strong></div>
    `;
    result.textContent = `${number}は、100が${hundreds}こ、10が${tens}こ、1が${ones}こです。`;
  }

  input.addEventListener('input', render);
  render();
}
