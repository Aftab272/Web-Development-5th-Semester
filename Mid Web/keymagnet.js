
class KeyMagnetMode {
  constructor(app) {
    this.app = app;
    this.keyboardBoard = document.getElementById('interactive-keyboard');
    this.targetLetterEl = document.getElementById('km-target-letter');
    this.targetCoreEl = document.getElementById('km-target-core');
    this.fingerGuidanceEl = document.getElementById('km-finger-guidance');
    this.lastRtEl = document.getElementById('km-last-rt');
    this.reflexFillEl = document.getElementById('km-reflex-fill');

    this.isActive = false;
    this.currentTarget = null;
    this.targetTimestamp = 0;
    this.reactionTimes = [];
    this.targetsQueue = [];
    this.currentIndex = 0;
    this.totalTargets = 25;
    this.reflexTimerId = null;
    this.reflexAnimFrame = null;
    this.reflexStartTime = 0;
    this.reflexDuration = 3000;

    this.keySets = {
      homerow: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
      toprow: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      bottomrow: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      allletters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
    };

    this.fingerMap = {
      'Q': { name: 'Left Pinky', class: 'finger-l-pinky', dotId: 'dot-l-pinky' },
      'A': { name: 'Left Pinky', class: 'finger-l-pinky', dotId: 'dot-l-pinky' },
      'Z': { name: 'Left Pinky', class: 'finger-l-pinky', dotId: 'dot-l-pinky' },
      '1': { name: 'Left Pinky', class: 'finger-l-pinky', dotId: 'dot-l-pinky' },

      'W': { name: 'Left Ring Finger', class: 'finger-l-ring', dotId: 'dot-l-ring' },
      'S': { name: 'Left Ring Finger', class: 'finger-l-ring', dotId: 'dot-l-ring' },
      'X': { name: 'Left Ring Finger', class: 'finger-l-ring', dotId: 'dot-l-ring' },
      '2': { name: 'Left Ring Finger', class: 'finger-l-ring', dotId: 'dot-l-ring' },

      'E': { name: 'Left Middle Finger', class: 'finger-l-middle', dotId: 'dot-l-middle' },
      'D': { name: 'Left Middle Finger', class: 'finger-l-middle', dotId: 'dot-l-middle' },
      'C': { name: 'Left Middle Finger', class: 'finger-l-middle', dotId: 'dot-l-middle' },
      '3': { name: 'Left Middle Finger', class: 'finger-l-middle', dotId: 'dot-l-middle' },

      'R': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      'T': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      'F': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      'G': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      'V': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      'B': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      '4': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },
      '5': { name: 'Left Index Finger', class: 'finger-l-index', dotId: 'dot-l-index' },

      'Y': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      'U': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      'H': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      'J': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      'N': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      'M': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      '6': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },
      '7': { name: 'Right Index Finger', class: 'finger-r-index', dotId: 'dot-r-index' },

      'I': { name: 'Right Middle Finger', class: 'finger-r-middle', dotId: 'dot-r-middle' },
      'K': { name: 'Right Middle Finger', class: 'finger-r-middle', dotId: 'dot-r-middle' },
      '8': { name: 'Right Middle Finger', class: 'finger-r-middle', dotId: 'dot-r-middle' },

      'O': { name: 'Right Ring Finger', class: 'finger-r-ring', dotId: 'dot-r-ring' },
      'L': { name: 'Right Ring Finger', class: 'finger-r-ring', dotId: 'dot-r-ring' },
      '9': { name: 'Right Ring Finger', class: 'finger-r-ring', dotId: 'dot-r-ring' },

      'P': { name: 'Right Pinky', class: 'finger-r-pinky', dotId: 'dot-r-pinky' },
      '0': { name: 'Right Pinky', class: 'finger-r-pinky', dotId: 'dot-r-pinky' }
    };

    this.diffConfigs = {
      easy: { quota: 25, reflexWindow: 3200, defaultSet: 'homerow' },
      medium: { quota: 40, reflexWindow: 2000, defaultSet: 'allletters' },
      hard: { quota: 55, reflexWindow: 1300, defaultSet: 'alphanumeric' }
    };

    this.currentDifficulty = 'easy';
    this.currentSetKey = 'homerow';

    const restartBtn = document.getElementById('mb-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        if (this.app) this.app.restartGame();
      });
    }

    const pauseBtn = document.getElementById('mb-pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (this.app) {
          this.app.resetGame();
          this.app.showScreen('home');
        }
      });
    }

    const settingsBtn = document.getElementById('mb-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        const sets = ['homerow', 'toprow', 'bottomrow', 'allletters', 'alphanumeric'];
        const nextSet = sets[(sets.indexOf(this.currentSetKey) + 1) % sets.length];
        this.setKeySet(nextSet);
        if (this.app && this.app.dom && this.app.dom.keysetSelect) {
          this.app.dom.keysetSelect.value = nextSet;
        }
        if (this.app) {
          this.app.showFeedback(`Keyset: ${nextSet.toUpperCase()}`, 'correct');
        }
        if (this.isActive) this.start();
      });
    }

    this.renderKeyboard();

    this.currentTarget = 'F';
    this.targetsQueue = ['F', 'J', 'D', 'K', 'S', 'L'];
    this.updateConveyorTrack();
    if (this.targetLetterEl) this.targetLetterEl.textContent = 'F';
    if (this.fingerGuidanceEl) this.fingerGuidanceEl.textContent = 'Left Index Finger';
    const initialDot = document.getElementById('dot-l-index');
    if (initialDot) initialDot.classList.add('active');
    const fKey = this.keyboardBoard.querySelector('[data-key="F"]');
    if (fKey) fKey.classList.add('target-key');
  }

  setDifficulty(diffLevel) {
    this.currentDifficulty = diffLevel;
    const config = this.diffConfigs[diffLevel] || this.diffConfigs.easy;
    this.totalTargets = config.quota;
    this.reflexDuration = config.reflexWindow;
  }

  setKeySet(setKey) {
    if (this.keySets[setKey]) {
      this.currentSetKey = setKey;
    }
  }

  renderKeyboard() {
    if (!this.keyboardBoard) return;
    this.keyboardBoard.innerHTML = '';

    const rows = [
      [
        { key: '`', label: '`' },
        { key: '1', label: '1' },
        { key: '2', label: '2' },
        { key: '3', label: '3' },
        { key: '4', label: '4' },
        { key: '5', label: '5' },
        { key: '6', label: '6' },
        { key: '7', label: '7' },
        { key: '8', label: '8' },
        { key: '9', label: '9' },
        { key: '0', label: '0' },
        { key: '-', label: '-' },
        { key: '=', label: '=' },
        { key: 'Backspace', label: '←', wide: 'tab' }
      ],
      [
        { key: 'Tab', label: 'Tab', wide: 'tab' },
        { key: 'Q', label: 'Q' },
        { key: 'W', label: 'W' },
        { key: 'E', label: 'E' },
        { key: 'R', label: 'R' },
        { key: 'T', label: 'T' },
        { key: 'Y', label: 'Y' },
        { key: 'U', label: 'U' },
        { key: 'I', label: 'I' },
        { key: 'O', label: 'O' },
        { key: 'P', label: 'P' },
        { key: '[', label: '[' },
        { key: ']', label: ']' }
      ],
      [
        { key: 'Caps', label: 'Caps', wide: 'caps' },
        { key: 'A', label: 'A' },
        { key: 'S', label: 'S' },
        { key: 'D', label: 'D' },
        { key: 'F', label: 'F' },
        { key: 'G', label: 'G' },
        { key: 'H', label: 'H' },
        { key: 'J', label: 'J' },
        { key: 'K', label: 'K' },
        { key: 'L', label: 'L' },
        { key: ';', label: ';' },
        { key: "'", label: "'" },
        { key: 'Enter', label: 'TBird', wide: 'caps' }
      ],
      [
        { key: 'Shift', label: 'Shift', wide: 'shift' },
        { key: 'Z', label: 'Z' },
        { key: 'X', label: 'X' },
        { key: 'C', label: 'C' },
        { key: 'V', label: 'V' },
        { key: 'B', label: 'B' },
        { key: 'N', label: 'N' },
        { key: 'M', label: 'M' },
        { key: ',', label: ',' },
        { key: '.', label: '.' },
        { key: '/', label: '/' },
        { key: 'Shift', label: 'Shift', wide: 'shift' }
      ],
      [
        { key: ' ', label: '', wide: 'space' }
      ]
    ];

    rows.forEach(rowItems => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';

      rowItems.forEach(item => {
        const keyEl = document.createElement('div');
        keyEl.className = 'key-cap';
        if (item.wide) {
          keyEl.classList.add(`key-wide-${item.wide}`);
        }
        keyEl.dataset.key = item.key;
        keyEl.textContent = item.label;

        if (item.key === 'F' || item.key === 'J') {
          keyEl.classList.add('tactile');
        }

        keyEl.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          if (item.key && item.key.length === 1 && item.key !== ' ') {
            this.handleInput(item.key);
          }
        });

        rowEl.appendChild(keyEl);
      });

      this.keyboardBoard.appendChild(rowEl);
    });
  }

  updateConveyorTrack() {
    const track = document.getElementById('mb-belt-track');
    if (!track) return;
    track.innerHTML = '';

    const activeTile = document.createElement('div');
    activeTile.className = 'mb-belt-tile active';
    activeTile.textContent = this.currentTarget || '-';
    track.appendChild(activeTile);

    const lookahead = 4;
    for (let i = 1; i <= lookahead; i++) {
      const idx = this.currentIndex + i;
      if (idx < this.targetsQueue.length) {
        const spacer = document.createElement('div');
        spacer.className = 'mb-belt-spacer';
        spacer.textContent = '⊔';
        track.appendChild(spacer);

        const upcomingTile = document.createElement('div');
        upcomingTile.className = 'mb-belt-tile upcoming';
        upcomingTile.textContent = this.targetsQueue[idx];
        track.appendChild(upcomingTile);
      }
    }

    const mascot = document.getElementById('mb-mascot-char');
    if (mascot && activeTile) {
      requestAnimationFrame(() => {
        const stage = document.querySelector('.mb-conveyor-stage');
        if (stage) {
          const stageRect = stage.getBoundingClientRect();
          const tileRect = activeTile.getBoundingClientRect();
          const centerX = (tileRect.left - stageRect.left) + (tileRect.width / 2);
          mascot.style.left = centerX + 'px';
        }
      });
    }
  }

  start() {
    this.stop();
    this.isActive = true;
    this.reactionTimes = [];
    this.currentIndex = 0;

    const config = this.diffConfigs[this.currentDifficulty] || this.diffConfigs.easy;
    this.totalTargets = config.quota;
    this.reflexDuration = config.reflexWindow;

    const pool = this.keySets[this.currentSetKey] || this.keySets.homerow;
    this.targetsQueue = [];
    for (let i = 0; i < this.totalTargets; i++) {
      const randomKey = pool[Math.floor(Math.random() * pool.length)];
      this.targetsQueue.push(randomKey);
    }

    this.updateProgressDisplay();
    this.nextTarget();
  }

  stop() {
    this.isActive = false;
    this.clearReflexTimer();
    this.clearTargetHighlight();
    if (this.targetLetterEl) this.targetLetterEl.textContent = '-';
    if (this.lastRtEl) this.lastRtEl.textContent = '-- ms';
    if (this.reflexFillEl) this.reflexFillEl.style.width = '100%';
  }

  clearReflexTimer() {
    if (this.reflexTimerId) {
      clearTimeout(this.reflexTimerId);
      this.reflexTimerId = null;
    }
    if (this.reflexAnimFrame) {
      cancelAnimationFrame(this.reflexAnimFrame);
      this.reflexAnimFrame = null;
    }
  }

  clearTargetHighlight() {
    const prevTarget = this.keyboardBoard.querySelector('.target-key');
    if (prevTarget) {
      prevTarget.classList.remove('target-key');
    }
  }

  nextTarget() {
    if (!this.isActive) return;

    if (this.currentIndex >= this.totalTargets) {

      this.app.finishKeyMagnetSession('completed');
      return;
    }

    this.clearReflexTimer();
    this.clearTargetHighlight();

    this.currentTarget = this.targetsQueue[this.currentIndex];
    this.targetTimestamp = performance.now();

    if (this.targetLetterEl) {
      this.targetLetterEl.textContent = this.currentTarget;
    }

    const finger = this.fingerMap[this.currentTarget];
    if (this.fingerGuidanceEl) {
      this.fingerGuidanceEl.textContent = finger ? finger.name : 'Left Index Finger';
    }

    document.querySelectorAll('.hand-dot').forEach(d => d.classList.remove('active'));
    if (finger && finger.dotId) {
      const dotEl = document.getElementById(finger.dotId);
      if (dotEl) {
        dotEl.classList.add('active');
      }
    }

    this.updateConveyorTrack();

    const targetKeyEl = this.keyboardBoard.querySelector(`[data-key="${this.currentTarget}"]`);
    if (targetKeyEl) {
      targetKeyEl.classList.add('target-key');
    }

    this.reflexStartTime = performance.now();
    this.animateReflexBar();

    this.reflexTimerId = setTimeout(() => {
      if (this.isActive) {
        this.handleTimeout();
      }
    }, this.reflexDuration);
  }

  animateReflexBar() {
    if (!this.isActive) return;

    const elapsed = performance.now() - this.reflexStartTime;
    const progress = Math.max(0, 1 - elapsed / this.reflexDuration);

    if (this.reflexFillEl) {
      this.reflexFillEl.style.width = `${progress * 100}%`;
      if (progress < 0.3) {
        this.reflexFillEl.style.background = '#f43f5e';
      } else if (progress < 0.6) {
        this.reflexFillEl.style.background = '#0284c7';
      } else {
        this.reflexFillEl.style.background = '#38bdf8';
      }
    }

    if (progress > 0) {
      this.reflexAnimFrame = requestAnimationFrame(() => this.animateReflexBar());
    }
  }

  handleTimeout() {
    if (!this.isActive) return;

    if (window.soundEngine) {
      window.soundEngine.playIncorrect();
    }

    const keyCap = this.keyboardBoard.querySelector(`[data-key="${this.currentTarget}"]`);
    if (keyCap) {
      keyCap.classList.add('flash-wrong');
      setTimeout(() => keyCap.classList.remove('flash-wrong'), 250);
    }

    this.app.registerFalseKeypress(this.currentTarget, 0);
    this.currentIndex++;
    this.updateProgressDisplay();
    this.nextTarget();
  }

  handleInput(pressedChar) {
    if (!this.isActive || !this.currentTarget) return;

    const char = pressedChar.toUpperCase();
    const rt = Math.round(performance.now() - this.targetTimestamp);

    const pressedKeyCap = this.keyboardBoard.querySelector(`[data-key="${char}"]`);
    if (pressedKeyCap) {
      pressedKeyCap.classList.add('pressed');
      setTimeout(() => pressedKeyCap.classList.remove('pressed'), 120);
    }

    if (char === this.currentTarget) {

      this.clearReflexTimer();
      this.reactionTimes.push(rt);

      const mascot = document.getElementById('mb-mascot-char');
      if (mascot) {
        mascot.classList.remove('hop');
        void mascot.offsetWidth;
        mascot.classList.add('hop');
      }

      if (pressedKeyCap) {
        pressedKeyCap.classList.add('flash-correct');
        setTimeout(() => pressedKeyCap.classList.remove('flash-correct'), 200);
      }

      if (window.soundEngine) {
        window.soundEngine.playCorrect();
      }

      if (this.lastRtEl) {
        this.lastRtEl.textContent = `${rt} ms`;
      }

      let bonus = 0;
      let speedTag = '';
      if (rt < 280) {
        bonus = 20;
        speedTag = '⚡ Lightning!';
      } else if (rt < 450) {
        bonus = 10;
        speedTag = '★ Swift!';
      } else {
        bonus = 5;
        speedTag = '✓ Good';
      }

      this.app.registerHit(char, {
        basePoints: 15 + bonus,
        reactionTime: rt,
        speedTag: speedTag
      });

      this.currentIndex++;
      this.updateProgressDisplay();

      setTimeout(() => {
        if (this.isActive) {
          this.nextTarget();
        }
      }, 100);

    } else {

      if (pressedKeyCap) {
        pressedKeyCap.classList.add('flash-wrong');
        setTimeout(() => pressedKeyCap.classList.remove('flash-wrong'), 250);
      }

      if (this.targetCoreEl) {
        this.targetCoreEl.classList.add('screen-miss-flash');
        setTimeout(() => this.targetCoreEl.classList.remove('screen-miss-flash'), 250);
      }

      if (window.soundEngine) {
        window.soundEngine.playIncorrect();
      }

      this.app.registerFalseKeypress(char, 5);
    }
  }

  updateProgressDisplay() {
    const progressEl = document.getElementById('hud-km-progress');
    if (progressEl) {
      progressEl.textContent = `${this.currentIndex} / ${this.totalTargets}`;
    }

    const avgRtEl = document.getElementById('hud-avg-rt');
    if (avgRtEl) {
      if (this.reactionTimes.length > 0) {
        const sum = this.reactionTimes.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / this.reactionTimes.length);
        avgRtEl.textContent = `${avg} ms`;
      } else {
        avgRtEl.textContent = `0 ms`;
      }
    }
  }

  getStats() {
    const sum = this.reactionTimes.reduce((a, b) => a + b, 0);
    const avg = this.reactionTimes.length ? Math.round(sum / this.reactionTimes.length) : 0;
    const fastest = this.reactionTimes.length ? Math.min(...this.reactionTimes) : 0;
    return {
      avgRt: avg,
      fastestRt: fastest,
      totalCompleted: this.currentIndex
    };
  }
}

window.KeyMagnetMode = KeyMagnetMode;
