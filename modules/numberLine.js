// number-park: 教育用途のため、シンプルで読みやすい実装にしています。
const steps = [1, 2, 5, 10, 50, 100];

export function initNumberLine(root) {
  root.innerHTML = `
    <p>スライダーを動かして、とび数で数のならびを見ます。</p>
    <div class="input-grid">
      <label>とび数<select id="line-step">${steps.map((step) => `<option value="${step}">${step}とび</option>`).join('')}</select></label>
      <label>ジャンプ<input id="line-slider" type="range" min="0" max="20" value="3"></label>
    </div>
    <div class="number-line-track"><span class="number-line-dot" id="line-dot"></span></div>
    <div class="result" id="line-result"></div>
  `;

  const stepSelect = root.querySelector('#line-step');
  const slider = root.querySelector('#line-slider');
  const dot = root.querySelector('#line-dot');
  const result = root.querySelector('#line-result');

  function render() {
    const step = Number(stepSelect.value);
    const jump = Number(slider.value);
    const number = step * jump;
    dot.style.left = `${(jump / Number(slider.max)) * 100}%`;
    result.textContent = `${step}とびで${jump}回ジャンプすると、${number}です。`;
  }

  stepSelect.addEventListener('change', render);
  slider.addEventListener('input', render);
  render();
}
