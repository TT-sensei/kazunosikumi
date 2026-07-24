// number-park: 小2・小3向けの「数のしくみ」問題を自動生成します。
const kanjiDigits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const smallUnits = [
  { value: 1000, label: '千' },
  { value: 100, label: '百' },
  { value: 10, label: '十' },
  { value: 1, label: '' }
];

const levelSettings = {
  1: { label: 'レベル1（小2）', min: 1000, max: 10000, units: [1, 10, 100, 1000], target: 7000 },
  2: { label: 'レベル2（小3）', min: 10000, max: 100000000, units: [1000, 10000, 1000000, 10000000], target: 50000000 }
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


function closestCardNumber(cards, target) {
  const results = [];
  function build(remaining, used) {
    if (!remaining.length) {
      if (used[0] !== 0) results.push(Number(used.join('')));
      return;
    }
    remaining.forEach((card, index) => {
      build([...remaining.slice(0, index), ...remaining.slice(index + 1)], [...used, card]);
    });
  }
  build(cards, []);
  return results.sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];
}

function makeProblem(type, question, answer, hint, difficulty = 'ふつう') {
  return { type, question, answer, hint, difficulty };
}

function levelOneProblems() {
  const zeroNumber = choice([3040, 4070, 5080, 7005, 9006]);
  const base = randomInt(2, 8) * 1000 + randomInt(1, 9) * 10;
  const unit = choice([10, 100]);
  const count = randomInt(12, 98);
  const grouped = unit * count;
  const cards = shuffle([0, randomInt(2, 9), randomInt(1, 8), randomInt(3, 9)]);
  const cardMax = Number([...cards].sort((a, b) => b - a).join(''));
  const cardMin = Number([...cards].sort((a, b) => a - b).filter((n, i, arr) => i || n !== 0).join('') + (cards.includes(0) ? '0' : ''));

  return [
    makeProblem('読み書き・位取り', `${formatNumber(zeroNumber)}を漢字で書くと？`, toKanji(zeroNumber), '0の位は読まないよ。'),
    makeProblem('読み書き・位取り', `${toKanji(base)}を数字で書くと？`, base, '千・百・十・一の位に分けよう。'),
    makeProblem('構成・相対的な大きさ', `${unit}を${count}こ集めた数はいくつ？`, grouped, `${unit}×${count}で考えよう。`),
    makeProblem('構成・相対的な大きさ', `${formatNumber(grouped)}は${unit}を何こ集めた数？`, count, `${formatNumber(grouped)}÷${unit}だよ。`),
    makeProblem('10倍・100倍・1/10', `${randomInt(100, 900)}を10倍するといくつ？`, null, '右に0を1つつけるだけでなく、位が1つ上がると考えよう。'),
    makeProblem('10倍・100倍・1/10', `${randomInt(20, 90) * 100}の1/10はいくつ？`, null, '位が1つ下がるよ。'),
    makeProblem('数直線・前後・大小比較', `10,000より1小さい数はいくつ？`, 9999, '9999→10000の境目を思い出そう。', 'むずかしい'),
    makeProblem('数直線・前後・大小比較', `${formatNumber(randomInt(2, 9) * 1000 + 400)} ○ ${formatNumber(randomInt(2, 9) * 1000 + 40)}。○に入る不等号を答えてね（> または <）。`, null, '千の位からくらべよう。'),
    makeProblem('数直線・前後・大小比較', `数直線で0から10,000までが5目盛りです。1目盛りはいくつ？`, 2000, '10000を5等分しよう。'),
    makeProblem('思考力・カード問題', `カード ${cards.join('・')} を1回ずつ使ってできる4けたの最大の数は？`, cardMax, '大きい数字を左からならべよう。'),
    makeProblem('思考力・カード問題', `カード ${cards.join('・')} を1回ずつ使ってできる4けたの最小の数は？`, cardMin, '千の位に0は置けないよ。', 'むずかしい')
  ];
}

function levelTwoProblems() {
  const withZero = choice([30040000, 5040000, 70080000, 9006000]);
  const manCount = randomInt(120, 980);
  const unit = choice([10000, 1000000]);
  const count = randomInt(12, 90);
  const cards = shuffle([0, randomInt(1, 9), randomInt(2, 8), randomInt(3, 9), randomInt(4, 9)]);
  const cardNums = shuffle(cards).join('');
  const cardClosest = closestCardNumber(cards, 50000);

  return [
    makeProblem('読み書き・位取り', `${formatNumber(withZero)}を漢字で書くと？`, toKanji(withZero), '0がある位をとばして読もう。'),
    makeProblem('読み書き・位取り', `${toKanji(manCount * 10000 + 3000)}を数字で書くと？`, manCount * 10000 + 3000, '万のまとまりと下4けたを分けよう。'),
    makeProblem('構成・相対的な大きさ', `${formatNumber(unit)}を${count}こ集めた数はいくつ？`, unit * count, '何万、何百万になるか考えよう。'),
    makeProblem('構成・相対的な大きさ', `${formatNumber(manCount * 10000)}は1万を何こ集めた数？`, manCount, '1万のまとまりで数えよう。'),
    makeProblem('10倍・100倍・1/10', `${formatNumber(randomInt(10, 90) * 10000)}を100倍するといくつ？`, null, '万から億へ位がまたぐことがあるよ。', 'むずかしい'),
    makeProblem('10倍・100倍・1/10', `1,000万の1/10はいくつ？`, 1000000, '位が1つ下がるよ。'),
    makeProblem('数直線・前後・大小比較', `1,000万より1万小さい数はいくつ？`, 9990000, '1000万−1万のくり下がりに注意。', 'むずかしい'),
    makeProblem('数直線・前後・大小比較', `${formatNumber(randomInt(10, 90) * 1000000)} ○ ${formatNumber(randomInt(10, 90) * 1000000 + 10000)}。○に入る不等号を答えてね（> または <）。`, null, '大きい位からくらべよう。'),
    makeProblem('数直線・前後・大小比較', `数直線で0から1億までが10目盛りです。1目盛りはいくつ？`, 10000000, '1億を10等分しよう。'),
    makeProblem('思考力・カード問題', `カード ${cards.join('・')} を1回ずつ使って5けたの数を作ります。${formatNumber(50000)}に一番近い数を1つ答えてね。例として ${cardNums} も作れます。`, cardClosest, '万の位が5に近いものから考えよう。', 'むずかしい'),
    makeProblem('思考力・カード問題', `カード ${cards.join('・')} を1回ずつ使ってできる5けたの最大の数は？`, Number([...cards].sort((a, b) => b - a).join('')), '大きい数字を左からならべよう。')
  ];
}

function completeCalculatedAnswers(problem) {
  const tenTimes = problem.question.match(/^([\d,]+)を10倍/);
  const hundredTimes = problem.question.match(/^([\d,]+)を100倍/);
  const tenth = problem.question.match(/^([\d,]+)の1\/10/);
  const compare = problem.question.match(/^([\d,]+) ○ ([\d,]+)/);
  if (tenTimes) return { ...problem, answer: Number(tenTimes[1].replaceAll(',', '')) * 10 };
  if (hundredTimes) return { ...problem, answer: Number(hundredTimes[1].replaceAll(',', '')) * 100 };
  if (tenth) return { ...problem, answer: Number(tenth[1].replaceAll(',', '')) / 10 };
  if (compare) {
    const left = Number(compare[1].replaceAll(',', ''));
    const right = Number(compare[2].replaceAll(',', ''));
    return { ...problem, answer: left > right ? '>' : '<' };
  }
  return problem;
}

export function generateProblems(level = 1, size = 20) {
  const source = level === 2 ? levelTwoProblems : levelOneProblems;
  const generated = [];
  while (generated.length < size) {
    generated.push(...shuffle(source().map(completeCalculatedAnswers)));
  }
  return generated.slice(0, size).map((problem, index) => ({ ...problem, id: index + 1 }));
}

export { levelSettings };
