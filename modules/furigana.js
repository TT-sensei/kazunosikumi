/**
 * number-park: ふりがな（ルビ）モジュール
 *
 * 画面の案内文に、読みが固定の言葉だけルビを振る。
 * - 学ぶ対象そのもの（クイズの問題文・漢字パッド・数字の漢字）には付けない。
 * - 読みが文脈で変わる漢字（作・投・上など）は辞書に入れていない。
 * - ON/OFFはボタンで切り替え、設定は端末に保存する。
 */

// [言葉, 読み] 読みが一通りに決まるものだけを集めた辞書
const DICTIONARY = [
  // まとまった言葉（長いものから優先して当てる）
  ['答え合わせ', 'こたえあわせ'],
  ['小学校', 'しょうがっこう'],
  ['位取り', 'くらいどり'],
  ['数直線', 'すうちょくせん'],
  ['読み書き', 'よみかき'],
  ['見分け方', 'みわけかた'],
  ['いくつ分', 'いくつぶん'],
  ['とび数', 'とびかず'],
  ['折り紙', 'おりがみ'],
  ['手裏剣', 'しゅりけん'],
  ['相対的', 'そうたいてき'],
  ['思考力', 'しこうりょく'],
  ['テープ図', 'テープず'],
  ['大成功', 'だいせいこう'],
  ['不等号', 'ふとうごう'],
  ['目盛り', 'めもり'],
  ['新しい', 'あたらしい'],
  ['小さい', 'ちいさい'],
  ['少ない', 'すくない'],
  ['下がる', 'さがる'],
  ['上がる', 'あがる'],
  ['何回', 'なんかい'],
  ['回数', 'かいすう'],
  ['1回', 'いっかい'],
  ['番目', 'ばんめ'],
  ['桁数', 'けたすう'],
  ['個数', 'こすう'],
  ['こ分', 'こぶん'],
  ['向け', 'むけ'],
  ['年生', 'ねんせい'],
  ['漢字', 'かんじ'],
  ['数字', 'すうじ'],
  ['問題', 'もんだい'],
  ['種類', 'しゅるい'],
  ['挑戦', 'ちょうせん'],
  ['結果', 'けっか'],
  ['設定', 'せってい'],
  ['選択', 'せんたく'],
  ['学年', 'がくねん'],
  ['構成', 'こうせい'],
  ['分解', 'ぶんかい'],
  ['単位', 'たんい'],
  ['大小', 'だいしょう'],
  ['前後', 'ぜんご'],
  ['関係', 'かんけい'],
  ['操作', 'そうさ'],
  ['大きさ', 'おおきさ'],
  ['大きい', 'おおきい'],
  ['大きな', 'おおきな'],
  ['今回', 'こんかい'],
  ['今日', 'きょう'],
  ['最初', 'さいしょ'],
  ['最後', 'さいご'],
  ['同じ', 'おなじ'],
  ['全部', 'ぜんぶ'],
  ['全問', 'ぜんもん'],
  ['完了', 'かんりょう'],
  ['条件', 'じょうけん'],
  ['達成', 'たっせい'],
  ['解放', 'かいほう'],
  ['目標', 'もくひょう'],
  ['答え', 'こたえ'],
  ['記号', 'きごう'],
  ['判断', 'はんだん'],
  ['境界', 'きょうかい'],
  ['注意', 'ちゅうい'],
  ['解説', 'かいせつ'],
  ['発見', 'はっけん'],
  ['注目', 'ちゅうもく'],
  ['残り', 'のこり'],
  ['修行', 'しゅぎょう'],
  ['少し', 'すこし'],
  ['自分', 'じぶん'],
  // 1文字（このアプリでは読みが一通りに決まるものだけ）
  ['数', 'かず'],
  ['位', 'くらい'],
  ['問', 'もん'],
  ['個', 'こ'],
  ['倍', 'ばい'],
  ['束', 'たば'],
  ['分', 'わ'],
  ['左', 'ひだり'],
  ['右', 'みぎ'],
  ['前', 'まえ'],
  ['下', 'した'],
  ['今', 'いま'],
  ['回', 'かい'],
  ['見', 'み'],
  ['書', 'か'],
  ['読', 'よ'],
  ['考', 'かんが'],
  ['使', 'つか'],
  ['置', 'お'],
  ['近', 'ちか'],
  ['直', 'なお'],
  ['変', 'か'],
  ['動', 'うご'],
  ['集', 'あつ'],
  ['調', 'しら'],
  ['戻', 'もど'],
  ['始', 'はじ'],
  ['終', 'お'],
  ['空', 'あ'],
  ['方', 'かた'],
  ['組', 'くみ'],
  ['探', 'さが'],
  ['並', 'なら'],
  ['光', 'ひか'],
  ['増', 'ふ'],
  ['減', 'へ'],
  ['飛', 'と'],
  ['弾', 'たま'],
  ['宝', 'たから'],
  ['力', 'ちから'],
  ['音', 'おと'],
  ['順', 'じゅん']
];

const STORAGE_KEY = 'kazunosikumi.furigana.v1';

// 長い言葉から当てる（例：「数字」が「数」より先）
const ENTRIES = [...DICTIONARY].sort((a, b) => b[0].length - a[0].length);
const READINGS = new Map(ENTRIES);
const PATTERN = new RegExp(
  ENTRIES.map(([surface]) => surface.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'g'
);

// ルビを付けない場所：クイズの問題文（答えの漢字そのもの）と入力パッド
const SKIP_SELECTOR = '.np-question-text, .np-keypad, script, style, noscript, ruby, input, textarea, select';

function rubifyTextNode(node) {
  const text = node.nodeValue;
  if (!text || !PATTERN.test(text)) return;
  PATTERN.lastIndex = 0;
  const fragment = document.createDocumentFragment();
  let last = 0;
  let match;
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > last) fragment.append(document.createTextNode(text.slice(last, match.index)));
    const ruby = document.createElement('ruby');
    ruby.className = 'np-furi';
    ruby.append(document.createTextNode(match[0]));
    const rt = document.createElement('rt');
    rt.textContent = READINGS.get(match[0]);
    ruby.append(rt);
    fragment.append(ruby);
    last = match.index + match[0].length;
  }
  if (last < text.length) fragment.append(document.createTextNode(text.slice(last)));
  node.replaceWith(fragment);
}

function rubify(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const targets = [];
  while (walker.nextNode()) targets.push(walker.currentNode);
  targets.forEach(rubifyTextNode);
}

function unwrapAll() {
  document.querySelectorAll('ruby.np-furi').forEach((ruby) => {
    ruby.replaceWith(document.createTextNode(ruby.childNodes[0]?.textContent || ''));
  });
}

export function initFurigana(button) {
  if (!button) return;
  let enabled = true;
  try {
    enabled = localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch (_) { /* 保存できない環境では初期値ON */ }

  let applying = false;
  function apply() {
    if (!enabled || applying) return;
    applying = true;
    requestAnimationFrame(() => {
      rubify(document.body);
      applying = false;
    });
  }

  function syncButton() {
    button.textContent = enabled ? 'ふりがな：ON' : 'ふりがな：OFF';
    button.setAttribute('aria-pressed', String(enabled));
    button.classList.toggle('is-off', !enabled);
  }

  const observer = new MutationObserver(() => apply());
  observer.observe(document.body, { childList: true, subtree: true });

  button.addEventListener('click', () => {
    enabled = !enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch (_) { /* 保存できなくても切り替え自体は有効 */ }
    syncButton();
    if (enabled) apply();
    else unwrapAll();
  });

  syncButton();
  apply();
}
