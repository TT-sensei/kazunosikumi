// number-park: 小2・小3向けの「数のしくみ」問題を自動生成します。
const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const smallUnits = [
  { value: 1000, label: '千' },
  { value: 100, label: '百' },
  { value: 10, label: '十' },
  { value: 1, label: '' }
];

export const levelSettings = {
  1: { label: 'レベル1（小2：1000〜10000）', min: 1000, max: 10000, cardDigits: 4, target: 7000 },
  2: { label: 'レベル2（小3：万〜1億）', min: 10000, max: 100000000, cardDigits: 5, target: 50000 }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatNumber(number) {
  return typeof number === 'number' ? number.toLocaleString('ja-JP') : number;
}

function toKanjiUnder10000(number) {
  return smallUnits.map((unit) => {
    const digit = Math.floor(number / unit.value) % 10;
    if (digit === 0) return '';
    return `${digit === 1 && unit.value > 1 ? '' : kanjiDigits[digit]}${unit.label}`;
  }).join('') || '零';
}

function toKanji(number) {
  if (number === 100000000) return '一億';
  const man = Math.floor(number / 10000);
  const rest = number % 10000;
  return `${man ? `${toKanjiUnder10000(man)}万` : ''}${rest ? toKanjiUnder10000(rest) : ''}`;
}

function makeProblem(type, question, answer, hint, difficulty = 'ふつう', extraData = {}) {
  return { type, question, answer, hint, difficulty, extraData };
}

// 数直線問題（□は1つだけにする）
function makeNumberLineProblem({ start, step, tickCount, blank }) {
  const answerValue = start + step * blank;
  const prevVal = blank > 0 ? start + step * (blank - 1) : null;

  const hintText = prevVal !== null
    ? `1めもりは【 ${formatNumber(step)} 】だよ。${formatNumber(prevVal)} のつぎの目盛りをかんがえよう！`
    : `1めもりは【 ${formatNumber(step)} 】だよ。スタートの数からかんがえよう！`;

  return makeProblem(
    '数直線・前後・大小比較',
    `数直線の □ にはいる 数は いくつかな？`,
    answerValue,
    hintText,
    'ふつう',
    { uiType: 'number-line', start, step, tickCount, blank, inputMode: 'number' }
  );
}

function placeValueQuestions(level) {
  if (level === 1) {
    const zeroNumber = choice([3040, 4050, 6008, 7005, 9020]);
    const writeNumber = randomInt(2, 9) * 1000 + randomInt(1, 9) * 100 + randomInt(1, 9);
    const missing = randomInt(3, 9) * 1000 + randomInt(1, 9) * 10;
    return [
      makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書きましょう。`, toKanji(zeroNumber), '0がある位は読まないけれど、位は空いているよ。', 'ふつう', { inputMode: 'kanji' }),
      makeProblem('読み書き・位取り', `${toKanji(writeNumber)}を数字で書きましょう。`, writeNumber, '千・百・十・一の位に分けよう。', 'ふつう', { inputMode: 'number' }),
      makeProblem('読み書き・位取り', `${formatNumber(missing)}の十の位の数字はいくつ？`, Math.floor(missing / 10) % 10, '右から2番目が十の位だよ。', 'ふつう', { inputMode: 'number' })
    ];
  }
  const zeroNumber = choice([30040000, 5040000, 70080000, 9006000]);
  const writeNumber = randomInt(12, 980) * 10000 + choice([40, 300, 5000]);
  const target = choice([10000000, 1000000, 10000]);
  const digit = randomInt(2, 9);
  const placeValueNumber = target * digit + 50000;
  return [
    makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書きましょう。`, toKanji(zeroNumber), '万のまとまりと下4けたに分けよう。', 'ふつう', { inputMode: 'kanji' }),
    makeProblem('読み書き・位取り', `${toKanji(writeNumber)}を数字で書きましょう。`, writeNumber, '万より下は4けたになるように0を入れるよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('読み書き・位取り', `${formatNumber(placeValueNumber)}の${formatNumber(target)}の位の数字はいくつ？`, Math.floor(placeValueNumber / target) % 10, '位をそろえてから数字を見よう。', 'ふつう', { inputMode: 'number' })
  ];
}

function groupingQuestions(level) {
  const unit = level === 1 ? choice([10, 100, 1000]) : choice([10000, 1000000, 10000000]);
  const count = level === 1 ? randomInt(12, 98) : randomInt(12, 90);
  const anotherUnit = level === 1 ? 100 : 10000;
  const anotherCount = level === 1 ? choice([40, 50, 60, 70, 80, 90]) : choice([990, 1000, 1200]);
  return [
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit)}を${count}こ集めた数はいくつ？`, unit * count, 'まとまりの大きさ×個数で考えよう。', 'ふつう', { inputMode: 'number' }),
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit * count)}は${formatNumber(unit)}を何こ集めた数？`, count, 'わる数を「1つのまとまり」にするよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('構成・相対的な大きさ', `${formatNumber(anotherUnit)}を${anotherCount}こ集めると、${level === 1 ? '1000' : '1万'}を何こ集めた数と同じ？`, (anotherUnit * anotherCount) / (level === 1 ? 1000 : 10000), '小さいまとまりを大きいまとまりに直そう。', 'ふつう', { inputMode: 'number' })
  ];
}

function scaleQuestions(level) {
  if (level === 1) {
    const base = randomInt(120, 890);
    const hundredBase = randomInt(12, 90);
    const divBase = choice([4000, 5000, 6000, 8000, 9000]);
    return [
      makeProblem('10倍・100倍・1/10', `${formatNumber(base)}を10倍するといくつ？`, base * 10, '位が1つ上がるよ。', 'ふつう', { inputMode: 'number' }),
      makeProblem('10倍・100倍・1/10', `${formatNumber(hundredBase)}を100倍するといくつ？`, hundredBase * 100, '位が2つ上がるよ。', 'ふつう', { inputMode: 'number' }),
      makeProblem('10倍・100倍・1/10', `${formatNumber(divBase)}の1/10はいくつ？`, divBase / 10, '位が1つ下がるよ。', 'ふつう', { inputMode: 'number' })
    ];
  }
  const tenBase = randomInt(90, 990) * 10000;
  const hundredBase = randomInt(1, 100) * 10000;
  return [
    makeProblem('10倍・100倍・1/10', `${formatNumber(tenBase)}を10倍するといくつ？`, tenBase * 10, '万から億へまたぐことがあるよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('10倍・100倍・1/10', `${formatNumber(hundredBase)}を100倍するといくつ？`, hundredBase * 100, '位が2つ上がる。0の数だけで判断しないよ。', 'ふつう', { inputMode: 'number' }),
    makeProblem('10倍・100倍・1/10', `1億の1/10はいくつ？`, 10000000, '億の1つ下の大きなまとまりは千万だよ。', 'ふつう', { inputMode: 'number' })
  ];
}

function lineCompareQuestions(level) {
  if (level === 1) {
    const start = randomInt(10, 50) * 100;
    const step = choice([10, 50, 100]);
    const tickCount = 6;
    const blank = randomInt(1, tickCount - 1);

    const left = randomInt(4, 8) * 1000 + 40;
    const right = left + choice([-90, 90, 100]);
    return [
      makeNumberLineProblem({ start, step, tickCount, blank }),
      makeProblem('数直線・前後・大小比較', `10,000より1小さい数はいくつ？`, 9999, '9999→10000の境界に注意。', 'ふつう', { inputMode: 'number' }),
      makeProblem('数直線・前後・大小比較', `${formatNumber(left)} ○ ${formatNumber(right)}。○に入る不等号を答えましょう。`, left > right ? '>' : left < right ? '<' : '=', '千の位から順にくらべよう。', 'ふつう', { uiType: 'compare' }),
      makeProblem('数直線・前後・大小比較', `${formatNumber(start + 10)}より10小さい数はいくつ？`, start, '十の位が1つ下がるよ。', 'ふつう', { inputMode: 'number' })
    ];
  }

  const start = randomInt(10, 50) * 100000;
  const step = choice([100000, 500000]);
  const tickCount = 6;
  const blank = randomInt(1, tickCount - 1);

  const left = randomInt(30, 80) * 1000000 + 40000;
  const right = left + choice([-10000, 10000, 100000]);
  return [
    makeNumberLineProblem({ start, step, tickCount, blank }),
    makeProblem('数直線・前後・大小比較', `1億より1小さい数はいくつ？`, 99999999, '99,999,999→100,000,000の境界に注意。', 'ふつう', { inputMode: 'number' }),
    makeProblem('数直線・前後・大小比較', `${formatNumber(left)} ○ ${formatNumber(right)}。○に入る不等号を答えましょう。`, left > right ? '>' : left < right ? '<' : '=', '大きい位から順にくらべよう。', 'ふつう', { uiType: 'compare' })
  ];
}

function permutations(digits) {
  const results = [];
  function build(rest, used) {
    if (!rest.length) {
      if (used[0] !== 0) results.push(Number(used.join('')));
      return;
    }
    rest.forEach((digit, index) => build([...rest.slice(0, index), ...rest.slice(index + 1)], [...used, digit]));
  }
  build(digits, []);
  return results;
}

function cardQuestions(level) {
  const digits = level === 1 ? shuffle([0, randomInt(2, 9), randomInt(1, 8), randomInt(3, 9)]) : shuffle([0, randomInt(1, 9), randomInt(2, 8), randomInt(3, 9), randomInt(4, 9)]);
  const desc = [...digits].sort((a, b) => b - a);
  const asc = [...digits].sort((a, b) => a - b);
  const firstNonZero = asc.findIndex((digit) => digit !== 0);
  const minDigits = [...asc];
  [minDigits[0], minDigits[firstNonZero]] = [minDigits[firstNonZero], minDigits[0]];
  const candidates = permutations(digits).filter((value) => String(value).length === digits.length);
  const target = level === 1 ? 7000 : 50000;
  const closest = candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];

  return [
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使ってできる${digits.length}けたの最大の数は？`, Number(desc.join('')), '大きい数字を左から置こう。', 'ふつう', { uiType: 'cards', digits }),
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使ってできる${digits.length}けたの最小の数は？`, Number(minDigits.join('')), 'いちばん左に0は置けないよ。', 'ふつう', { uiType: 'cards', digits }),
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使って、${formatNumber(target)}に一番近い数を作りましょう。`, closest, 'まず一番大きい位を目標に近づけよう。', 'ふつう', { uiType: 'cards', digits })
  ];
}

function buildProblemPool(level) {
  return [
    ...placeValueQuestions(level),
    ...groupingQuestions(level),
    ...scaleQuestions(level),
    ...lineCompareQuestions(level),
    ...cardQuestions(level)
  ];
}

export function generateProblems(level = 1, size = 20) {
  const required = buildProblemPool(level);
  const extras = [];
  while (required.length + extras.length < size) {
    extras.push(...shuffle(buildProblemPool(level)));
  }
  return shuffle([...required, ...extras.slice(0, Math.max(0, size - required.length))])
    .slice(0, size)
    .map((problem, index) => ({ ...problem, id: index + 1 }));
}
