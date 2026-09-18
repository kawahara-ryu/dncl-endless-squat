// ============================================================
// エンドレス・スクワット地獄 〜天使猫の無限ループ筋トレ〜
// ゲームメインロジック (main.js)
// ============================================================

// === ゲーム状態 ===
let currentDifficulty = 'beginner';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let hp = 5;
let maxHp = 5;
let timer = null;
let timeLeft = 0;
let timerLimit = 0;
let isAnswered = false;
let isSurvivalMode = false;
let survivalQuestionCount = 0;
let currentCombo = 0;
let currentItem = null;
let isHintUsedInCurrentQuestion = false;
let wrongAnswers = [];

// === 難易度設定 ===
const DIFFICULTY_CONFIG = {
  beginner: { hp: 5, timer: 0, label: '自重スクワット（初級）' },
  intermediate: { hp: 4, timer: 45, label: 'バーベルスクワット（中級）' },
  advanced: { hp: 3, timer: 30, label: '限界突破・筋肥大（上級）' },
  survival: { hp: 3, timer: 35, label: '24時間耐久筋トレ（サバイバル）' }
};

// === 天使猫コーチのセリフ集 ===
const COACH_QUOTES = {
  correct: [
    'ナイスバルク！キレてるニャ！',
    '背筋が伸びてるニャ！美しいフォーム！',
    '大腿四頭筋が喜んでるニャ！',
    'プロテイン注入完了ニャ！',
    '天国への階段を一歩登ったニャ！'
  ],
  wrong: [
    'フォームが崩れてるニャ！やり直し！',
    '乳酸に負けるなニャ！',
    '筋繊維が泣いてるニャ！',
    'あと1回！もう1回！',
    '休んでる暇はないニャ！'
  ],
  idle: [
    'ナイスバルク！腕立てよりスクワットだニャ！',
    'for文は回数！while文は限界まで！',
    'break文はギブアップじゃなくて戦術ニャ！',
    'プロテインは裏切らないニャ！'
  ]
};

// === BGM制御 ===
let bgmAudio = null;
let isBgmEnabled = true;
let currentBgmTrack = null;

function initBgm() {
  if (!bgmAudio) {
    bgmAudio = new Audio();
    bgmAudio.loop = true;
    bgmAudio.volume = 0.35;
  }
}

function playBgm(track) {
  if (!isBgmEnabled) return;
  initBgm();
  const file = track === 'title' ? './bgm_title.mp3' : './bgm_main.mp3';
  if (currentBgmTrack !== track) {
    currentBgmTrack = track;
    bgmAudio.src = file;
    bgmAudio.play().catch(() => {});
  } else if (bgmAudio.paused) {
    bgmAudio.play().catch(() => {});
  }
}

function stopBgm() {
  if (bgmAudio) {
    bgmAudio.pause();
    currentBgmTrack = null;
  }
}

function toggleBgm() {
  isBgmEnabled = !isBgmEnabled;
  const btn = document.getElementById('bgm-toggle-btn');
  if (isBgmEnabled) {
    btn.textContent = '🎵 BGM: ON';
    btn.style.borderColor = 'var(--primary-gold)';
    btn.style.color = 'var(--primary-gold)';
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && (activeScreen.id === 'screen-title' || activeScreen.id === 'screen-difficulty')) {
      playBgm('title');
    } else {
      playBgm('main');
    }
  } else {
    btn.textContent = '🔇 BGM: OFF';
    btn.style.borderColor = 'var(--text-dim)';
    btn.style.color = 'var(--text-dim)';
    stopBgm();
  }
}

// === Web Audio API による効果音生成 ===
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playClick() { playTone(800, 'sine', 0.05, 0.1); }
function playTick() { playTone(600, 'triangle', 0.04, 0.08); }

function playCorrect() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'triangle', 0.25, 0.2);
      }, idx * 70);
    });
  } catch (e) {}
}

function playWrong() {
  try {
    const ctx = getAudioContext();
    playTone(180, 'sawtooth', 0.35, 0.3);
    setTimeout(() => { playTone(120, 'sawtooth', 0.45, 0.3); }, 120);
  } catch (e) {}
}

function playTimeUp() {
  playTone(150, 'sawtooth', 0.6, 0.35);
}

function playVictory() {
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  notes.forEach((freq, idx) => {
    setTimeout(() => { playTone(freq, 'sine', 0.4, 0.25); }, idx * 120);
  });
}

function playGameOver() {
  const notes = [400, 350, 300, 250, 200];
  notes.forEach((freq, idx) => {
    setTimeout(() => { playTone(freq, 'sawtooth', 0.35, 0.2); }, idx * 140);
  });
}

// === 画面遷移 ===
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

function goToTitle() {
  playClick();
  playBgm('title');
  showScreen('screen-title');
}

function goToDifficulty() {
  playClick();
  playBgm('title');
  showScreen('screen-difficulty');
}

function goToDifficultyFromGameover() {
  document.getElementById('gameover-overlay').classList.remove('visible');
  goToDifficulty();
}

function retryFromGameover() {
  document.getElementById('gameover-overlay').classList.remove('visible');
  startGame(currentDifficulty);
}

// === ゲーム初期化 ===
function startGame(difficulty) {
  playClick();
  currentDifficulty = difficulty;
  const config = DIFFICULTY_CONFIG[difficulty];

  playBgm('main');

  isSurvivalMode = (difficulty === 'survival');
  survivalQuestionCount = 0;
  currentCombo = 0;
  currentItem = null;
  updateItemUI();

  if (isSurvivalMode) {
    currentQuestions = [...QUESTIONS.beginner, ...QUESTIONS.intermediate, ...QUESTIONS.advanced];
  } else {
    currentQuestions = [...QUESTIONS[difficulty]];
  }
  shuffleArray(currentQuestions);

  currentQuestionIndex = 0;
  score = 0;
  hp = config.hp;
  maxHp = config.hp;
  timerLimit = config.timer;
  isAnswered = false;
  wrongAnswers = [];
  clearTrace();

  updateHUD();
  document.getElementById('timer-area').style.display = timerLimit > 0 ? 'flex' : 'none';

  setCoachSpeech(COACH_QUOTES.idle[Math.floor(Math.random() * COACH_QUOTES.idle.length)]);

  showScreen('screen-game');
  loadQuestion();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// === コーチ（天使猫）セリフ更新 ===
function setCoachSpeech(text) {
  const el = document.getElementById('coach-speech');
  if (el) el.textContent = text;
}

// === HUD 更新 ===
function updateHUD() {
  document.getElementById('hp-text').textContent = `${hp}/${maxHp}`;
  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  document.getElementById('hp-bar').style.width = `${hpPct}%`;

  document.getElementById('score-text').textContent = score;

  const totalQ = isSurvivalMode ? '∞' : currentQuestions.length;
  const curQ = isSurvivalMode ? (survivalQuestionCount + 1) : (currentQuestionIndex + 1);
  document.getElementById('q-progress').textContent = `${curQ}/${totalQ}`;
}

function updateItemUI() {
  const slot = document.getElementById('item-slot');
  const emoji = document.getElementById('item-emoji');
  if (!currentItem) {
    slot.style.display = 'none';
  } else {
    slot.style.display = 'flex';
    emoji.textContent = currentItem === 'protein' ? '🥤 プロテイン' : '🛼 筋膜ローラー';
  }
}

function addCombo() {
  currentCombo++;
  if (currentCombo === 3 && !currentItem) {
    currentItem = Math.random() < 0.5 ? 'protein' : 'roller';
    updateItemUI();
  }
}

function useItem() {
  if (!currentItem || isAnswered) return;
  if (currentItem === 'protein') {
    currentItem = null;
    updateItemUI();
    timeLeft += 15;
    updateTimerDisplay();
    playTone(600, 'sine', 0.2, 0.3);
    setCoachSpeech('プロテイン補給！乳酸値回復ニャ！');
  } else if (currentItem === 'roller') {
    currentItem = null;
    updateItemUI();
    eliminateWrongChoice();
    setCoachSpeech('筋膜リリース！不正解選択肢を破壊したニャ！');
  }
}

// === タイマー ===
function startTimer() {
  if (timerLimit <= 0) return;
  timeLeft = timerLimit;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 5) playTick();
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      handleTimeUp();
    }
  }, 1000);
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-text');
  el.textContent = timeLeft;
  el.className = 'timer-display' + (timeLeft <= 5 ? ' urgent' : '');
}

function handleTimeUp() {
  if (isAnswered) return;
  isAnswered = true;
  playTimeUp();
  hp--;
  const q = currentQuestions[currentQuestionIndex];
  wrongAnswers.push({ question: q, userAnswer: 'タイムアップ' });

  flashScreen('damage');
  dropDumbbells();

  updateHUD();

  if (q.type !== 'sort') {
    const btns = document.querySelectorAll('.choice-btn');
    btns.forEach(btn => {
      btn.classList.add('disabled');
      if (btn.dataset.correct === "true") btn.classList.add('show-answer');
    });
  } else {
    const submitBtn = document.querySelector('.sort-submit-btn');
    if (submitBtn) submitBtn.style.display = 'none';
    showSortAnswerCode(q);
  }

  showExplanation(q.explanation + '\n\n⏰ 時間切れニャ！乳酸が限界突破して筋断裂寸前！');
  setCoachSpeech(COACH_QUOTES.wrong[Math.floor(Math.random() * COACH_QUOTES.wrong.length)]);

  if (q.traceSteps) {
    const traceBtn = document.getElementById('trace-btn');
    if (traceBtn) traceBtn.style.display = 'inline-block';
  }

  if (hp <= 0) {
    setTimeout(() => showGameOver(), 1200);
    return;
  }
  showNextButton();
}

// === 問題読み込み ===
function loadQuestion() {
  isAnswered = false;
  isHintUsedInCurrentQuestion = false;
  stopTimer();
  const q = currentQuestions[currentQuestionIndex];

  // ヘッダー
  document.getElementById('q-number').textContent =
    'SET ' + String(currentQuestionIndex + 1).padStart(2, '0');
  document.getElementById('q-title').textContent = q.title;

  // ヒントボタン
  const btnHint = document.getElementById('btn-hint');
  if (btnHint) {
    btnHint.disabled = false;
    btnHint.style.display = 'inline-block';
  }

  // コードモニター（前問のコードを確実にクリア）
  const codeEl = document.getElementById('code-display');
  codeEl.innerHTML = '';
  if (q.code) {
    codeEl.innerHTML = highlightDNCL(q.code);
    codeEl.parentElement.style.display = 'block';
  } else {
    codeEl.parentElement.style.display = 'none';
  }

  // 問題文
  document.getElementById('q-text').textContent = q.question;

  // 解説・トレース表・次へボタンの非表示
  document.getElementById('explanation-box').classList.remove('visible');
  document.getElementById('next-btn').classList.remove('visible');
  document.getElementById('trace-btn').style.display = 'none';
  clearTrace();

  // エリア表示切り替え
  const choicesArea = document.getElementById('choices-area');
  const sortArea = document.getElementById('sort-area');

  if (q.type === 'sort') {
    choicesArea.style.display = 'none';
    sortArea.style.display = 'flex';
    renderSortQuestion(q);
  } else {
    choicesArea.style.display = 'grid';
    sortArea.style.display = 'none';
    renderChoiceQuestion(q);
  }

  updateHUD();
  startTimer();
}

// === DNCL Syntax Highlighting ===
function highlightDNCL(code) {
  let processed = escapeHtml(code);
  const regex = /(&quot;.*?&quot;)|(表示する|を|から|まで|ずつ増やしながら繰り返す：|ずつ減らしながら繰り返す：|の間繰り返す：|繰り返しを抜ける|もし|ならば：|そうでなければ：|かつ|または)|(\d+)|(&lt;=|&gt;=|==|!=|&lt;&gt;|&lt;|&gt;|[=+\-*/%!]+)/g;

  processed = processed.replace(regex, (match, p1, p2, p3, p4) => {
    if (p1) return `<span class="string">${p1.replace(/&quot;/g, '"')}</span>`;
    if (p2) return `<span class="keyword">${p2}</span>`;
    if (p3) return `<span class="number">${p3}</span>`;
    if (p4) return `<span class="operator">${p4}</span>`;
    return match;
  });

  processed = processed.replace(/【？】/g, '<span class="blank">【？】</span>');
  processed = processed.replace(/【ア】/g, '<span class="blank">【ア】</span>');
  processed = processed.replace(/【イ】/g, '<span class="blank">【イ】</span>');

  const lines = processed.split('\n');
  return lines.map(l => `<span class="code-line">${l || ' '}</span>`).join('');
}

// === 選択問題のレンダリング ===
function renderChoiceQuestion(q) {
  const area = document.getElementById('choices-area');
  area.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];

  const shuffledChoices = q.choices.map((text, idx) => ({ text, isCorrect: idx === q.answer }));
  shuffleArray(shuffledChoices);

  shuffledChoices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.dataset.correct = c.isCorrect;
    btn.innerHTML = `<span class="choice-label">${labels[i]}</span><span>${escapeHtml(c.text)}</span>`;
    btn.onclick = () => handleChoiceAnswer(c.isCorrect, btn, q);
    area.appendChild(btn);
  });
}

function handleChoiceAnswer(isCorrect, clickedBtn, q) {
  if (isAnswered) return;
  isAnswered = true;
  stopTimer();

  const allBtns = document.querySelectorAll('.choice-btn');
  allBtns.forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.correct === "true") b.classList.add('show-answer');
  });

  if (isCorrect) {
    clickedBtn.classList.add('correct');
    handleCorrect(q);
  } else {
    clickedBtn.classList.add('wrong');
    handleWrong(q, clickedBtn.textContent);
  }
}

// === 並び替え問題のレンダリング ===
function renderSortQuestion(q) {
  const area = document.getElementById('sort-area');
  area.innerHTML = '';

  const indices = q.sortLines.map((_, i) => i);
  shuffleArray(indices);

  indices.forEach(origIdx => {
    const item = document.createElement('div');
    item.className = 'sort-item';
    item.draggable = true;
    item.dataset.origIndex = origIdx;
    item.innerHTML = `<span class="grip">⠿</span><span>${escapeHtml(q.sortLines[origIdx])}</span>`;

    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);

    item.addEventListener('touchstart', handleTouchStart, { passive: false });
    item.addEventListener('touchmove', handleTouchMove, { passive: false });
    item.addEventListener('touchend', handleTouchEnd);

    area.appendChild(item);
  });

  const submitBtn = document.createElement('button');
  submitBtn.className = 'sort-submit-btn';
  submitBtn.textContent = '✔️ フォームを確定（回答）';
  submitBtn.onclick = () => handleSortAnswer(q);
  area.appendChild(submitBtn);
}

// Drag & Drop
let draggedItem = null;
function handleDragStart(e) { draggedItem = this; this.classList.add('dragging'); }
function handleDragOver(e) { e.preventDefault(); }
function handleDragEnter(e) {
  e.preventDefault();
  if (this !== draggedItem && this.classList.contains('sort-item')) this.classList.add('drag-over');
}
function handleDragLeave() { this.classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (draggedItem && this !== draggedItem && this.classList.contains('sort-item')) {
    const area = document.getElementById('sort-area');
    const items = [...area.querySelectorAll('.sort-item')];
    const fromIdx = items.indexOf(draggedItem);
    const toIdx = items.indexOf(this);
    if (fromIdx < toIdx) area.insertBefore(draggedItem, this.nextSibling);
    else area.insertBefore(draggedItem, this);
    playClick();
  }
}
function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.sort-item').forEach(i => i.classList.remove('drag-over'));
  draggedItem = null;
}

// Touch Support
let touchDragItem = null;
function handleTouchStart(e) { touchDragItem = this; this.classList.add('dragging'); }
function handleTouchMove(e) {
  e.preventDefault();
  if (!touchDragItem) return;
  const touch = e.touches[0];
  const items = [...document.querySelectorAll('.sort-item')];
  items.forEach(item => {
    if (item === touchDragItem) return;
    const rect = item.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    item.classList.remove('drag-over');
    if (Math.abs(touch.clientY - midY) < rect.height / 2) item.classList.add('drag-over');
  });
}
function handleTouchEnd() {
  if (!touchDragItem) return;
  touchDragItem.classList.remove('dragging');
  const items = [...document.querySelectorAll('.sort-item')];
  const targetItem = items.find(i => i.classList.contains('drag-over'));
  if (targetItem && targetItem !== touchDragItem) {
    const area = document.getElementById('sort-area');
    const fromIdx = items.indexOf(touchDragItem);
    const toIdx = items.indexOf(targetItem);
    if (fromIdx < toIdx) area.insertBefore(touchDragItem, targetItem.nextSibling);
    else area.insertBefore(touchDragItem, targetItem);
    playClick();
  }
  items.forEach(i => i.classList.remove('drag-over'));
  touchDragItem = null;
}

// 並び替え判定
function handleSortAnswer(q) {
  if (isAnswered) return;
  isAnswered = true;
  stopTimer();

  const area = document.getElementById('sort-area');
  const items = [...area.querySelectorAll('.sort-item')];
  const userOrder = items.map(item => parseInt(item.dataset.origIndex));

  const normalizedCorrectOrders = Array.isArray(q.correctOrder[0])
    ? q.correctOrder
    : [q.correctOrder];

  let isCorrect = false;
  let matchedOrder = normalizedCorrectOrders[0];

  for (const order of normalizedCorrectOrders) {
    if (userOrder.every((val, idx) => val === order[idx])) {
      isCorrect = true;
      matchedOrder = order;
      break;
    }
  }

  items.forEach((item, idx) => {
    if (parseInt(item.dataset.origIndex) === matchedOrder[idx]) {
      item.classList.add('correct-pos');
    } else {
      item.classList.add('wrong-pos');
    }
  });

  const submitBtn = area.querySelector('.sort-submit-btn');
  if (submitBtn) submitBtn.style.display = 'none';

  // 正解コードをコードモニターに表示
  showSortAnswerCode(q);

  if (isCorrect) handleCorrect(q);
  else handleWrong(q, '並び順が違います');
}

function showSortAnswerCode(q) {
  if (q && q.type === 'sort' && q.sortLines) {
    const codeEl = document.getElementById('code-display');
    if (codeEl) {
      codeEl.innerHTML = highlightDNCL(q.sortLines.join('\n'));
      codeEl.parentElement.style.display = 'block';
    }
  }
}

// === 正解・不正解ハンドラ ===
function handleCorrect(q) {
  let bonus = 0;
  if (timerLimit > 0) {
    bonus = Math.floor((timeLeft / timerLimit) * 50);
  }
  score += 100 + bonus;
  addCombo();

  flashScreen('correct');
  playCorrect();
  updateHUD();

  // 神々しいマッスルオーラ
  const divine = document.getElementById('divine-light-layer');
  if (divine) {
    divine.style.display = 'block';
    divine.style.opacity = '1';
    setTimeout(() => {
      divine.style.transition = 'opacity 0.6s ease';
      divine.style.opacity = '0';
      setTimeout(() => { divine.style.display = 'none'; }, 600);
    }, 400);
  }

  const quote = COACH_QUOTES.correct[Math.floor(Math.random() * COACH_QUOTES.correct.length)];
  setCoachSpeech(quote);

  showExplanation(`💪 ${quote}\n\n${q.explanation}`);

  if (q.traceSteps) {
    const traceBtn = document.getElementById('trace-btn');
    if (traceBtn) traceBtn.style.display = 'inline-block';
  }
  showNextButton();
}

function handleWrong(q, userAnswer) {
  hp--;
  score = Math.max(0, score - 20);
  currentCombo = 0;
  wrongAnswers.push({ question: q, userAnswer: userAnswer });

  flashScreen('damage');
  playWrong();
  dropDumbbells();
  updateHUD();

  const quote = COACH_QUOTES.wrong[Math.floor(Math.random() * COACH_QUOTES.wrong.length)];
  setCoachSpeech(quote);

  showExplanation(`💥 筋肉痛発生！ 不正解ニャ！\n\n${q.explanation}`);

  if (q.traceSteps) {
    const traceBtn = document.getElementById('trace-btn');
    if (traceBtn) traceBtn.style.display = 'inline-block';
  }

  if (hp <= 0) {
    setTimeout(() => showGameOver(), 1200);
    return;
  }
  showNextButton();
}

function showExplanation(text) {
  const box = document.getElementById('explanation-box');
  const el = document.getElementById('explanation-text');
  el.textContent = text;
  box.classList.add('visible');
}

function showNextButton() {
  document.getElementById('next-btn').classList.add('visible');
}

function nextQuestion() {
  playClick();
  if (isSurvivalMode) {
    survivalQuestionCount++;
    if (timerLimit > 12) timerLimit -= 1;
    currentQuestionIndex = Math.floor(Math.random() * currentQuestions.length);
    updateHUD();
    loadQuestion();
  } else {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuestions.length) {
      showResult();
    } else {
      loadQuestion();
    }
  }
}

// === トレース機能（ステップ実行） ===
let currentTraceStepIndex = 0;
let traceVarKeys = [];

function startTraceReplay() {
  const q = currentQuestions[currentQuestionIndex];
  if (!q || !q.traceSteps) return;

  if (q.type === 'sort') {
    showSortAnswerCode(q);
  }

  document.getElementById('trace-btn').style.display = 'none';

  const container = document.getElementById('trace-table-container');
  container.style.display = 'block';

  traceVarKeys = [];
  q.traceSteps.forEach(step => {
    Object.keys(step.vars).forEach(k => {
      if (!traceVarKeys.includes(k)) traceVarKeys.push(k);
    });
  });

  const table = document.getElementById('trace-table');
  let thead = `<tr><th>ステップ</th>`;
  traceVarKeys.forEach(k => { thead += `<th>${k}</th>`; });
  thead += `<th>処理内容</th></tr>`;
  table.innerHTML = thead;

  currentTraceStepIndex = 0;
  renderTraceStep();
}

function renderTraceStep() {
  const q = currentQuestions[currentQuestionIndex];
  const table = document.getElementById('trace-table');
  const stepData = q.traceSteps[currentTraceStepIndex];

  const tr = document.createElement('tr');
  tr.className = 'active-row';

  let tdHtml = `<td>${currentTraceStepIndex + 1}</td>`;
  traceVarKeys.forEach(k => {
    tdHtml += `<td>${stepData.vars[k] !== undefined ? stepData.vars[k] : ''}</td>`;
  });

  const lines = document.querySelectorAll('#code-display .code-line');
  let lineText = '';
  if (q.sortLines && q.sortLines[stepData.line] !== undefined) {
    lineText = q.sortLines[stepData.line].replace(/｜/g, '').trim();
  } else if (lines[stepData.line]) {
    lineText = lines[stepData.line].textContent.replace(/｜/g, '').trim();
  } else if (q.code) {
    const raw = q.code.split('\n');
    if (raw[stepData.line]) lineText = raw[stepData.line].replace(/｜/g, '').trim();
  }
  tdHtml += `<td class="td-action">${lineText}</td>`;
  tr.innerHTML = tdHtml;

  table.querySelectorAll('tr').forEach(r => r.classList.remove('active-row'));
  table.appendChild(tr);

  const wrapper = document.querySelector('.trace-table-wrapper');
  if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;

  lines.forEach(l => l.classList.remove('active-trace'));
  if (lines[stepData.line]) lines[stepData.line].classList.add('active-trace');

  playTone(450 + stepData.line * 30, 'sine', 0.05, 0.1);

  document.getElementById('trace-step-text').textContent = `Step: ${currentTraceStepIndex + 1} / ${q.traceSteps.length}`;
  document.getElementById('trace-prev-btn').disabled = (currentTraceStepIndex === 0);

  const nextBtn = document.getElementById('trace-next-btn');
  if (currentTraceStepIndex >= q.traceSteps.length - 1) {
    nextBtn.disabled = true;
    nextBtn.textContent = '完了';
  } else {
    nextBtn.disabled = false;
    nextBtn.textContent = '次へ ▶';
  }
}

function nextTraceStep() {
  const q = currentQuestions[currentQuestionIndex];
  if (currentTraceStepIndex < q.traceSteps.length - 1) {
    currentTraceStepIndex++;
    renderTraceStep();
  }
}

function prevTraceStep() {
  if (currentTraceStepIndex > 0) {
    currentTraceStepIndex--;
    const q = currentQuestions[currentQuestionIndex];
    const table = document.getElementById('trace-table');
    table.removeChild(table.lastChild);

    const newLast = table.lastChild;
    if (newLast && newLast.tagName === 'TR' && newLast.rowIndex > 0) {
      newLast.classList.add('active-row');
    }

    const stepData = q.traceSteps[currentTraceStepIndex];
    const lines = document.querySelectorAll('#code-display .code-line');
    lines.forEach(l => l.classList.remove('active-trace'));
    if (lines[stepData.line]) lines[stepData.line].classList.add('active-trace');

    playTone(320, 'sine', 0.05, 0.1);
    document.getElementById('trace-step-text').textContent = `Step: ${currentTraceStepIndex + 1} / ${q.traceSteps.length}`;
    document.getElementById('trace-prev-btn').disabled = (currentTraceStepIndex === 0);
    const nextBtn = document.getElementById('trace-next-btn');
    nextBtn.disabled = false;
    nextBtn.textContent = '次へ ▶';
  }
}

function clearTrace() {
  document.getElementById('trace-table-container').style.display = 'none';
  const traceBtn = document.getElementById('trace-btn');
  const q = currentQuestions[currentQuestionIndex];
  if (traceBtn && q && q.traceSteps && isAnswered) {
    traceBtn.style.display = 'inline-block';
  } else if (traceBtn) {
    traceBtn.style.display = 'none';
  }
  document.querySelectorAll('#code-display .code-line').forEach(l => l.classList.remove('active-trace'));
}

// === ヒントモーダル ===
function openHintModal() {
  playClick();
  const q = currentQuestions[currentQuestionIndex];
  if (!q) return;

  const overlay = document.getElementById('hint-modal-overlay');
  const textBox = document.getElementById('hint-text-box');
  const traceContainer = document.getElementById('hint-trace-table-container');
  const eliminateBtn = document.getElementById('btn-eliminate-choice');

  let hintHtml = q.hint || "💡 ループごとに変数がどう変化していくか追ってみようニャ！";
  if (currentDifficulty !== 'beginner' && hp <= 1) {
    hintHtml += "<br><br><span style='color:var(--danger-red); font-size:0.85rem;'>⚠️ HPが1のため、これ以上ヒント閲覧によるHP消費はできません。</span>";
  } else if (currentDifficulty !== 'beginner' && !isHintUsedInCurrentQuestion) {
    hintHtml += "<br><br><span style='color:var(--warning-orange); font-size:0.85rem;'>※ ヒント閲覧により 筋力HP を 1 消費します。</span>";
  }
  textBox.innerHTML = hintHtml;

  // 途中トレース表（1〜3ステップ）
  if (q.traceSteps && q.traceSteps.length > 0) {
    const previewSteps = q.traceSteps.slice(0, Math.min(3, q.traceSteps.length));
    const varKeys = [];
    q.traceSteps.forEach(step => {
      Object.keys(step.vars).forEach(k => { if (!varKeys.includes(k)) varKeys.push(k); });
    });

    let tableHtml = `<table class="trace-table" style="font-size:0.8rem;"><thead><tr><th>Step</th>`;
    varKeys.forEach(k => { tableHtml += `<th>${k}</th>`; });
    tableHtml += `</tr></thead><tbody>`;

    previewSteps.forEach((step, idx) => {
      tableHtml += `<tr><td>${idx + 1}</td>`;
      varKeys.forEach(k => {
        tableHtml += `<td>${step.vars[k] !== undefined ? step.vars[k] : ''}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table>`;
    traceContainer.innerHTML = tableHtml;
  } else {
    traceContainer.innerHTML = "<div style='color:var(--text-dim); font-size:0.85rem;'>※ この問題に途中トレースはありません。</div>";
  }

  // 選択肢除外ボタン
  if (q.type === 'sort' || isAnswered) {
    eliminateBtn.style.display = 'none';
  } else {
    eliminateBtn.style.display = 'inline-block';
    const remainingBtns = Array.from(document.querySelectorAll('.choice-btn')).filter(b => b.style.display !== 'none');
    if (remainingBtns.length <= 2) {
      eliminateBtn.disabled = true;
      eliminateBtn.textContent = '✂️ 削減済み';
    } else {
      eliminateBtn.disabled = false;
      eliminateBtn.textContent = '✂️ プロテイン補給（不正解を1つ除外）';
    }
  }

  // 初級以外でHP消費
  if (currentDifficulty !== 'beginner' && !isHintUsedInCurrentQuestion) {
    if (hp > 1) {
      hp--;
      updateHUD();
      flashScreen('damage');
      isHintUsedInCurrentQuestion = true;
    }
  }

  overlay.classList.add('active');
}

function closeHintModal() {
  playClick();
  const overlay = document.getElementById('hint-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

function handleModalOverlayClick(e) {
  if (e.target && e.target.id === 'hint-modal-overlay') closeHintModal();
}

function eliminateWrongChoice() {
  playClick();
  const q = currentQuestions[currentQuestionIndex];
  if (!q || isAnswered || q.type === 'sort') return;

  const choiceBtns = Array.from(document.querySelectorAll('.choice-btn')).filter(btn => btn.style.display !== 'none');
  const wrongBtns = choiceBtns.filter(btn => btn.dataset.correct !== "true");

  if (wrongBtns.length > 0) {
    const target = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
    target.style.display = 'none';
    playTone(280, 'sawtooth', 0.2, 0.1);
  }

  const btn = document.getElementById('btn-eliminate-choice');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '✂️ 削減済み';
  }
}

// === 画面フラッシュ ＆ 落下エフェクト ===
function flashScreen(type) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0'; div.style.left = '0';
  div.style.width = '100vw'; div.style.height = '100vh';
  div.style.pointerEvents = 'none'; div.style.zIndex = '999';
  div.style.transition = 'opacity 0.4s ease';

  if (type === 'correct') {
    div.style.background = 'radial-gradient(circle, rgba(0, 255, 136, 0.35) 0%, transparent 70%)';
  } else if (type === 'damage') {
    div.style.background = 'radial-gradient(circle, rgba(255, 51, 102, 0.45) 0%, transparent 70%)';
  }

  document.body.appendChild(div);
  setTimeout(() => {
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 400);
  }, 100);
}

// ダンベル＆プロテインシェイカーの落下
function dropDumbbells() {
  const items = ['🏋️‍♀️', '🥤', '💊', '💥', '🍗'];
  for (let i = 0; i < 5; i++) {
    const el = document.createElement('div');
    el.className = 'muscle-drop-item';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    el.style.left = (10 + Math.random() * 80) + 'vw';
    el.style.top = '-50px';
    el.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease';
    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transform = `translateY(${window.innerHeight * 0.75 + Math.random() * 100}px) rotate(${Math.random() * 360}deg)`;
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
      }, 600);
    }, i * 100);
  }
}

// === 結果画面 ＆ ゲームオーバー ===
function showGameOver() {
  stopTimer();
  playGameOver();
  document.getElementById('gameover-overlay').classList.add('visible');
  const hintEl = document.getElementById('gameover-hint');
  if (wrongAnswers.length > 0) {
    const lastWrong = wrongAnswers[wrongAnswers.length - 1];
    hintEl.textContent = '💡 ヒント: ' + lastWrong.question.title + ' の反復条件をもう一度見直すニャ！';
  } else {
    hintEl.textContent = '';
  }
}

function showResult() {
  stopTimer();
  playVictory();
  playBgm('title');
  showScreen('screen-result');

  const rankEl = document.getElementById('rank-display');
  const titleEl = document.getElementById('result-title');
  const statsEl = document.getElementById('result-stats');
  const reviewSection = document.getElementById('review-section');
  const passwordSection = document.getElementById('password-section');

  const correctCount = currentQuestions.length - wrongAnswers.length;
  const accuracy = Math.round((correctCount / currentQuestions.length) * 100);

  let rank = 'C';
  if (accuracy >= 100) rank = 'S';
  else if (accuracy >= 80) rank = 'A';
  else if (accuracy >= 60) rank = 'B';

  rankEl.textContent = rank;

  if (rank === 'S') titleEl.textContent = '👼 美筋大天使へと成仏！ 👼';
  else if (rank === 'A') titleEl.textContent = '💪 マッスルマスター認定！ 💪';
  else if (rank === 'B') titleEl.textContent = '🏋️ 筋肉痛サバイバー！ 🏋️';
  else titleEl.textContent = '💀 筋断裂…スクワット続行！ 💀';

  statsEl.innerHTML = `
    <div>コース: <strong>${DIFFICULTY_CONFIG[currentDifficulty].label}</strong></div>
    <div>最終スコア: <strong>${score} pt</strong></div>
    <div>正答率: <strong>${accuracy}%</strong> (${correctCount}/${currentQuestions.length}問正解)</div>
    <div>残り筋力HP: <strong>${hp}/${maxHp}</strong></div>
  `;

  if (wrongAnswers.length > 0) {
    reviewSection.style.display = 'block';
    const retryBtn = document.getElementById('btn-retry-wrong');
    if (retryBtn) retryBtn.style.display = 'inline-block';

    let reviewHtml = `
      <div class="review-section-title">
        <span>📝 筋肉痛（不正解）問題の徹底復習 (${wrongAnswers.length}問)</span>
      </div>
      <div class="review-cards-list">
    `;

    wrongAnswers.forEach((w, idx) => {
      const q = w.question;
      let correctAnsText = '';
      if (q.type === 'sort') {
        correctAnsText = q.sortLines.map((l, i) => `${i + 1}. ${l.replace(/｜/g, '').trim()}`).join('<br>');
      } else if (q.choices && q.choices[q.answer] !== undefined) {
        correctAnsText = q.choices[q.answer];
      }

      let codeHtml = '';
      if (q.code) {
        codeHtml = `<div class="review-code-box">${highlightDNCL(q.code)}</div>`;
      } else if (q.sortLines) {
        codeHtml = `<div class="review-code-box">${highlightDNCL(q.sortLines.join('\n'))}</div>`;
      }

      const hasTrace = q.traceSteps && q.traceSteps.length > 0;

      reviewHtml += `
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-card-title">📌 SET ${idx + 1}: ${escapeHtml(q.title)}</div>
            <div class="review-card-badge">❌ 不正解</div>
          </div>
          <div class="review-q-text">${escapeHtml(q.question)}</div>
          ${codeHtml}
          <div class="review-ans-grid">
            <div class="ans-box ans-user">
              <span class="ans-label">❌ あなたの回答</span>
              <div>${escapeHtml(w.userAnswer || '未回答')}</div>
            </div>
            <div class="ans-box ans-correct">
              <span class="ans-label">✅ 正しい答え</span>
              <div>${correctAnsText}</div>
            </div>
          </div>
          <div class="review-exp-box">
            💡 <strong>解説:</strong> ${escapeHtml(q.explanation)}
          </div>
          ${hasTrace ? `
            <button class="btn-review-trace" onclick="openReviewTraceModal(${idx})">
              🔍 トレース表で変数の動きを復習する
            </button>
          ` : ''}
        </div>
      `;
    });

    reviewHtml += `</div>`;
    reviewSection.innerHTML = reviewHtml;
  } else {
    reviewSection.style.display = 'none';
    const retryBtn = document.getElementById('btn-retry-wrong');
    if (retryBtn) retryBtn.style.display = 'none';
  }

  // あいことば
  passwordSection.style.display = 'block';
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  document.getElementById('password-text').textContent = `[SQUAT-${currentDifficulty.toUpperCase()}-${rank}-${score}-${dateStr}]`;
}

// === 間違えた問題だけ再特訓 ===
function retryWrongQuestionsOnly() {
  if (wrongAnswers.length === 0) return;
  playClick();
  playBgm('main');

  currentQuestions = wrongAnswers.map(w => w.question);
  shuffleArray(currentQuestions);

  currentQuestionIndex = 0;
  score = 0;
  const config = DIFFICULTY_CONFIG[currentDifficulty];
  hp = config.hp;
  maxHp = config.hp;
  timerLimit = config.timer;
  isAnswered = false;
  wrongAnswers = [];
  currentItem = null;
  currentCombo = 0;
  updateItemUI();
  clearTrace();

  updateHUD();
  document.getElementById('timer-area').style.display = timerLimit > 0 ? 'flex' : 'none';
  setCoachSpeech('弱点克服トレーニング開始ニャ！全問正解を目指すニャ！');

  showScreen('screen-game');
  loadQuestion();
}

// === 復習用トレースモーダル制御 ===
let currentReviewWrongIndex = null;
let currentReviewTraceIndex = 0;
let reviewTraceVarKeys = [];

function openReviewTraceModal(wrongIdx) {
  playClick();
  const w = wrongAnswers[wrongIdx];
  if (!w || !w.question || !w.question.traceSteps) return;

  currentReviewWrongIndex = wrongIdx;
  currentReviewTraceIndex = 0;
  const q = w.question;

  const overlay = document.getElementById('review-trace-overlay');
  document.getElementById('review-trace-title').textContent = `🔍 ${q.title} のトレース復習`;

  // コード表示
  const codeEl = document.getElementById('review-code-display');
  if (q.code) {
    codeEl.innerHTML = highlightDNCL(q.code);
  } else if (q.sortLines) {
    codeEl.innerHTML = highlightDNCL(q.sortLines.join('\n'));
  }

  reviewTraceVarKeys = [];
  q.traceSteps.forEach(step => {
    Object.keys(step.vars).forEach(k => {
      if (!reviewTraceVarKeys.includes(k)) reviewTraceVarKeys.push(k);
    });
  });

  const table = document.getElementById('review-trace-table');
  let thead = `<tr><th>ステップ</th>`;
  reviewTraceVarKeys.forEach(k => { thead += `<th>${k}</th>`; });
  thead += `<th>処理内容</th></tr>`;
  table.innerHTML = thead;

  renderReviewTraceStep();
  overlay.classList.add('active');
}

function renderReviewTraceStep() {
  const w = wrongAnswers[currentReviewWrongIndex];
  if (!w) return;
  const q = w.question;
  const stepData = q.traceSteps[currentReviewTraceIndex];
  const table = document.getElementById('review-trace-table');

  const tr = document.createElement('tr');
  tr.className = 'active-row';

  let tdHtml = `<td>${currentReviewTraceIndex + 1}</td>`;
  reviewTraceVarKeys.forEach(k => {
    tdHtml += `<td>${stepData.vars[k] !== undefined ? stepData.vars[k] : ''}</td>`;
  });

  const lines = document.querySelectorAll('#review-code-display .code-line');
  let lineText = '';
  if (q.sortLines && q.sortLines[stepData.line] !== undefined) {
    lineText = q.sortLines[stepData.line].replace(/｜/g, '').trim();
  } else if (lines[stepData.line]) {
    lineText = lines[stepData.line].textContent.replace(/｜/g, '').trim();
  } else if (q.code) {
    const raw = q.code.split('\n');
    if (raw[stepData.line]) lineText = raw[stepData.line].replace(/｜/g, '').trim();
  }
  tdHtml += `<td class="td-action">${lineText}</td>`;
  tr.innerHTML = tdHtml;

  table.querySelectorAll('tr').forEach(r => r.classList.remove('active-row'));
  table.appendChild(tr);

  const wrapper = table.parentElement;
  if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;

  lines.forEach(l => l.classList.remove('active-trace'));
  if (lines[stepData.line]) lines[stepData.line].classList.add('active-trace');

  playTone(480 + stepData.line * 25, 'sine', 0.05, 0.1);

  document.getElementById('review-trace-step-text').textContent =
    `Step: ${currentReviewTraceIndex + 1} / ${q.traceSteps.length}`;
  document.getElementById('review-trace-prev-btn').disabled = (currentReviewTraceIndex === 0);

  const nextBtn = document.getElementById('review-trace-next-btn');
  if (currentReviewTraceIndex >= q.traceSteps.length - 1) {
    nextBtn.disabled = true;
    nextBtn.textContent = '完了';
  } else {
    nextBtn.disabled = false;
    nextBtn.textContent = '次へ ▶';
  }
}

function nextReviewTraceStep() {
  const w = wrongAnswers[currentReviewWrongIndex];
  if (!w) return;
  const q = w.question;
  if (currentReviewTraceIndex < q.traceSteps.length - 1) {
    currentReviewTraceIndex++;
    renderReviewTraceStep();
  }
}

function prevReviewTraceStep() {
  if (currentReviewTraceIndex > 0) {
    currentReviewTraceIndex--;
    const w = wrongAnswers[currentReviewWrongIndex];
    const q = w.question;
    const table = document.getElementById('review-trace-table');
    table.removeChild(table.lastChild);

    const newLast = table.lastChild;
    if (newLast && newLast.tagName === 'TR' && newLast.rowIndex > 0) {
      newLast.classList.add('active-row');
    }

    const stepData = q.traceSteps[currentReviewTraceIndex];
    const lines = document.querySelectorAll('#review-code-display .code-line');
    lines.forEach(l => l.classList.remove('active-trace'));
    if (lines[stepData.line]) lines[stepData.line].classList.add('active-trace');

    playTone(320, 'sine', 0.05, 0.1);
    document.getElementById('review-trace-step-text').textContent =
      `Step: ${currentReviewTraceIndex + 1} / ${q.traceSteps.length}`;
    document.getElementById('review-trace-prev-btn').disabled = (currentReviewTraceIndex === 0);
    const nextBtn = document.getElementById('review-trace-next-btn');
    nextBtn.disabled = false;
    nextBtn.textContent = '次へ ▶';
  }
}

function closeReviewTraceModal() {
  playClick();
  const overlay = document.getElementById('review-trace-overlay');
  if (overlay) overlay.classList.remove('active');
}

function handleReviewTraceOverlayClick(e) {
  if (e.target && e.target.id === 'review-trace-overlay') closeReviewTraceModal();
}

function copyPassword() {
  const text = document.getElementById('password-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copy-pw-btn');
    btn.textContent = '✅ コピー完了！';
    setTimeout(() => { btn.textContent = '📋 コピー'; }, 2000);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 初期化
window.addEventListener('DOMContentLoaded', () => {
  initBgm();
  playBgm('title');
});
