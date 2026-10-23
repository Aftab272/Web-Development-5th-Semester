/**
 * QuizPulse - Interactive Quiz Application
 * Handles quiz state, audio effects, segmented progress bar, timer,
 * dynamic feedback, themes, and PDF export.
 */

// ============================================================================
// AUDIO SYNTHESIZER (Native Web Audio API - Zero External Dependencies)
// ============================================================================
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chords = [
      { f: 523.25, t: 0 },
      { f: 659.25, t: 0.1 },
      { f: 783.99, t: 0.2 },
      { f: 1046.5, t: 0.35 }
    ];
    chords.forEach(({ f, t }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.15, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.4);
    });
  }
}

const sfx = new SoundEffects();

// ============================================================================
// STATE DEFINITION
// ============================================================================
const state = {
  playerName: 'Quiz Champion',
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  timerSeconds: 20,
  timeRemaining: 20,
  timerInterval: null,
  isAnswered: false,
  answersHistory: [], // records each question result
  quizStartTime: null,
  quizEndTime: null,
  totalQuestionCount: 5,
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const elements = {
  // Screens
  startScreen: document.getElementById('start-screen'),
  quizScreen: document.getElementById('quiz-screen'),
  resultsScreen: document.getElementById('results-screen'),

  // Header
  brandLogo: document.getElementById('brand-logo'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIcon: document.getElementById('theme-icon'),
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIcon: document.getElementById('sound-icon'),

  // Start Screen Inputs
  playerNameInput: document.getElementById('player-name-input'),
  questionCountSelect: document.getElementById('question-count-select'),
  timerSelect: document.getElementById('timer-select'),
  startQuizBtn: document.getElementById('start-quiz-btn'),

  // Quiz Screen Elements
  questionBadge: document.getElementById('question-badge'),
  categoryBadge: document.getElementById('category-badge'),
  liveScore: document.getElementById('live-score'),
  liveStreak: document.getElementById('live-streak'),
  progressPercent: document.getElementById('progress-percent'),
  segmentedBar: document.getElementById('segmented-bar'),
  timerNumber: document.getElementById('timer-number'),
  timerCircleProgress: document.getElementById('timer-circle-progress'),
  timerBox: document.getElementById('timer-box'),
  questionText: document.getElementById('question-text'),
  optionsContainer: document.getElementById('options-container'),
  explanationBox: document.getElementById('explanation-box'),
  explanationTitle: document.getElementById('explanation-title'),
  explanationText: document.getElementById('explanation-text'),
  explanationIcon: document.getElementById('explanation-icon'),
  nextQuestionBtn: document.getElementById('next-question-btn'),
  nextBtnText: document.getElementById('next-btn-text'),

  // Results Screen Elements
  resultsHeadline: document.getElementById('results-headline'),
  resultsSubtext: document.getElementById('results-subtext'),
  finalScorePercent: document.getElementById('final-score-percent'),
  finalScoreFraction: document.getElementById('final-score-fraction'),
  gradeBadge: document.getElementById('grade-badge'),
  metricCorrect: document.getElementById('metric-correct'),
  metricIncorrect: document.getElementById('metric-incorrect'),
  metricTimeout: document.getElementById('metric-timeout'),
  metricTime: document.getElementById('metric-time'),
  downloadPdfBtn: document.getElementById('download-pdf-btn'),
  toggleReviewBtn: document.getElementById('toggle-review-btn'),
  restartQuizBtn: document.getElementById('restart-quiz-btn'),
  reviewSection: document.getElementById('review-section'),
  reviewCardsContainer: document.getElementById('review-cards-container'),

  // PDF Template
  pdfCandidateName: document.getElementById('pdf-candidate-name'),
  pdfDateStamp: document.getElementById('pdf-date-stamp'),
  pdfScorePercentage: document.getElementById('pdf-score-percentage'),
  pdfScoreFraction: document.getElementById('pdf-score-fraction'),
  pdfTableBody: document.getElementById('pdf-table-body'),
  pdfVerificationCode: document.getElementById('pdf-verification-code'),
  pdfCertificate: document.getElementById('pdf-certificate'),
};

// ============================================================================
// THEME MANAGEMENT (Dark / Light Mode)
// ============================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('quizpulse_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    setTheme('light');
  } else {
    setTheme('dark');
  }
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    elements.themeIcon.className = 'bi bi-moon-stars-fill text-lg text-indigo-400';
    localStorage.setItem('quizpulse_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    elements.themeIcon.className = 'bi bi-sun-fill text-lg text-amber-500';
    localStorage.setItem('quizpulse_theme', 'light');
  }
}

elements.themeToggleBtn.addEventListener('click', () => {
  sfx.playClick();
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

// Sound Toggle
elements.soundToggleBtn.addEventListener('click', () => {
  sfx.enabled = !sfx.enabled;
  if (sfx.enabled) {
    elements.soundIcon.className = 'bi bi-volume-up-fill text-lg text-indigo-500';
    sfx.playClick();
  } else {
    elements.soundIcon.className = 'bi bi-volume-mute-fill text-lg text-slate-400';
  }
});

// Brand Logo returns to Start Screen
elements.brandLogo.addEventListener('click', () => {
  sfx.playClick();
  if (state.timerInterval) clearInterval(state.timerInterval);
  showScreen('start');
});

// ============================================================================
// SCREEN SWITCHING
// ============================================================================
function showScreen(screen) {
  elements.startScreen.classList.add('hidden');
  elements.quizScreen.classList.add('hidden');
  elements.resultsScreen.classList.add('hidden');

  if (screen === 'start') {
    elements.startScreen.classList.remove('hidden');
  } else if (screen === 'quiz') {
    elements.quizScreen.classList.remove('hidden');
  } else if (screen === 'results') {
    elements.resultsScreen.classList.remove('hidden');
  }
}

// ============================================================================
// RANDOMIZATION & QUIZ INITIALIZATION
// ============================================================================
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function prepareQuizQuestions(count) {
  // Shuffle all available questions
  const shuffledBank = shuffleArray(QUESTION_BANK);
  const selectedQuestions = shuffledBank.slice(0, Math.min(count, shuffledBank.length));

  // Also randomize options for each selected question to guarantee freshness
  return selectedQuestions.map((q) => {
    // Find the original correct option text
    const correctOptionObj = q.options.find(opt => opt.id === q.correctAnswer);
    const correctText = correctOptionObj ? correctOptionObj.text : '';

    // Shuffle the options
    const shuffledOptions = shuffleArray(q.options);
    const letters = ['A', 'B', 'C', 'D'];

    // Re-assign letters A, B, C, D to shuffled order
    const newOptions = shuffledOptions.map((opt, idx) => ({
      id: letters[idx],
      text: opt.text
    }));

    // Find the new letter for the correct text
    const newCorrectLetter = newOptions.find(opt => opt.text === correctText)?.id || 'A';

    return {
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: newOptions,
      correctAnswer: newCorrectLetter,
      explanation: q.explanation
    };
  });
}

function startQuiz() {
  sfx.playClick();

  // Read configs
  const nameInput = elements.playerNameInput.value.trim();
  state.playerName = nameInput || 'Quiz Champion';
  state.totalQuestionCount = parseInt(elements.questionCountSelect.value, 10) || 5;
  state.timerSeconds = parseInt(elements.timerSelect.value, 10) || 20;

  // Prepare questions
  state.questions = prepareQuizQuestions(state.totalQuestionCount);
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.answersHistory = [];
  state.quizStartTime = new Date();

  // Build segmented bar UI
  buildSegmentedBar(state.questions.length);

  // Show quiz screen
  showScreen('quiz');

  // Load first question
  loadQuestion(0);
}

elements.startQuizBtn.addEventListener('click', startQuiz);

// ============================================================================
// MULTI-COLORED SEGMENTED PROGRESS BAR
// ============================================================================
function buildSegmentedBar(totalSegments) {
  elements.segmentedBar.innerHTML = '';
  for (let i = 0; i < totalSegments; i++) {
    const segment = document.createElement('div');
    segment.className = 'segment pending';
    segment.id = `segment-${i}`;
    segment.setAttribute('title', `Question ${i + 1}`);
    elements.segmentedBar.appendChild(segment);
  }
  updateSegmentedBarStatus(0, 'active');
  updateProgressText();
}

function updateSegmentedBarStatus(index, status) {
  const segment = document.getElementById(`segment-${index}`);
  if (!segment) return;

  // Clear previous status classes
  segment.classList.remove('pending', 'active', 'correct', 'incorrect', 'timeout');
  segment.classList.add(status);
}

function updateProgressText() {
  const percent = Math.round((state.currentQuestionIndex / state.questions.length) * 100);
  elements.progressPercent.textContent = `${percent}% Completed`;
}

// ============================================================================
// COUNTDOWN TIMER
// ============================================================================
const CIRCUMFERENCE = 2 * Math.PI * 30; // Radius = 30 -> 188.496

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);

  state.timeRemaining = state.timerSeconds;
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();

    // Sound effect & visual cues for low time
    if (state.timeRemaining <= 4 && state.timeRemaining > 0) {
      sfx.playTick();
    }

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  elements.timerNumber.textContent = state.timeRemaining;

  // Calculate SVG stroke offset
  const progressRatio = Math.max(0, state.timeRemaining) / state.timerSeconds;
  const offset = CIRCUMFERENCE - (progressRatio * CIRCUMFERENCE);
  elements.timerCircleProgress.style.strokeDashoffset = offset;

  // Dynamic color transitions
  if (progressRatio > 0.5) {
    elements.timerCircleProgress.setAttribute('stroke', '#10b981'); // emerald
    elements.timerNumber.className = 'timer-text text-emerald-500';
    elements.timerBox.classList.remove('timer-critical');
  } else if (progressRatio > 0.2) {
    elements.timerCircleProgress.setAttribute('stroke', '#f59e0b'); // amber
    elements.timerNumber.className = 'timer-text text-amber-500';
    elements.timerBox.classList.remove('timer-critical');
  } else {
    elements.timerCircleProgress.setAttribute('stroke', '#ef4444'); // red
    elements.timerNumber.className = 'timer-text text-red-500 font-black';
    elements.timerBox.classList.add('timer-critical');
  }
}

// ============================================================================
// QUESTION RENDERING & ANSWER EVALUATION
// ============================================================================
function loadQuestion(index) {
  state.currentQuestionIndex = index;
  state.isAnswered = false;
  const currentQ = state.questions[index];

  // Update header badges
  elements.questionBadge.textContent = `Question ${index + 1} of ${state.questions.length}`;
  elements.categoryBadge.textContent = `${currentQ.category} • ${currentQ.difficulty}`;
  elements.liveScore.textContent = state.score;
  elements.liveStreak.textContent = state.streak;

  // Update question text
  elements.questionText.textContent = currentQ.question;

  // Reset segmented bar for current
  updateSegmentedBarStatus(index, 'active');
  updateProgressText();

  // Reset next question button
  elements.nextQuestionBtn.disabled = true;
  elements.nextBtnText.textContent = (index === state.questions.length - 1) ? 'View Results' : 'Next Question';

  // Close explanation drawer
  elements.explanationBox.classList.remove('open');
  elements.explanationText.textContent = '';

  // Render options
  elements.optionsContainer.innerHTML = '';
  currentQ.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.dataset.optionId = opt.id;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');

    btn.innerHTML = `
      <div class="option-letter">${opt.id}</div>
      <div class="option-text">${escapeHtml(opt.text)}</div>
      <i class="bi option-icon"></i>
    `;

    btn.addEventListener('click', () => handleOptionSelected(opt.id));
    elements.optionsContainer.appendChild(btn);
  });

  // Start timer
  startTimer();
}

function handleOptionSelected(selectedLetter) {
  if (state.isAnswered) return;
  state.isAnswered = true;
  stopTimer();

  const currentQ = state.questions[state.currentQuestionIndex];
  const isCorrect = (selectedLetter === currentQ.correctAnswer);
  const timeSpent = state.timerSeconds - state.timeRemaining;

  // Update scores & streak
  if (isCorrect) {
    state.score++;
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    sfx.playCorrect();
    updateSegmentedBarStatus(state.currentQuestionIndex, 'correct');
  } else {
    state.streak = 0;
    sfx.playWrong();
    updateSegmentedBarStatus(state.currentQuestionIndex, 'incorrect');
  }

  elements.liveScore.textContent = state.score;
  elements.liveStreak.textContent = state.streak;

  // Record Answer History
  state.answersHistory.push({
    questionNumber: state.currentQuestionIndex + 1,
    questionText: currentQ.question,
    selectedOption: selectedLetter,
    selectedText: currentQ.options.find(o => o.id === selectedLetter)?.text || 'None',
    correctOption: currentQ.correctAnswer,
    correctText: currentQ.options.find(o => o.id === currentQ.correctAnswer)?.text || '',
    isCorrect: isCorrect,
    isTimeout: false,
    explanation: currentQ.explanation,
    timeSpent: timeSpent
  });

  // Dynamic Highlighting of Options
  const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
  optionButtons.forEach((btn) => {
    btn.disabled = true; // prevent further clicks
    const optId = btn.dataset.optionId;
    const icon = btn.querySelector('.option-icon');

    if (optId === selectedLetter) {
      if (isCorrect) {
        btn.classList.add('correct');
        icon.className = 'bi bi-check-circle-fill option-icon';
      } else {
        btn.classList.add('incorrect');
        icon.className = 'bi bi-x-circle-fill option-icon';
      }
    } else if (optId === currentQ.correctAnswer && !isCorrect) {
      // Reveal the correct answer so user learns
      btn.classList.add('revealed-correct');
    }
  });

  // Reveal Explanation Drawer
  showExplanation(isCorrect, currentQ.explanation);

  // Enable Next Button
  elements.nextQuestionBtn.disabled = false;
  elements.nextQuestionBtn.focus();
}

function handleTimeout() {
  if (state.isAnswered) return;
  state.isAnswered = true;
  sfx.playWrong();

  const currentQ = state.questions[state.currentQuestionIndex];
  state.streak = 0;
  elements.liveStreak.textContent = state.streak;

  // Update segmented bar to timeout (amber)
  updateSegmentedBarStatus(state.currentQuestionIndex, 'timeout');

  // Record Answer History
  state.answersHistory.push({
    questionNumber: state.currentQuestionIndex + 1,
    questionText: currentQ.question,
    selectedOption: 'TIMEOUT',
    selectedText: 'Timed Out (No Answer)',
    correctOption: currentQ.correctAnswer,
    correctText: currentQ.options.find(o => o.id === currentQ.correctAnswer)?.text || '',
    isCorrect: false,
    isTimeout: true,
    explanation: currentQ.explanation,
    timeSpent: state.timerSeconds
  });

  // Highlight all buttons and reveal correct answer
  const optionButtons = elements.optionsContainer.querySelectorAll('.option-btn');
  optionButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.optionId === currentQ.correctAnswer) {
      btn.classList.add('revealed-correct');
    }
  });

  // Show timeout explanation
  showExplanation(false, `Time expired! The correct answer was (${currentQ.correctAnswer}): ${currentQ.explanation}`);

  // Enable Next Button
  elements.nextQuestionBtn.disabled = false;
  elements.nextQuestionBtn.focus();
}

function showExplanation(isCorrect, text) {
  elements.explanationText.textContent = text;
  elements.explanationBox.classList.add('open');

  if (isCorrect) {
    elements.explanationTitle.textContent = 'Excellent! Correct Answer';
    elements.explanationTitle.className = 'text-sm font-bold mb-1 text-emerald-600 dark:text-emerald-400';
    elements.explanationIcon.className = 'w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5';
    elements.explanationIcon.innerHTML = '<i class="bi bi-check-lg"></i>';
  } else {
    elements.explanationTitle.textContent = 'Learning Insight';
    elements.explanationTitle.className = 'text-sm font-bold mb-1 text-amber-600 dark:text-amber-400';
    elements.explanationIcon.className = 'w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5';
    elements.explanationIcon.innerHTML = '<i class="bi bi-lightbulb-fill"></i>';
  }
}

// Next Button Handler
elements.nextQuestionBtn.addEventListener('click', () => {
  sfx.playClick();
  const nextIdx = state.currentQuestionIndex + 1;
  if (nextIdx < state.questions.length) {
    loadQuestion(nextIdx);
  } else {
    finishQuiz();
  }
});

// Keyboard Navigation Support
document.addEventListener('keydown', (e) => {
  // Only handle during active quiz
  if (elements.quizScreen.classList.contains('hidden')) return;

  const key = e.key.toUpperCase();

  // If not answered yet, allow selecting A, B, C, D or 1, 2, 3, 4
  if (!state.isAnswered) {
    const keyMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D' };
    if (keyMap[key]) {
      handleOptionSelected(keyMap[key]);
    }
  } else if (e.key === 'Enter') {
    // If answered, pressing Enter triggers next
    if (!elements.nextQuestionBtn.disabled) {
      elements.nextQuestionBtn.click();
    }
  }
});

// ============================================================================
// QUIZ COMPLETION & RESULTS SCREEN
// ============================================================================
function finishQuiz() {
  state.quizEndTime = new Date();
  const totalQuestions = state.questions.length;
  const score = state.score;
  const percent = Math.round((score / totalQuestions) * 100);

  // Total time in seconds
  const totalTimeSeconds = Math.round((state.quizEndTime - state.quizStartTime) / 1000);

  // Count metrics
  const correctCount = state.answersHistory.filter(a => a.isCorrect).length;
  const timeoutCount = state.answersHistory.filter(a => a.isTimeout).length;
  const incorrectCount = totalQuestions - correctCount - timeoutCount;

  // Grade determination
  let grade = 'Mastery';
  let badgeColor = 'bg-emerald-500';
  if (percent >= 90) {
    grade = 'Distinction (Mastery)';
    badgeColor = 'bg-emerald-500';
  } else if (percent >= 70) {
    grade = 'Proficient';
    badgeColor = 'bg-indigo-500';
  } else if (percent >= 50) {
    grade = 'Satisfactory';
    badgeColor = 'bg-amber-500';
  } else {
    grade = 'Needs Practice';
    badgeColor = 'bg-rose-500';
  }

  // Populate Result Screen
  elements.finalScoreFraction.textContent = `Final Score: ${score} / ${totalQuestions}`;
  elements.gradeBadge.textContent = `Grade: ${grade}`;
  elements.gradeBadge.className = `mt-3 inline-block badge-pill ${badgeColor} text-white shadow-md`;
  elements.metricCorrect.textContent = correctCount;
  elements.metricIncorrect.textContent = incorrectCount;
  elements.metricTimeout.textContent = timeoutCount;
  elements.metricTime.textContent = `${totalTimeSeconds}s`;

  // Animate Percentage Score Counter
  animateScoreCounter(percent);

  // Trigger celebration if passed (> 60%)
  if (percent >= 60) {
    triggerConfetti();
    sfx.playFanfare();
  } else {
    sfx.playClick();
  }

  // Populate Detailed Review Section
  buildReviewBreakdown();

  // Show Results Screen
  showScreen('results');
}

function animateScoreCounter(targetPercent) {
  let current = 0;
  const duration = 1200; // ms
  const stepTime = 25;
  const steps = duration / stepTime;
  const increment = targetPercent / steps;

  const counterInterval = setInterval(() => {
    current += increment;
    if (current >= targetPercent) {
      current = targetPercent;
      clearInterval(counterInterval);
    }
    elements.finalScorePercent.textContent = `${Math.round(current)}%`;
  }, stepTime);
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#3b82f6']
    });
  }
}

// Build Question-by-Question Review List
function buildReviewBreakdown() {
  elements.reviewCardsContainer.innerHTML = '';

  state.answersHistory.forEach((ans, idx) => {
    const card = document.createElement('div');
    card.className = 'p-4 rounded-xl border transition-all text-left ' + 
      (ans.isCorrect 
        ? 'bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/20' 
        : ans.isTimeout 
          ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/20' 
          : 'bg-red-500/5 border-red-500/30 dark:bg-red-950/20');

    const statusBadge = ans.isCorrect
      ? '<span class="badge-pill bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">✓ Correct</span>'
      : ans.isTimeout
        ? '<span class="badge-pill bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs">⏱ Timed Out</span>'
        : '<span class="badge-pill bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs">✗ Incorrect</span>';

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Question ${idx + 1}</span>
        ${statusBadge}
      </div>
      <p class="font-bold text-sm text-slate-900 dark:text-white mb-2">${escapeHtml(ans.questionText)}</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
        <div class="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span class="text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">Your Response:</span>
          <span class="${ans.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-500 dark:text-red-400 font-semibold'}">
            ${ans.isTimeout ? 'Timed Out (No Answer)' : `(${ans.selectedOption}) ${escapeHtml(ans.selectedText)}`}
          </span>
        </div>
        <div class="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span class="text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">Correct Answer:</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-bold">
            (${ans.correctOption}) ${escapeHtml(ans.correctText)}
          </span>
        </div>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-300 italic">
        <strong>Insight:</strong> ${escapeHtml(ans.explanation)}
      </p>
    `;

    elements.reviewCardsContainer.appendChild(card);
  });
}

// Toggle Review Section Accordion
elements.toggleReviewBtn.addEventListener('click', () => {
  sfx.playClick();
  const isHidden = elements.reviewSection.classList.contains('hidden');
  if (isHidden) {
    elements.reviewSection.classList.remove('hidden');
    elements.toggleReviewBtn.innerHTML = '<i class="bi bi-eye-slash text-base"></i><span>Hide Answers</span>';
    elements.reviewSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    elements.reviewSection.classList.add('hidden');
    elements.toggleReviewBtn.innerHTML = '<i class="bi bi-card-checklist text-base"></i><span>Review Answers</span>';
  }
});

// Retake Quiz Handler
elements.restartQuizBtn.addEventListener('click', () => {
  sfx.playClick();
  startQuiz();
});

// ============================================================================
// PDF SCORECARD EXPORT VIA html2pdf.js
// ============================================================================
function generatePdfReport() {
  sfx.playClick();

  const totalQuestions = state.questions.length;
  const score = state.score;
  const percent = Math.round((score / totalQuestions) * 100);

  // 1. Populate Candidate & Assessment Meta
  elements.pdfCandidateName.textContent = state.playerName || 'Quiz Champion';
  
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  elements.pdfDateStamp.textContent = `Completed on ${new Date().toLocaleDateString('en-US', options)}`;
  
  elements.pdfScorePercentage.textContent = `${percent}%`;
  elements.pdfScoreFraction.textContent = `${score} of ${totalQuestions} Questions Correct`;

  // Generate Unique Verification Code
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  elements.pdfVerificationCode.textContent = `QP-${Date.now().toString().slice(-5)}-${randomHex}`;

  // 2. Populate Table Rows
  elements.pdfTableBody.innerHTML = '';
  state.answersHistory.forEach((ans, i) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #e2e8f0';
    if (i % 2 === 1) tr.style.background = '#f8fafc';

    const statusHtml = ans.isCorrect
      ? '<span style="color: #10b981; font-weight: 700;">✓ Pass</span>'
      : ans.isTimeout
        ? '<span style="color: #f59e0b; font-weight: 700;">⏱ Timeout</span>'
        : '<span style="color: #ef4444; font-weight: 700;">✗ Fail</span>';

    tr.innerHTML = `
      <td style="padding: 7px 10px; font-weight: 600; color: #64748b;">${i + 1}</td>
      <td style="padding: 7px 10px; font-weight: 500; color: #1e293b;">${escapeHtml(ans.questionText)}</td>
      <td style="padding: 7px 10px; color: ${ans.isCorrect ? '#10b981' : '#ef4444'}; font-weight: 600;">
        ${ans.isTimeout ? 'Timed Out' : `(${ans.selectedOption}) ${escapeHtml(ans.selectedText.substring(0, 20))}`}
      </td>
      <td style="padding: 7px 10px; color: #10b981; font-weight: 600;">
        (${ans.correctOption}) ${escapeHtml(ans.correctText.substring(0, 20))}
      </td>
      <td style="padding: 7px 10px; text-align: center;">${statusHtml}</td>
    `;
    elements.pdfTableBody.appendChild(tr);
  });

  // 3. Configure html2pdf options
  const sanitizedName = (state.playerName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `QuizPulse_Scorecard_${sanitizedName}.pdf`;

  const opt = {
    margin: [8, 8, 8, 8],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Button loading feedback
  const originalBtnHtml = elements.downloadPdfBtn.innerHTML;
  elements.downloadPdfBtn.disabled = true;
  elements.downloadPdfBtn.innerHTML = `
    <span class="inline-block animate-spin mr-2"><i class="bi bi-arrow-repeat"></i></span>
    <span>Generating PDF...</span>
  `;

  // Execute export
  const elementToExport = elements.pdfCertificate;
  
  html2pdf().set(opt).from(elementToExport).save()
    .then(() => {
      elements.downloadPdfBtn.disabled = false;
      elements.downloadPdfBtn.innerHTML = originalBtnHtml;
    })
    .catch((err) => {
      console.error('PDF Generation Error:', err);
      alert('Could not export PDF automatically. Using browser print dialog as fallback.');
      window.print();
      elements.downloadPdfBtn.disabled = false;
      elements.downloadPdfBtn.innerHTML = originalBtnHtml;
    });
}

elements.downloadPdfBtn.addEventListener('click', generatePdfReport);

// ============================================================================
// UTILITIES
// ============================================================================
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initial Setup
initTheme();
