// ============================================================
// エンドレス・スクワット地獄 〜天使猫の無限ループ筋トレ〜
// 配列完全排除！反復処理特化問題データ (DNCL表記)
// ============================================================

const QUESTIONS = {

  // ==========================================================
  // 🟢 初級：自重スクワット編（4問・制限時間なし・無料ヒントあり）
  // ==========================================================
  beginner: [
    {
      type: "fill",
      title: "🟢 while文の基本：首都当てループ",
      code: `seikai = "東京"\nkotae = ""\n【？】 の間繰り返す：\n｜ 表示する("日本の首都は？")\n｜ kotae = 【外部からの入力】\n表示する("正解です！")`,
      question: "正解の答え「東京」が入力されるまで、繰り返し日本の首都を尋ねるプログラムの空欄【？】に入る条件は？",
      choices: ["kotae != seikai", "kotae == seikai", "kotae < seikai", "kotae > seikai"],
      answer: 0,
      hint: "💡 「東京」と一致しない間（!=）はずっと質問を繰り返すよ！一致したらループ終了だニャ！",
      explanation: "「kotae != seikai」（答えが正解と等しくない）の間繰り返します。正しい首都「東京」が入力されると条件が偽になってループを抜けます。",
      traceSteps: [
        { line: 0, vars: { seikai: '"東京"' } },
        { line: 1, vars: { seikai: '"東京"', kotae: '""' } },
        { line: 2, vars: { 'kotae!=seikai': 'true' } },
        { line: 3, vars: { kotae: '"京都"' } },
        { line: 2, vars: { 'kotae!=seikai': 'true' } },
        { line: 3, vars: { kotae: '"東京"' } },
        { line: 2, vars: { 'kotae!=seikai': 'false' } },
        { line: 4, vars: { 表示: '"正解です！"' } }
      ]
    },
    {
      type: "fill",
      title: "🟢 for文の基本：掛け声カウント",
      code: `i を 【ア】 から 3 まで 1 ずつ増やしながら繰り返す：\n｜ 表示する(【イ】)\n表示する("Go!")`,
      question: "「1, 2, 3, Go!」と掛け声を順に表示するプログラムの空欄【ア】と【イ】の組み合わせとして最も適当なものは？",
      choices: ["ア: 1  イ: i", "ア: 0  イ: i", "ア: 1  イ: 1", "ア: 2  イ: \"Go!\""],
      answer: 0,
      hint: "💡 最初の掛け声は「1」だよ。i は 1 から 3 まで変化するから、表示するのは変数 i だニャ！",
      explanation: "1 から 3 まで変化させ、ループ内で i を表示することで「1, 2, 3」が出力され、最後に「Go!」が表示されます。",
      traceSteps: [
        { line: 0, vars: { i: 1 } },
        { line: 1, vars: { i: 1, 表示: 1 } },
        { line: 0, vars: { i: 2 } },
        { line: 1, vars: { i: 2, 表示: 2 } },
        { line: 0, vars: { i: 3 } },
        { line: 1, vars: { i: 3, 表示: 3 } },
        { line: 2, vars: { 表示: '"Go!"' } }
      ]
    },
    {
      type: "fill",
      title: "🟢 while文への書き換え：掛け声カウント",
      code: `i = 1\n【ア】 の間繰り返す：\n｜ 表示する(i)\n｜ i = i 【イ】 1\n表示する("Go!")`,
      question: "上の問題と同じ機能（「1, 2, 3, Go!」と表示）を持つプログラムの空欄【ア】と【イ】の組み合わせとして最も適当なものは？",
      choices: ["ア: i <= 3  イ: +", "ア: i < 3  イ: +", "ア: i <= 3  イ: -", "ア: i > 3  イ: *"],
      answer: 0,
      hint: "💡 i が 1, 2, 3 の間は繰り返したいので「i <= 3」だね。i を毎回 1 ずつ増やすから「+」だニャ！",
      explanation: "i が 1 から始まり、3 以下の間「i <= 3」繰り返します。毎周 i = i + 1 で 1 ずつ増やすことで、1, 2, 3 と表示されます。",
      traceSteps: [
        { line: 0, vars: { i: 1 } },
        { line: 1, vars: { i: 1, 'i<=3': 'true' } },
        { line: 2, vars: { i: 1, 表示: 1 } },
        { line: 3, vars: { i: 2 } },
        { line: 1, vars: { i: 2, 'i<=3': 'true' } },
        { line: 2, vars: { i: 2, 表示: 2 } },
        { line: 3, vars: { i: 3 } },
        { line: 1, vars: { i: 3, 'i<=3': 'true' } },
        { line: 2, vars: { i: 3, 表示: 3 } },
        { line: 3, vars: { i: 4 } },
        { line: 1, vars: { i: 4, 'i<=3': 'false' } },
        { line: 4, vars: { 表示: '"Go!"' } }
      ]
    },
    {
      type: "fill",
      title: "🟢 複合条件：乗り物利用制限",
      code: `shinchou = 【外部からの入力】\nnenrei = 【外部からの入力】\nもし (shinchou < 130) 【？】 (nenrei < 7) ならば：\n｜ 表示する("ご利用になれません")`,
      question: "ある遊園地の乗り物は「身長130cm未満、または、年齢7歳未満」の場合に乗ることができない。空欄【？】に入る論理演算子は？",
      choices: ["または", "かつ", "でない", "イコール"],
      answer: 0,
      hint: "💡 「どちらか一方でも当てはまったらNG」だから『または』を使うよ！（Pythonの or だニャ！）",
      explanation: "どちらか一方でも満たせば不許可なので「または」を使います。共通テスト表記では Python の or は「または」、and は「かつ」と表記します。",
      traceSteps: [
        { line: 0, vars: { shinchou: 125 } },
        { line: 1, vars: { shinchou: 125, nenrei: 8 } },
        { line: 2, vars: { 'shinchou<130': 'true', 'nenrei<7': 'false', 判定: 'true' } },
        { line: 3, vars: { 表示: '"ご利用になれません"' } }
      ]
    }
  ],

  // ==========================================================
  // 🟡 中級：バーベルスクワット編（5問・1問45秒・ヒントHP-1）
  // ==========================================================
  intermediate: [
    {
      type: "output",
      title: "🟡 累積和の基本：0〜4の合計",
      code: `x = 0\ni を 0 から 4 まで 1 ずつ増やしながら繰り返す：\n｜ x = x + i\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["10", "15", "5", "0"],
      answer: 0,
      hint: "💡 i は 0, 1, 2, 3, 4 と変化して x に足されていくよ！ 0 + 1 + 2 + 3 + 4 を計算してみようニャ！",
      explanation: "i は 0, 1, 2, 3, 4 と変化します。x = 0 + 0 + 1 + 2 + 3 + 4 = 10 となります。Pythonの range(5) に相当します。",
      traceSteps: [
        { line: 0, vars: { x: 0 } },
        { line: 1, vars: { x: 0, i: 0 } },
        { line: 2, vars: { x: 0, i: 0 } },
        { line: 1, vars: { x: 0, i: 1 } },
        { line: 2, vars: { x: 1, i: 1 } },
        { line: 1, vars: { x: 1, i: 2 } },
        { line: 2, vars: { x: 3, i: 2 } },
        { line: 1, vars: { x: 3, i: 3 } },
        { line: 2, vars: { x: 6, i: 3 } },
        { line: 1, vars: { x: 6, i: 4 } },
        { line: 2, vars: { x: 10, i: 4 } },
        { line: 3, vars: { 表示: 10 } }
      ]
    },
    {
      type: "output",
      title: "🟡 増分指定ループ：偶数の加算",
      code: `x = 5\ni を 2 から 8 まで 2 ずつ増やしながら繰り返す：\n｜ x = x + i\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["25", "20", "30", "15"],
      answer: 0,
      hint: "💡 x の初期値は 5 だよ！ i は 2, 4, 6, 8 と 2 ずつ増えるから、5 + 2 + 4 + 6 + 8 を計算するニャ！",
      explanation: "i は 2, 4, 6, 8 と変化します。足す数は 2+4+6+8 = 20 です。初期値 x = 5 なので、x = 5 + 20 = 25 となります。Pythonの range(2, 10, 2) に相当します。",
      traceSteps: [
        { line: 0, vars: { x: 5 } },
        { line: 1, vars: { x: 5, i: 2 } },
        { line: 2, vars: { x: 7, i: 2 } },
        { line: 1, vars: { x: 7, i: 4 } },
        { line: 2, vars: { x: 11, i: 4 } },
        { line: 1, vars: { x: 11, i: 6 } },
        { line: 2, vars: { x: 17, i: 6 } },
        { line: 1, vars: { x: 17, i: 8 } },
        { line: 2, vars: { x: 25, i: 8 } },
        { line: 3, vars: { 表示: 25 } }
      ]
    },
    {
      type: "output",
      title: "🟡 break文：奇数の和の途中脱出",
      code: `x = 0\ni を 1 から 99 まで 2 ずつ増やしながら繰り返す：\n｜ x = x + i\n｜ もし i > 6 ならば：\n｜ ｜ 繰り返しを抜ける\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["16", "9", "25", "4"],
      answer: 0,
      hint: "💡 i は 1, 3, 5, 7 と奇数で進むよ。「i > 6」を満たした瞬間、足し算した後にループを抜けるニャ！",
      explanation: "i の変化: 1(x=1) → 3(x=4) → 5(x=9) → 7(x=16)。i=7 のとき 7 > 6 が成立して break します。よって x = 16 です。",
      traceSteps: [
        { line: 0, vars: { x: 0 } },
        { line: 1, vars: { x: 0, i: 1 } },
        { line: 2, vars: { x: 1, i: 1 } },
        { line: 3, vars: { i: 1, 'i>6': 'false' } },
        { line: 1, vars: { x: 1, i: 3 } },
        { line: 2, vars: { x: 4, i: 3 } },
        { line: 3, vars: { i: 3, 'i>6': 'false' } },
        { line: 1, vars: { x: 4, i: 5 } },
        { line: 2, vars: { x: 9, i: 5 } },
        { line: 3, vars: { i: 5, 'i>6': 'false' } },
        { line: 1, vars: { x: 9, i: 7 } },
        { line: 2, vars: { x: 16, i: 7 } },
        { line: 3, vars: { i: 7, 'i>6': 'true' } },
        { line: 4, vars: { i: 7, 動作: '抜ける' } },
        { line: 5, vars: { 表示: 16 } }
      ]
    },
    {
      type: "fill",
      title: "🟡 穴埋め：2から20までの偶数の和",
      code: `sum = 0\ni を 2 から 20 まで 【？】 ずつ増やしながら繰り返す：\n｜ sum = sum + i\n表示する("偶数の和:", sum)`,
      question: "2 から 20 までの偶数の和（2+4+6+...+20 = 110）を求めたい。空欄【？】に入る値は？",
      choices: ["2", "1", "3", "4"],
      answer: 0,
      hint: "💡 i を 2, 4, 6, 8... と偶数だけにするには、何ずつ増やせばいいかな？",
      explanation: "2 から開始して 2 ずつ増やすことで、2, 4, 6, ..., 20 と偶数だけを順番に加算できます。",
      traceSteps: [
        { line: 0, vars: { sum: 0 } },
        { line: 1, vars: { sum: 0, i: 2 } },
        { line: 2, vars: { sum: 2, i: 2 } },
        { line: 1, vars: { sum: 2, i: 4 } },
        { line: 2, vars: { sum: 6, i: 4 } },
        { line: 1, vars: { sum: 6, i: 6 } },
        { line: 2, vars: { sum: 12, i: 6 } },
        { line: 3, vars: { sum: 110 } }
      ]
    },
    {
      type: "sort",
      title: "🟡 並び替え：1〜Nの合計計算",
      code: null,
      question: "1 から N までの整数の合計を計算して表示するプログラムを正しい順番に並び替えよ。",
      sortLines: [
        "N = 5",
        "sum = 0",
        "i を 1 から N まで 1 ずつ増やしながら繰り返す：",
        "｜ sum = sum + i",
        "表示する(sum)"
      ],
      correctOrder: [
        [0, 1, 2, 3, 4],
        [1, 0, 2, 3, 4]
      ],
      hint: "💡 最初に入力値Nと合計sumの準備（初期化）→ ループで足し算 → 最後に表示する順序ニャ！",
      explanation: "まず N を設定し、合計値 sum を 0 で初期化します。次にループで 1〜N の数値を足し込み、最後に結果を表示します。",
      traceSteps: [
        { line: 0, vars: { N: 5 } },
        { line: 1, vars: { N: 5, sum: 0 } },
        { line: 2, vars: { N: 5, sum: 0, i: 1 } },
        { line: 3, vars: { N: 5, sum: 1, i: 1 } },
        { line: 2, vars: { N: 5, sum: 1, i: 2 } },
        { line: 3, vars: { N: 5, sum: 3, i: 2 } },
        { line: 4, vars: { N: 5, sum: 15 } }
      ]
    }
  ],

  // ==========================================================
  // 🔴 上級：限界突破・筋肥大編（5問・1問30秒・ヒントHP-1）
  // ==========================================================
  advanced: [
    {
      type: "output",
      title: "🔴 while文の追跡：3ずつ増えるループ",
      code: `x = 0\ni = 1\ni <= 10 の間繰り返す：\n｜ x = x + i\n｜ i = i + 3\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["22", "18", "12", "26"],
      answer: 0,
      hint: "💡 i は最初 1 で、毎回 3 ずつ増えるよ（1 → 4 → 7 → 10）。10以下の間足すから 1+4+7+10 だニャ！",
      explanation: "i は 1 → 4 → 7 → 10 と変化します（次は13で終了）。x = 0 + 1 + 4 + 7 + 10 = 22 となります。",
      traceSteps: [
        { line: 0, vars: { x: 0 } },
        { line: 1, vars: { x: 0, i: 1 } },
        { line: 2, vars: { x: 0, i: 1, 'i<=10': 'true' } },
        { line: 3, vars: { x: 1, i: 1 } },
        { line: 4, vars: { x: 1, i: 4 } },
        { line: 2, vars: { x: 1, i: 4, 'i<=10': 'true' } },
        { line: 3, vars: { x: 5, i: 4 } },
        { line: 4, vars: { x: 5, i: 7 } },
        { line: 2, vars: { x: 5, i: 7, 'i<=10': 'true' } },
        { line: 3, vars: { x: 12, i: 7 } },
        { line: 4, vars: { x: 12, i: 10 } },
        { line: 2, vars: { x: 12, i: 10, 'i<=10': 'true' } },
        { line: 3, vars: { x: 22, i: 10 } },
        { line: 4, vars: { x: 22, i: 13 } },
        { line: 2, vars: { x: 22, i: 13, 'i<=10': 'false' } },
        { line: 5, vars: { 表示: 22 } }
      ]
    },
    {
      type: "output",
      title: "🔴 合計値条件のwhile文：限界突破",
      code: `x = 0\ni = 1\nx <= 20 の間繰り返す：\n｜ x = x + i\n｜ i = i + 5\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["34", "21", "18", "25"],
      answer: 0,
      hint: "💡 条件は「x <= 20」だよ！x が 20 を超えた瞬間にループ終了！毎周の (x, i) を追ってみようニャ！",
      explanation: "1周目: x=0+1=1, i=6。2周目: x=1+6=7, i=11。3周目: x=7+11=18, i=16。4周目(x=18≦20): x=18+16=34, i=21。x=34>20 で終了。結果は 34 です。",
      traceSteps: [
        { line: 0, vars: { x: 0 } },
        { line: 1, vars: { x: 0, i: 1 } },
        { line: 2, vars: { x: 0, i: 1, 'x<=20': 'true' } },
        { line: 3, vars: { x: 1, i: 1 } },
        { line: 4, vars: { x: 1, i: 6 } },
        { line: 2, vars: { x: 1, i: 6, 'x<=20': 'true' } },
        { line: 3, vars: { x: 7, i: 6 } },
        { line: 4, vars: { x: 7, i: 11 } },
        { line: 2, vars: { x: 7, i: 11, 'x<=20': 'true' } },
        { line: 3, vars: { x: 18, i: 11 } },
        { line: 4, vars: { x: 18, i: 16 } },
        { line: 2, vars: { x: 18, i: 16, 'x<=20': 'true' } },
        { line: 3, vars: { x: 34, i: 16 } },
        { line: 4, vars: { x: 34, i: 21 } },
        { line: 2, vars: { x: 34, i: 21, 'x<=20': 'false' } },
        { line: 5, vars: { 表示: 34 } }
      ]
    },
    {
      type: "output",
      title: "🔴 掛け算の累積とbreak",
      code: `x = 1\ni を 1 から 99 まで 1 ずつ増やしながら繰り返す：\n｜ x = x * i\n｜ もし x > 20 ならば：\n｜ ｜ 繰り返しを抜ける\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["24", "6", "120", "20"],
      answer: 0,
      hint: "💡 足し算じゃなくて掛け算「x = x * i」だよ！1×1=1 → 1×2=2 → 2×3=6 → 6×4=24。20を超えたらbreakニャ！",
      explanation: "i=1: x=1, i=2: x=2, i=3: x=6, i=4: x=24。ここで x > 20 (24 > 20) が成立し、ループを抜けます。よって x = 24 です。",
      traceSteps: [
        { line: 0, vars: { x: 1 } },
        { line: 1, vars: { x: 1, i: 1 } },
        { line: 2, vars: { x: 1, i: 1 } },
        { line: 3, vars: { x: 1, 'x>20': 'false' } },
        { line: 1, vars: { x: 1, i: 2 } },
        { line: 2, vars: { x: 2, i: 2 } },
        { line: 3, vars: { x: 2, 'x>20': 'false' } },
        { line: 1, vars: { x: 2, i: 3 } },
        { line: 2, vars: { x: 6, i: 3 } },
        { line: 3, vars: { x: 6, 'x>20': 'false' } },
        { line: 1, vars: { x: 6, i: 4 } },
        { line: 2, vars: { x: 24, i: 4 } },
        { line: 3, vars: { x: 24, 'x>20': 'true' } },
        { line: 4, vars: { x: 24, 動作: '抜ける' } },
        { line: 5, vars: { 表示: 24 } }
      ]
    },
    {
      type: "output",
      title: "🔴 剰余（余り）判定とbreak",
      code: `x = 0\ni を 1 から 99 まで 1 ずつ増やしながら繰り返す：\n｜ x = x + i\n｜ もし x % 5 == 0 ならば：\n｜ ｜ 繰り返しを抜ける\n表示する(x)`,
      question: "このプログラムを実行したとき、表示される結果は？",
      choices: ["10", "5", "15", "0"],
      answer: 0,
      hint: "💡 x に 1, 2, 3... を足していくよ。合計 x が 5 の倍数（x % 5 == 0）になった瞬間に抜けるニャ！",
      explanation: "i=1: x=1。i=2: x=3。i=3: x=6。i=4: x=10。ここで 10 % 5 == 0 が成立し、break します。よって x = 10 です。",
      traceSteps: [
        { line: 0, vars: { x: 0 } },
        { line: 1, vars: { x: 0, i: 1 } },
        { line: 2, vars: { x: 1, i: 1 } },
        { line: 3, vars: { x: 1, 'x%5==0': 'false' } },
        { line: 1, vars: { x: 1, i: 2 } },
        { line: 2, vars: { x: 3, i: 2 } },
        { line: 3, vars: { x: 3, 'x%5==0': 'false' } },
        { line: 1, vars: { x: 3, i: 3 } },
        { line: 2, vars: { x: 6, i: 3 } },
        { line: 3, vars: { x: 6, 'x%5==0': 'false' } },
        { line: 1, vars: { x: 6, i: 4 } },
        { line: 2, vars: { x: 10, i: 4 } },
        { line: 3, vars: { x: 10, 'x%5==0': 'true' } },
        { line: 4, vars: { x: 10, 動作: '抜ける' } },
        { line: 5, vars: { 表示: 10 } }
      ]
    },
    {
      type: "trace",
      title: "🔴 最小の自然数：合計100突破",
      code: `sum = 0\nn = 1\nsum <= 100 の間繰り返す：\n｜ sum = sum + n\n｜ n = n + 1\n表示する(n - 1)`,
      question: "1から順に足して合計が100を超える最小の自然数nを求めるプログラムである。終了直後に表示される値は？",
      choices: ["14", "15", "13", "100"],
      answer: 0,
      hint: "💡 1+2+...+13=91、1+2+...+14=105 だよ！ループ内で n が最後に 1 増えて 15 になるから、「n - 1」で 14 に戻すニャ！",
      explanation: "n=14 のとき sum = 105 (>100) となり、その直後に n が 1 増えて 15 になります。条件 sum <= 100 が偽になりループ終了。表示するのは「n - 1」なので 15 - 1 = 14 となります。",
      traceSteps: [
        { line: 0, vars: { sum: 0 } },
        { line: 1, vars: { sum: 0, n: 1 } },
        { line: 2, vars: { sum: 0, n: 1, 'sum<=100': 'true' } },
        { line: 3, vars: { sum: 1, n: 1 } },
        { line: 4, vars: { sum: 1, n: 2 } },
        { line: 2, vars: { sum: 91, n: 14, 'sum<=100': 'true' } },
        { line: 3, vars: { sum: 105, n: 14 } },
        { line: 4, vars: { sum: 105, n: 15 } },
        { line: 2, vars: { sum: 105, n: 15, 'sum<=100': 'false' } },
        { line: 5, vars: { 'n-1': 14, 表示: 14 } }
      ]
    }
  ]
};
