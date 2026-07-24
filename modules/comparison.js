// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
export function initComparison(root) {
  root.innerHTML = `
    <p>2つの数をくらべて、どちらがどれだけ大きいかを言葉にします。</p>
    <div class="input-grid">
      <label>左の数<input id="compare-a" type="number" value="520"></label>
      <label>右の数<input id="compare-b" type="number" value="320"></label>
    </div>
    <div class="result" id="compare-result"></div>
  `;

  const a = root.querySelector('#compare-a');
  const b = root.querySelector('#compare-b');
  const result = root.querySelector('#compare-result');

  function render() {
    const left = Number(a.value) || 0;
    const right = Number(b.value) || 0;
    const diff = Math.abs(left - right);
    if (left === right) result.textContent = `${left}と${right}は同じ大きさです。差は0です。`;
    else if (left > right) result.textContent = `${left}は${right}より${diff}大きいです。`;
    else result.textContent = `${right}は${left}より${diff}大きいです。`;
  }

  a.addEventListener('input', render);
  b.addEventListener('input', render);
  render();
}
