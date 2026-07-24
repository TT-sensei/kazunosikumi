// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
const units = [1, 10, 100, 1000, 10000];

export function initUnitGrouping(root) {
  root.innerHTML = `
    <p>「1000が290こで290000」のように、単位がいくつ分あるかを調べます。</p>
    <div class="input-grid">
      <label>調べたい数<input id="group-total" type="number" min="0" value="290000"></label>
      <label>単位<select id="group-unit">${units.map((unit) => `<option value="${unit}" ${unit === 1000 ? 'selected' : ''}>${unit}</option>`).join('')}</select></label>
    </div>
    <div class="result" id="group-result"></div>
    <div class="hint" id="group-hint"></div>
  `;

  const totalInput = root.querySelector('#group-total');
  const unitSelect = root.querySelector('#group-unit');
  const result = root.querySelector('#group-result');
  const hint = root.querySelector('#group-hint');

  function render() {
    const total = Number(totalInput.value) || 0;
    const unit = Number(unitSelect.value);
    if (total % unit === 0) {
      result.textContent = `${total}は、${unit}が${total / unit}こです。`;
      hint.textContent = 'ぴったり分けられました。';
    } else {
      result.textContent = `${total}は、${unit}でぴったり分けられません。`;
      hint.textContent = `${unit}ずつ数えると、あまりが${total % unit}になります。近い数を探してみよう。`;
    }
  }

  totalInput.addEventListener('input', render);
  unitSelect.addEventListener('change', render);
  render();
}
