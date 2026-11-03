
class TypeMasterApp {
  constructor() {

    this.currentMode = 'bubbles';
    this.difficulty = 'easy';
    this.gameRunning = false;
    this.timerInterval = null;
    this.timeRemaining = 60;
    this.missLimit = 6;

    this.state = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      misses: 0,
      correctKeys: 0,
      incorrectKeys: 0,
      startTime: 0,
      endTime: 0
    };

    this.dom = {
      screenHome: document.getElementById('screen-home'),
      screenGameplay: document.getElementById('screen-gameplay'),
      arenaBubbles: document.getElementById('arena-bubbles'),
      arenaKeymagnet: document.getElementById('arena-keymagnet'),

      brandHomeBtn: document.getElementById('brand-home-btn'),
      navBubblesBtn: document.getElementById('nav-bubbles-btn'),
      navKeymagnetBtn: document.getElementById('nav-keymagnet-btn'),
      guideModalBtn: document.getElementById('guide-modal-btn'),
      toggleSoundBtn: document.getElementById('toggle-sound-btn'),
      soundIconOn: document.getElementById('sound-icon-on'),
      soundIconOff: document.getElementById('sound-icon-off'),
      toggleVkBtn: document.getElementById('toggle-vk-btn'),
      vkDrawer: document.getElementById('virtual-keyboard-drawer'),
      vkCloseBtn: document.getElementById('vk-close-btn'),
      vkTouchGrid: document.getElementById('vk-touch-grid'),

      arenaBackMenuBtn: document.getElementById('arena-back-menu-btn'),
      currentModeLabel: document.getElementById('current-mode-label'),
      currentModeIcon: document.getElementById('current-mode-icon'),
      currentModeName: document.getElementById('current-mode-name'),
      diffBtns: document.querySelectorAll('.diff-btn'),
      keysetWrapper: document.getElementById('keyset-control-wrapper'),
      keysetSelect: document.getElementById('keyset-select'),

      gameStartBtn: document.getElementById('game-start-btn'),
      gameRestartBtn: document.getElementById('game-restart-btn'),
      gameResetBtn: document.getElementById('game-reset-btn'),

      hudScoreVal: document.getElementById('hud-score-val'),
      hudScoreBonus: document.getElementById('hud-score-bonus'),
      hudComboVal: document.getElementById('hud-combo-val'),
      comboFill: document.getElementById('combo-fill'),
      hudMissesTile: document.getElementById('hud-misses-tile'),
      missesLimitTag: document.getElementById('misses-limit-tag'),
      missDots: document.querySelectorAll('.miss-dot'),
      hudKeymagnetTile: document.getElementById('hud-keymagnet-tile'),
      hudAccuracyVal: document.getElementById('hud-accuracy-val'),
      hudCorrectKeys: document.getElementById('hud-correct-keys'),
      hudWrongKeys: document.getElementById('hud-wrong-keys'),
      hudTimerLabel: document.getElementById('hud-timer-label'),
      hudTimerVal: document.getElementById('hud-timer-val'),
      feedbackBanner: document.getElementById('feedback-banner'),

      homeBestBubbles: document.getElementById('home-best-bubbles'),
      homeBestAccuracy: document.getElementById('home-best-accuracy'),
      homeBestRt: document.getElementById('home-best-rt'),

      resultsModal: document.getElementById('results-modal'),
      resCloseXBtn: document.getElementById('res-close-x-btn'),
      resModeTag: document.getElementById('res-mode-tag'),
      resTitle: document.getElementById('res-title'),
      resBadgeIcon: document.getElementById('res-badge-icon'),
      resGradeCircle: document.getElementById('res-grade-circle'),
      resGrade: document.getElementById('res-grade'),
      resFinalScore: document.getElementById('res-final-score'),
      resNewRecord: document.getElementById('res-new-record'),
      resStatAccuracy: document.getElementById('res-stat-accuracy'),
      resStatMaxStreak: document.getElementById('res-stat-maxstreak'),
      resStatCorrect: document.getElementById('res-stat-correct'),
      resStatErrors: document.getElementById('res-stat-errors'),
      resStatRt: document.getElementById('res-stat-rt'),
      resStatRtCell: document.getElementById('res-stat-rt-cell'),
      resStatOutcome: document.getElementById('res-stat-outcome'),
      resPlayAgainBtn: document.getElementById('res-play-again-btn'),
      resChangeModeBtn: document.getElementById('res-change-mode-btn'),

      guideModal: document.getElementById('guide-modal'),
      guideCloseXBtn: document.getElementById('guide-close-x-btn'),
      guideModalCloseBtn: document.getElementById('guide-modal-close-btn'),
      levelModalBubbles: document.getElementById('level-modal-bubbles'),
      levelModalKeymagnet: document.getElementById('level-modal-keymagnet'),
      btnOpenLevelBubbles: document.getElementById('btn-open-level-bubbles'),
      btnOpenLevelKeymagnet: document.getElementById('btn-open-level-keymagnet'),
      closeModalBubbles: document.getElementById('close-modal-bubbles'),
      closeModalKeymagnet: document.getElementById('close-modal-keymagnet')
    };

    this.bubblesEngine = new BubblesMode(this);
    this.keymagnetEngine = new KeyMagnetMode(this);

    this.initEventListeners();
    this.initVirtualKeyboard();
    this.initDialogLightDismiss();
    this.loadHomeStats();
    this.updateSoundIcon();
    this.selectMode('bubbles');
  }

  initEventListeners() {

    document.querySelectorAll('.level-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetLevel = e.currentTarget.dataset.level || 'easy';
        const targetMode = e.currentTarget.dataset.mode || this.currentMode;
        if (this.dom.levelModalBubbles && this.dom.levelModalBubbles.open) {
          this.dom.levelModalBubbles.close();
        }
        if (this.dom.levelModalKeymagnet && this.dom.levelModalKeymagnet.open) {
          this.dom.levelModalKeymagnet.close();
        }
        this.setDifficulty(targetLevel);
        this.selectMode(targetMode);
        this.showScreen('gameplay');
        this.startGame();
      });
    });

    if (this.dom.btnOpenLevelBubbles) {
      this.dom.btnOpenLevelBubbles.addEventListener('click', () => {
        if (this.dom.levelModalBubbles) {
          this.dom.levelModalBubbles.showModal();
        }
      });
    }

    if (this.dom.btnOpenLevelKeymagnet) {
      this.dom.btnOpenLevelKeymagnet.addEventListener('click', () => {
        if (this.dom.levelModalKeymagnet) {
          this.dom.levelModalKeymagnet.showModal();
        }
      });
    }

    if (this.dom.closeModalBubbles) {
      this.dom.closeModalBubbles.addEventListener('click', () => {
        if (this.dom.levelModalBubbles) {
          this.dom.levelModalBubbles.close();
        }
      });
    }

    if (this.dom.closeModalKeymagnet) {
      this.dom.closeModalKeymagnet.addEventListener('click', () => {
        if (this.dom.levelModalKeymagnet) {
          this.dom.levelModalKeymagnet.close();
        }
      });
    }

    const dockBubbles = document.getElementById('dock-btn-bubbles');
    if (dockBubbles) {
      dockBubbles.addEventListener('click', () => {
        this.selectMode('bubbles');
        this.showScreen('gameplay');
        this.startGame();
      });
    }

    const dockKm = document.getElementById('dock-btn-keymagnet');
    if (dockKm) {
      dockKm.addEventListener('click', () => {
        this.selectMode('keymagnet');
        this.showScreen('gameplay');
        this.startGame();
      });
    }

    document.querySelectorAll('.start-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetMode = e.currentTarget.dataset.target;
        this.selectMode(targetMode);
        this.showScreen('gameplay');
        this.startGame();
      });
    });

    this.dom.brandHomeBtn.addEventListener('click', () => {
      this.resetGame();
      this.showScreen('home');
    });

    this.dom.navBubblesBtn.addEventListener('click', () => {
      this.selectMode('bubbles');
      this.showScreen('gameplay');
      this.startGame();
    });

    this.dom.navKeymagnetBtn.addEventListener('click', () => {
      this.selectMode('keymagnet');
      this.showScreen('gameplay');
      this.startGame();
    });

    this.dom.arenaBackMenuBtn.addEventListener('click', () => {
      this.resetGame();
      this.showScreen('home');
    });

    if (this.dom.guideModalBtn && this.dom.guideModal) {
      this.dom.guideModalBtn.addEventListener('click', () => {
        if (typeof this.dom.guideModal.showModal === 'function') {
          this.dom.guideModal.showModal();
        }
      });
    }

    if (this.dom.guideCloseXBtn && this.dom.guideModal) {
      this.dom.guideCloseXBtn.addEventListener('click', () => {
        this.dom.guideModal.close();
      });
    }

    if (this.dom.guideModalCloseBtn && this.dom.guideModal) {
      this.dom.guideModalCloseBtn.addEventListener('click', () => {
        this.dom.guideModal.close();
      });
    }

    this.dom.toggleSoundBtn.addEventListener('click', () => {
      if (window.soundEngine) {
        window.soundEngine.toggleSound();
        this.updateSoundIcon();
      }
    });

    this.dom.toggleVkBtn.addEventListener('click', () => {
      this.dom.vkDrawer.classList.toggle('active');
    });

    this.dom.vkCloseBtn.addEventListener('click', () => {
      this.dom.vkDrawer.classList.remove('active');
    });

    this.dom.diffBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diff = e.currentTarget.dataset.diff;
        this.setDifficulty(diff);
      });
    });

    this.dom.keysetSelect.addEventListener('change', (e) => {
      const selectedSet = e.target.value;
      this.keymagnetEngine.setKeySet(selectedSet);
      if (this.gameRunning) {
        this.restartGame();
      }
    });

    this.dom.gameStartBtn.addEventListener('click', () => this.startGame());
    this.dom.gameRestartBtn.addEventListener('click', () => this.restartGame());
    this.dom.gameResetBtn.addEventListener('click', () => this.resetGame());

    this.dom.resPlayAgainBtn.addEventListener('click', () => {
      this.closeResultsModal();
      this.restartGame();
    });

    this.dom.resChangeModeBtn.addEventListener('click', () => {
      this.closeResultsModal();
      this.resetGame();
      this.showScreen('home');
    });

    this.dom.resCloseXBtn.addEventListener('click', () => {
      this.closeResultsModal();
    });

    window.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
  }

  initVirtualKeyboard() {
    if (!this.dom.vkTouchGrid) return;
    this.dom.vkTouchGrid.innerHTML = '';

    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];

    rows.forEach(rowKeys => {
      const rowEl = document.createElement('div');
      rowEl.className = 'vk-row';

      rowKeys.forEach(char => {
        const keyBtn = document.createElement('button');
        keyBtn.className = 'vk-key';
        keyBtn.textContent = char;
        keyBtn.setAttribute('type', 'button');
        keyBtn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.dispatchKeyInput(char);
        });
        rowEl.appendChild(keyBtn);
      });

      this.dom.vkTouchGrid.appendChild(rowEl);
    });
  }

  initDialogLightDismiss() {
    const dialogs = [
      this.dom.resultsModal,
      this.dom.guideModal,
      this.dom.levelModalBubbles,
      this.dom.levelModalKeymagnet
    ].filter(Boolean);

    dialogs.forEach(dialog => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const isOutside = (e, d) => {
          const r = d.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };

        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => {
          pressedOutside = isOutside(e, dialog);
        });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && isOutside(e, dialog)) {
            dialog.close();
          }
        });
      }

      dialog.addEventListener('close', () => {
        dialog.returnValue = '';
      });
    });
  }

  updateSoundIcon() {
    const muted = window.soundEngine ? window.soundEngine.isMuted() : false;
    if (muted) {
      this.dom.soundIconOn.classList.add('hidden');
      this.dom.soundIconOff.classList.remove('hidden');
    } else {
      this.dom.soundIconOn.classList.remove('hidden');
      this.dom.soundIconOff.classList.add('hidden');
    }
  }

  selectMode(mode) {
    this.currentMode = mode;

    this.dom.navBubblesBtn.classList.toggle('active', mode === 'bubbles');
    this.dom.navKeymagnetBtn.classList.toggle('active', mode === 'keymagnet');

    const dockBubbles = document.getElementById('dock-btn-bubbles');
    const dockKm = document.getElementById('dock-btn-keymagnet');
    if (dockBubbles) dockBubbles.classList.toggle('active', mode === 'bubbles');
    if (dockKm) dockKm.classList.toggle('active', mode === 'keymagnet');

    if (mode === 'bubbles') {
      this.dom.currentModeIcon.textContent = '🫧';
      this.dom.currentModeName.textContent = 'Mode A: Bubbles Challenge';
      this.dom.arenaBubbles.classList.add('active');
      this.dom.arenaKeymagnet.classList.remove('active');
      this.dom.keysetWrapper.classList.add('hidden');
      this.dom.hudMissesTile.classList.remove('hidden');
      this.dom.hudKeymagnetTile.classList.add('hidden');
      this.dom.hudTimerLabel.textContent = 'Survival Time';
    } else {
      this.dom.currentModeIcon.textContent = '🧲';
      this.dom.currentModeName.textContent = 'Mode B: KeyMagnet Precision';
      this.dom.arenaBubbles.classList.remove('active');
      this.dom.arenaKeymagnet.classList.add('active');
      this.dom.keysetWrapper.classList.remove('hidden');
      this.dom.hudMissesTile.classList.add('hidden');
      this.dom.hudKeymagnetTile.classList.remove('hidden');
      this.dom.hudTimerLabel.textContent = 'Round Clock';
    }

    this.resetGame();
  }

  setDifficulty(diffLevel) {
    this.difficulty = diffLevel;

    this.dom.diffBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === diffLevel);
    });

    this.bubblesEngine.setDifficulty(diffLevel);
    this.keymagnetEngine.setDifficulty(diffLevel);

    if (this.gameRunning) {
      this.restartGame();
    }
  }

  showScreen(screenName) {
    if (screenName === 'home') {
      this.dom.screenHome.classList.add('active');
      this.dom.screenGameplay.classList.remove('active');
      this.loadHomeStats();
    } else {
      this.dom.screenHome.classList.remove('active');
      this.dom.screenGameplay.classList.add('active');
    }
  }

  startGame() {
    if (this.gameRunning) return;

    this.gameRunning = true;
    this.dom.gameStartBtn.disabled = true;
    this.dom.gameRestartBtn.disabled = false;

    this.state.score = 0;
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.state.misses = 0;
    this.state.correctKeys = 0;
    this.state.incorrectKeys = 0;
    this.state.startTime = performance.now();

    this.updateHUD();
    this.resetMissDots();

    this.timeRemaining = this.currentMode === 'bubbles' ? 60 : 75;
    this.dom.hudTimerVal.textContent = `${this.timeRemaining}s`;
    this.dom.hudTimerVal.classList.remove('timer-warning');
    this.updateClockDisplay();

    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.dom.hudTimerVal.textContent = `${this.timeRemaining}s`;
      this.updateClockDisplay();

      if (this.timeRemaining <= 10) {
        this.dom.hudTimerVal.classList.add('timer-warning');
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.finishSessionByTimeout();
      }
    }, 1000);

    if (this.currentMode === 'bubbles') {
      this.bubblesEngine.start();
    } else {
      this.keymagnetEngine.start();
    }

    this.showFeedback('Round Started! GO!', 'correct');
  }

  restartGame() {
    this.stopGame();
    this.startGame();
  }

  resetGame() {
    this.stopGame();

    this.state.score = 0;
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.state.misses = 0;
    this.state.correctKeys = 0;
    this.state.incorrectKeys = 0;

    this.updateHUD();
    this.resetMissDots();
    this.dom.hudTimerVal.textContent = '60s';
    this.dom.hudTimerVal.classList.remove('timer-warning');
    this.timeRemaining = this.currentMode === 'bubbles' ? 60 : 75;
    this.updateClockDisplay();
    this.resetModeAHearts();

    this.dom.gameStartBtn.disabled = false;
    this.dom.gameRestartBtn.disabled = true;
  }

  stopGame() {
    this.gameRunning = false;
    this.stopTimer();

    this.bubblesEngine.stop();
    this.keymagnetEngine.stop();
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleGlobalKeyDown(e) {

    if (this.dom.resultsModal.open || (this.dom.guideModal && this.dom.guideModal.open)) return;

    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const key = e.key;

    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      if (this.gameRunning) {
        this.dispatchKeyInput(' ');
      }
      return;
    }

    if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
      if (!this.gameRunning) {

        if (this.dom.screenGameplay.classList.contains('active')) {
          this.startGame();
        }
      }
      if (this.gameRunning) {
        this.dispatchKeyInput(key);
      }
    }
  }

  dispatchKeyInput(char) {
    if (!this.gameRunning) return;

    if (this.currentMode === 'bubbles') {
      this.bubblesEngine.handleInput(char);
    } else {
      this.keymagnetEngine.handleInput(char);
    }
  }

  registerHit(char, details = {}) {
    this.state.correctKeys++;
    this.state.combo++;
    if (this.state.combo > this.state.maxCombo) {
      this.state.maxCombo = this.state.combo;
    }

    const basePts = details.basePoints || 10;
    const multiplier = 1 + Math.min(Math.floor(this.state.combo / 4) * 0.25, 2.0);
    const awarded = Math.round(basePts * multiplier);
    this.state.score += awarded;

    if (this.state.combo > 0 && this.state.combo % 5 === 0) {
      if (window.soundEngine) {
        window.soundEngine.playCombo(Math.floor(this.state.combo / 5));
      }
      this.showFeedback(`${this.state.combo}x COMBO! 🔥`, 'correct');
    }

    this.updateHUD(`+${awarded}`);
  }

  registerFalseKeypress(char, penaltyPoints = 5) {
    this.state.incorrectKeys++;
    this.state.combo = 0;

    if (penaltyPoints > 0) {
      this.state.score = Math.max(0, this.state.score - penaltyPoints);
    }

    this.showFeedback(`-${penaltyPoints} Penalty! [${char.toUpperCase()}]`, 'wrong');
    this.updateHUD();
  }

  registerMiss(reason) {
    this.state.misses++;
    this.state.combo = 0;

    this.updateMissDots();

    if (this.state.misses >= this.missLimit) {
      this.finishSessionByMissLimit();
    } else {
      this.showFeedback(`MISS! (${this.state.misses}/${this.missLimit})`, 'wrong');
      this.updateHUD();
    }
  }

  updateHUD(bonusText = '') {
    this.dom.hudScoreVal.textContent = this.state.score.toLocaleString();
    if (bonusText) {
      this.dom.hudScoreBonus.textContent = bonusText;
      setTimeout(() => {
        if (this.dom.hudScoreBonus) this.dom.hudScoreBonus.textContent = '';
      }, 700);
    }

    const multiplier = 1 + Math.min(Math.floor(this.state.combo / 4) * 0.25, 2.0);
    this.dom.hudComboVal.textContent = `${this.state.combo}x`;
    const progress = Math.min((this.state.combo % 4) / 4 * 100, 100);
    this.dom.comboFill.style.width = this.state.combo > 0 ? `${progress || 100}%` : '0%';

    const totalHits = this.state.correctKeys + this.state.incorrectKeys;
    const accuracy = totalHits > 0 ? ((this.state.correctKeys / totalHits) * 100).toFixed(1) : 100;
    this.dom.hudAccuracyVal.textContent = `${accuracy}%`;
    this.dom.hudCorrectKeys.textContent = `✓ ${this.state.correctKeys}`;
    this.dom.hudWrongKeys.textContent = `✗ ${this.state.incorrectKeys}`;

    const maScore = document.getElementById('ma-hud-score');
    if (maScore) maScore.textContent = this.state.score.toLocaleString();

    const maLevel = document.getElementById('ma-hud-level');
    if (maLevel) maLevel.textContent = Math.floor(this.state.correctKeys / 8) + 1;

    const maCombo = document.getElementById('ma-hud-combo');
    if (maCombo) maCombo.textContent = `${this.state.combo}x`;

    const maAcc = document.getElementById('ma-hud-acc');
    if (maAcc) maAcc.textContent = `${accuracy}%`;

    const maPopped = document.getElementById('ma-hud-popped');
    if (maPopped) maPopped.textContent = this.state.correctKeys;

    const skyScore = document.getElementById('skyline-hud-score');
    if (skyScore) skyScore.textContent = this.state.score.toLocaleString();

    const skyLevel = document.getElementById('skyline-hud-level');
    if (skyLevel) skyLevel.textContent = Math.floor(this.state.correctKeys / 8) + 1;

    this.updateModeAHearts();
  }

  updateClockDisplay() {
    const mins = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
    const secs = (this.timeRemaining % 60).toString().padStart(2, '0');

    const clockEl = document.getElementById('mb-clock-val');
    if (clockEl) {
      clockEl.textContent = `${mins}:${secs}`;
    }

    const skyTime = document.getElementById('skyline-hud-time');
    if (skyTime) {
      skyTime.textContent = `${mins}:${secs}`;
    }
  }

  updateModeAHearts() {
    const hearts = document.querySelectorAll('#ma-hearts-bar .ma-heart-icon');
    if (!hearts.length) return;
    if (this.state.misses >= 3) {
      if (hearts[0]) hearts[0].classList.add('lost');
    } else {
      if (hearts[0]) hearts[0].classList.remove('lost');
    }
    if (this.state.misses >= 6) {
      if (hearts[1]) hearts[1].classList.add('lost');
    } else {
      if (hearts[1]) hearts[1].classList.remove('lost');
    }
  }

  resetModeAHearts() {
    const hearts = document.querySelectorAll('#ma-hearts-bar .ma-heart-icon');
    hearts.forEach(h => h.classList.remove('lost'));
  }

  updateMissDots() {
    this.dom.missesLimitTag.textContent = `${this.state.misses} / ${this.missLimit}`;
    this.dom.missDots.forEach((dot, idx) => {
      if (idx < this.state.misses) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  resetMissDots() {
    this.dom.missesLimitTag.textContent = `0 / ${this.missLimit}`;
    this.dom.missDots.forEach(dot => dot.classList.remove('active'));
  }

  showFeedback(text, type = 'correct') {
    const el = this.dom.feedbackBanner;
    if (!el) return;

    el.textContent = text;
    el.className = `feedback-banner show-${type}`;

    setTimeout(() => {
      if (el) el.className = 'feedback-banner';
    }, 700);
  }

  finishSessionByMissLimit() {
    this.stopGame();
    if (window.soundEngine) {
      window.soundEngine.playGameOver();
    }
    this.showResults('Game Over - Miss Limit Reached (6 Misses)', 'miss_limit', false);
  }

  finishSessionByTimeout() {
    this.stopGame();
    if (window.soundEngine) {
      window.soundEngine.playVictory();
    }
    this.showResults('Challenge Cleared! (Time Survived)', 'timeout', true);
  }

  finishKeyMagnetSession(outcome) {
    this.stopGame();
    if (window.soundEngine) {
      window.soundEngine.playVictory();
    }
    this.showResults('Precision Run Complete!', outcome, true);
  }

  showResults(title, outcome, isSuccess) {
    this.state.endTime = performance.now();
    const totalKeys = this.state.correctKeys + this.state.incorrectKeys;
    const accuracyVal = totalKeys > 0 ? (this.state.correctKeys / totalKeys) * 100 : 100;

    let gradeRank = 'Novice (D)';
    if (accuracyVal >= 95 && this.state.score >= 200) {
      gradeRank = 'Master (S)';
    } else if (accuracyVal >= 88) {
      gradeRank = 'Expert (A)';
    } else if (accuracyVal >= 75) {
      gradeRank = 'Pro (B)';
    } else if (accuracyVal >= 60) {
      gradeRank = 'Apprentice (C)';
    }

    const elapsedMinutes = Math.max(0.1, (this.state.endTime - this.state.startTime) / 60000);
    const cpm = Math.round(this.state.correctKeys / elapsedMinutes) || 0;

    if (this.dom.resTitle) {
      this.dom.resTitle.textContent = isSuccess ? 'Challenge Cleared!' : 'Game over';
    }
    if (this.dom.resFinalScore) {
      this.dom.resFinalScore.textContent = `${this.state.score.toLocaleString()} points`;
    }
    if (this.dom.resStatMaxStreak) {
      this.dom.resStatMaxStreak.textContent = `Accuracy streak: ${Math.max(this.state.maxCombo, this.state.correctKeys)} words`;
    }
    if (this.dom.resStatRt) {
      this.dom.resStatRt.textContent = cpm;
    }
    if (this.dom.resStatAccuracy) {
      this.dom.resStatAccuracy.textContent = `${accuracyVal.toFixed(1)}%`;
    }
    if (this.dom.resStatCorrect) {
      this.dom.resStatCorrect.textContent = this.state.correctKeys;
    }
    if (this.dom.resStatErrors) {
      const totalErrors = this.state.incorrectKeys + (this.currentMode === 'bubbles' ? this.state.misses : 0);
      this.dom.resStatErrors.textContent = totalErrors;
    }
    if (this.dom.resGrade) {
      this.dom.resGrade.textContent = gradeRank;
    }

    const isNewRecord = this.saveBestScore(this.currentMode, this.state.score, accuracyVal);
    if (this.dom.resNewRecord) {
      this.dom.resNewRecord.textContent = isNewRecord ? '★ New record! ★' : 'Great Job!';
    }

    if (this.dom.resultsModal && typeof this.dom.resultsModal.showModal === 'function') {
      this.dom.resultsModal.showModal();
    }
  }

  closeResultsModal() {
    if (this.dom.resultsModal && this.dom.resultsModal.open) {
      this.dom.resultsModal.close();
    }
  }

  saveBestScore(mode, score, accuracy) {
    let isNewRecord = false;
    if (mode === 'bubbles') {
      const prev = parseInt(localStorage.getItem('typemaster_best_bubbles') || '0', 10);
      if (score > prev) {
        localStorage.setItem('typemaster_best_bubbles', score);
        isNewRecord = true;
      }
    } else {
      const prevAcc = parseFloat(localStorage.getItem('typemaster_best_accuracy') || '0');
      if (accuracy > prevAcc && score > 50) {
        localStorage.setItem('typemaster_best_accuracy', accuracy.toFixed(1));
        isNewRecord = true;
      }
    }
    return isNewRecord;
  }

  saveBestRt(rt) {
    if (!rt || rt <= 0) return;
    const prev = parseInt(localStorage.getItem('typemaster_best_rt') || '9999', 10);
    if (rt < prev) {
      localStorage.setItem('typemaster_best_rt', rt);
    }
  }

  loadHomeStats() {
    const bestBubbles = localStorage.getItem('typemaster_best_bubbles') || '0';
    const bestAccuracy = localStorage.getItem('typemaster_best_accuracy') || '0';
    const bestRt = localStorage.getItem('typemaster_best_rt');

    if (this.dom.homeBestBubbles) this.dom.homeBestBubbles.textContent = parseInt(bestBubbles).toLocaleString();
    if (this.dom.homeBestAccuracy) this.dom.homeBestAccuracy.textContent = `${bestAccuracy}%`;
    if (this.dom.homeBestRt) this.dom.homeBestRt.textContent = bestRt ? `${bestRt} ms` : '-- ms';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new TypeMasterApp();

  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  const levelParam = urlParams.get('level');
  if (levelParam) {
    window.app.setDifficulty(levelParam);
  }
  if (modeParam === 'bubbles' || modeParam === 'keymagnet') {
    window.app.selectMode(modeParam);
    window.app.showScreen('gameplay');
    window.app.startGame();
  }
  if (urlParams.get('results') === '1') {
    window.app.state.score = 4335;
    window.app.state.correctKeys = 66;
    window.app.state.maxCombo = 66;
    window.app.showResults('Game over', 'miss_limit', false);
  }
});
