// number-park: 小2・小3向けの「数のしくみ」問題を自動生成します。
const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const smallUnits = [
  { value: 1000, label: '千' },
  { value: 100, label: '百' },
  { value: 10, label: '十' },
  { value: 1, label: '' }
];

const levelSettings = {
  1: { label: 'レベル1（小2）', min: 1000, max: 10000, cardDigits: 4, target: 7000 },
  2: { label: 'レベル2（小3）', min: 10000, max: 100000000, cardDigits: 5, target: 50000 }
};

const typeOrder = [
  '読み書き・位取り',
  '構成・相対的な大きさ',
  '10倍・100倍・1/10',
  '数直線・前後・大小比較',
  '思考力・カード問題'
];

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
  return number.toLocaleString('ja-JP');
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

function makeProblem(type, question, answer, hint, difficulty = 'ふつう') {
  return { type, question, answer, hint, difficulty };
}

function numberLineText(start, end, blanks, tickCount) {
  const parts = [];
  for (let index = 0; index <= tickCount; index += 1) {
    if (index === 0) parts.push(formatNumber(start));
    else if (index === tickCount) parts.push(formatNumber(end));
    else if (blanks.includes(index)) parts.push('□');
    else parts.push('・');
  }
  return parts.join(' ─ ');
}

function makeNumberLineProblem({ start, step, tickCount, blanks, label = '数直線' }) {
  const end = start + step * tickCount;
  const answers = blanks.map((blank) => formatNumber(start + step * blank)).join('、');
  return makeProblem(
    '数直線・前後・大小比較',
    `${label}：${numberLineText(start, end, blanks, tickCount)}。□に入る数を左から答えよう。`,
    answers,
    `両端の差 ${formatNumber(end - start)} を ${tickCount} 等分して、1目盛りを考えよう。`,
    'むずかしい'
  );
}

function placeValueQuestions(level) {
  if (level === 1) {
    const zeroNumber = choice([3040, 4050, 6008, 7005, 9020]);
    const writeNumber = randomInt(2, 9) * 1000 + randomInt(1, 9) * 100 + randomInt(1, 9);
    const missing = randomInt(3, 9) * 1000 + randomInt(1, 9) * 10;
    return [
      makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書きましょう。`, toKanji(zeroNumber), '0がある位は読まないけれど、位は空いているよ。'),
      makeProblem('読み書き・位取り', `${toKanji(writeNumber)}を数字で書きましょう。`, writeNumber, '千・百・十・一の位に分けよう。'),
      makeProblem('読み書き・位取り', `${formatNumber(missing)}の十の位の数字はいくつ？`, Math.floor(missing / 10) % 10, '右から2番目が十の位だよ。')
    ];
  }
  const zeroNumber = choice([30040000, 5040000, 70080000, 9006000]);
  const writeNumber = randomInt(12, 980) * 10000 + choice([40, 300, 5000]);
  const target = choice([10000000, 1000000, 10000]);
  const digit = randomInt(2, 9);
  const placeValueNumber = target * digit + 50000;
  return [
    makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書きましょう。`, toKanji(zeroNumber), '万のまとまりと下4けたに分けよう。'),
    makeProblem('読み書き・位取り', `${toKanji(writeNumber)}を数字で書きましょう。`, writeNumber, '万より下は4けたになるように0を入れるよ。'),
    makeProblem('読み書き・位取り', `${formatNumber(placeValueNumber)}の${formatNumber(target)}の位の数字はいくつ？`, Math.floor(placeValueNumber / target) % 10, '位をそろえてから数字を見よう。')
  ];
}

function groupingQuestions(level) {
  const unit = level === 1 ? choice([10, 100, 1000]) : choice([10000, 1000000, 10000000]);
  const count = level === 1 ? randomInt(12, 98) : randomInt(12, 90);
  const anotherUnit = level === 1 ? 100 : 10000;
  const anotherCount = level === 1 ? choice([40, 50, 60, 70, 80, 90]) : choice([990, 1000, 1200]);
  return [
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit)}を${count}こ集めた数はいくつ？`, unit * count, 'まとまりの大きさ×個数で考えよう。'),
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit * count)}は${formatNumber(unit)}を何こ集めた数？`, count, 'わる数を「1つのまとまり」にするよ。'),
    makeProblem('構成・相対的な大きさ', `${formatNumber(anotherUnit)}を${anotherCount}こ集めると、${level === 1 ? '1000' : '1万'}を何こ集めた数と同じ？`, (anotherUnit * anotherCount) / (level === 1 ? 1000 : 10000), '小さいまとまりを大きいまとまりに直そう。')
  ];
}

function scaleQuestions(level) {
  if (level === 1) {
    const base = randomInt(120, 890);
    const hundredBase = randomInt(12, 90);
    return [
      makeProblem('10倍・100倍・1/10', `${formatNumber(base)}を10倍するといくつ？`, base * 10, '位が1つ上がるよ。'),
      makeProblem('10倍・100倍・1/10', `${formatNumber(hundredBase)}を100倍するといくつ？`, hundredBase * 100, '位が2つ上がるよ。'),
      makeProblem('10倍・100倍・1/10', `${formatNumber(choice([4000, 5000, 6000, 8000, 9000]))}の1/10はいくつ？`, null, '位が1つ下がるよ。')
    ].map((p) => p.answer === null ? { ...p, answer: Number(p.question.match(/[\d,]+/)[0].replaceAll(',', '')) / 10 } : p);
  }
  const tenBase = randomInt(90, 990) * 10000;
  const hundredBase = randomInt(1, 100) * 10000;
  return [
    makeProblem('10倍・100倍・1/10', `${formatNumber(tenBase)}を10倍するといくつ？`, tenBase * 10, '万から億へまたぐことがあるよ。'),
    makeProblem('10倍・100倍・1/10', `${formatNumber(hundredBase)}を100倍するといくつ？`, hundredBase * 100, '位が2つ上がる。0の数だけで判断しないよ。'),
    makeProblem('10倍・100倍・1/10', `1億の1/10はいくつ？`, 10000000, '億の1つ下の大きなまとまりは千万だよ。')
  ];
}

function lineCompareQuestions(level) {
  if (level === 1) {
    const start = randomInt(56, 78) * 100;
    const step = choice([10, 20, 50]);
    const tickCount = choice([10, 12, 16]);
    const left = randomInt(4, 8) * 1000 + 40;
    const right = left + choice([-90, 90, 100]);
    return [
      makeNumberLineProblem({ start, step, tickCount, blanks: shuffle([3, 7, tickCount - 2]).slice(0, 3) }),
      makeProblem('数直線・前後・大小比較', `10,000より1小さい数はいくつ？`, 9999, '9999→10000の境界に注意。', 'むずかしい'),
      makeProblem('数直線・前後・大小比較', `${formatNumber(left)} ○ ${formatNumber(right)}。○に入る不等号を答えましょう。`, left > right ? '>' : left < right ? '<' : '=', '千の位から順にくらべよう。'),
      makeProblem('数直線・前後・大小比較', `${formatNumber(start + 10)}より10小さい数はいくつ？`, start, '十の位が1つ下がるよ。'),
      makeProblem('数直線・前後・大小比較', `${formatNumber(start + 100)}より100小さい数はいくつ？`, start, '百の位が1つ下がるよ。')
    ];
  }
  const start = randomInt(120, 780) * 100000;
  const step = choice([100000, 500000, 1000000]);
  const tickCount = choice([10, 12, 20]);
  const left = randomInt(30, 80) * 1000000 + 40000;
  const right = left + choice([-10000, 10000, 100000]);
  return [
    makeNumberLineProblem({ start, step, tickCount, blanks: shuffle([2, 9, tickCount - 3]).slice(0, 3) }),
    makeProblem('数直線・前後・大小比較', `1億より1小さい数はいくつ？`, 99999999, '99,999,999→100,000,000の境界に注意。', 'むずかしい'),
    makeProblem('数直線・前後・大小比較', `1,000万より1万小さい数はいくつ？`, 9990000, '1000万−1万は、万のまとまりを1つ減らすよ。', 'むずかしい'),
    makeProblem('数直線・前後・大小比較', `${formatNumber(left)} ○ ${formatNumber(right)}。○に入る不等号を答えましょう。`, left > right ? '>' : left < right ? '<' : '=', '大きい位から順にくらべよう。'),
    makeProblem('数直線・前後・大小比較', `${formatNumber(start)}より1万小さい数はいくつ？`, start - 10000, '万の位を1つ下げる。くり下がりに注意。')
  ];
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
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使ってできる${digits.length}けたの最大の数は？`, Number(desc.join('')), '大きい数字を左から置こう。'),
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使ってできる${digits.length}けたの最小の数は？`, Number(minDigits.join('')), 'いちばん左に0は置けないよ。', 'むずかしい'),
    makeProblem('思考力・カード問題', `カード ${digits.join('・')} を1回ずつ使って、${formatNumber(target)}に一番近い数を作りましょう。`, closest, 'まず一番大きい位を目標に近づけよう。', 'むずかしい')
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

function compositeSet(level) {
  const step = level === 1 ? choice([10, 20, 50]) : choice([10000, 50000, 100000]);
  const tickCount = choice([10, 12, 15, 20]);
  const start = level === 1 ? randomInt(58, 96) * 100 : randomInt(120, 860) * 100000;
  const blanks = [2, Math.floor(tickCount / 2), tickCount - 2];
  const answerValues = blanks.map((blank) => start + step * blank);
  const groupingUnit = level === 1 ? 10 : 10000;
  return [
    makeNumberLineProblem({ start, step, tickCount, blanks, label: '複合（数直線＋位取り＋まとまり）' }),
    makeProblem('構成・相対的な大きさ', `上の数直線のまん中の□（${formatNumber(answerValues[1])}）は、${formatNumber(groupingUnit)}を何こ集めた数？`, answerValues[1] / groupingUnit, '数直線で数を決めてから、まとまりでわろう。', 'むずかしい')
  ];
}

function buildProblemPool(level) {
  return [
    ...placeValueQuestions(level),
    ...groupingQuestions(level),
    ...scaleQuestions(level),
    ...lineCompareQuestions(level),
    ...cardQuestions(level),
    ...compositeSet(level)
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

export { levelSettings };
