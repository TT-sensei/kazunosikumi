// 教師がここに問題を追加できます。answerは判定用の正解です。
export const problems = [
  {
    id: 1,
    type: 'composition',
    question: '100が3こ、10が2こ。数はいくつ？',
    answer: 320,
    hint: '100×3 と 10×2 をたそう'
  },
  {
    id: 2,
    type: 'grouping',
    question: '290000は1000が何こ？',
    answer: 290,
    hint: '290000 ÷ 1000'
  },
  {
    id: 3,
    type: 'decomposition',
    question: '320は100が何こありますか？',
    answer: 3,
    hint: '320の中に100のまとまりがいくつあるかな'
  },
  {
    id: 4,
    type: 'comparison',
    question: '780と650の差はいくつ？',
    answer: 130,
    hint: '780 - 650 を考えよう'
  },
  {
    id: 5,
    type: 'numberline',
    question: '50とびで6回ジャンプするといくつ？',
    answer: 300,
    hint: '50 × 6 を考えよう'
  }
];
