
class BubblesMode {
  constructor(app) {
    this.app = app;
    this.playfield = document.getElementById('bubbles-playfield');
    this.bubblesLayer = document.getElementById('bubbles-layer');
    this.canvas = document.getElementById('bubbles-particle-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.isActive = false;
    this.bubbles = [];
    this.particles = [];
    this.animFrameId = null;
    this.lastTimestamp = 0;
    this.nextBubbleId = 1;

    this.colorPalette = {
      'A': { face: '#facc15', side: '#b45309', trail: '#fde047' },
      'B': { face: '#3b82f6', side: '#1d4ed8', trail: '#60a5fa' },
      'C': { face: '#a855f7', side: '#6b21a8', trail: '#c084fc' },
      'D': { face: '#84cc16', side: '#3f6212', trail: '#a3e635' },
      'E': { face: '#ef4444', side: '#991b1b', trail: '#f87171' },
      'F': { face: '#f43f5e', side: '#881337', trail: '#fb7185' },
      'G': { face: '#f59e0b', side: '#b45309', trail: '#fbbf24' },
      'H': { face: '#06b6d4', side: '#0e7490', trail: '#22d3ee' },
      'I': { face: '#22c55e', side: '#15803d', trail: '#4ade80' },
      'J': { face: '#ec4899', side: '#be185d', trail: '#f472b6' },
      'K': { face: '#8b5cf6', side: '#5b21b6', trail: '#a78bfa' },
      'L': { face: '#0284c7', side: '#075985', trail: '#38bdf8' },
      'M': { face: '#f97316', side: '#c2410c', trail: '#fb923c' },
      'N': { face: '#10b981', side: '#047857', trail: '#34d399' },
      'O': { face: '#eab308', side: '#a16207', trail: '#fef08a' },
      'P': { face: '#d946ef', side: '#86198f', trail: '#f0abfc' },
      'Q': { face: '#0ea5e9', side: '#0369a1', trail: '#7dd3fc' },
      'R': { face: '#84cc16', side: '#4d7c0f', trail: '#bef264' },
      'S': { face: '#f43f5e', side: '#9f1239', trail: '#fda4af' },
      'T': { face: '#f59e0b', side: '#92400e', trail: '#fed7aa' },
      'U': { face: '#6366f1', side: '#3730a3', trail: '#a5b4fc' },
      'V': { face: '#14b8a6', side: '#0f766e', trail: '#5eead4' },
      'W': { face: '#ec4899', side: '#9d174d', trail: '#fbcfe8' },
      'X': { face: '#ef4444', side: '#b91c1c', trail: '#fca5a5' },
      'Y': { face: '#3b82f6', side: '#1e40af', trail: '#93c5fd' },
      'Z': { face: '#a855f7', side: '#7e22ce', trail: '#e9d5ff' }
    };

    this.diffConfigs = {
      easy: {
        minBubbles: 5,
        maxBubbles: 6,
        baseSpeed: 52,
        speedAccel: 1.04,
        spawnInterval: 1200,
        maxMisses: 6,
        roundDuration: 60
      },
      medium: {
        minBubbles: 6,
        maxBubbles: 7,
        baseSpeed: 82,
        speedAccel: 1.07,
        spawnInterval: 900,
        maxMisses: 6,
        roundDuration: 60
      },
      hard: {
        minBubbles: 7,
        maxBubbles: 8,
        baseSpeed: 125,
        speedAccel: 1.10,
        spawnInterval: 650,
        maxMisses: 6,
        roundDuration: 60
      }
    };

    this.currentConfig = this.diffConfigs.easy;
    this.speedMultiplier = 1.0;
    this.spawnTimer = 0;

    this.initCanvas();
    window.addEventListener('resize', () => this.initCanvas());
  }

  initCanvas() {
    if (!this.canvas || !this.playfield) return;
    const rect = this.playfield.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  setDifficulty(diffLevel) {
    this.currentConfig = this.diffConfigs[diffLevel] || this.diffConfigs.easy;
  }

  start() {
    this.stop();
    this.isActive = true;
    this.bubbles = [];
    this.particles = [];
    this.bubblesLayer.innerHTML = '';
    this.initCanvas();

    this.speedMultiplier = 1.0;
    this.spawnTimer = 0;
    this.lastTimestamp = performance.now();

    if (this.app && this.app.resetModeAHearts) {
      this.app.resetModeAHearts();
    }

    const initialCount = this.currentConfig.minBubbles;

    for (let i = 0; i < initialCount; i++) {
      const initialY = 30 + (i * 50);
      this.spawnBubble(initialY);
    }

    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isActive = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.bubblesLayer) {
      this.bubblesLayer.innerHTML = '';
    }
    this.bubbles = [];
    this.particles = [];
  }

  spawnBubble(customY = null) {
    if (!this.playfield || !this.isActive) return;
    const fieldWidth = this.playfield.clientWidth || 600;
    const fieldHeight = this.playfield.clientHeight || 500;
    const letterWidth = 72;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const col = this.colorPalette[letter] || { face: '#facc15', side: '#b45309', trail: '#fde047' };

    const padding = 35;
    const availableWidth = fieldWidth - letterWidth - padding * 2;
    const x = padding + Math.random() * Math.max(20, availableWidth);
    const y = customY !== null ? customY : -30;

    const speedVariation = 0.88 + Math.random() * 0.24;

    const el = document.createElement('div');
    el.className = 'letter-3d-item';
    el.dataset.letter = letter;
    el.dataset.id = this.nextBubbleId;
    el.style.setProperty('--glyph-face', col.face);
    el.style.setProperty('--glyph-side', col.side);
    el.style.setProperty('--trail-color', col.trail);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    const beam = document.createElement('div');
    beam.className = 'letter-trail-beam';
    el.appendChild(beam);

    const glyph = document.createElement('div');
    glyph.className = 'letter-3d-glyph';
    glyph.textContent = letter;
    el.appendChild(glyph);

    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      if (!this.isActive) return;
      this.handleInput(letter);
    });

    this.bubblesLayer.appendChild(el);

    const bubbleObj = {
      id: this.nextBubbleId++,
      letter: letter,
      x: x,
      y: y,
      size: letterWidth,
      speed: this.currentConfig.baseSpeed * speedVariation,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 1.2 + Math.random() * 1.5,
      col: col,
      el: el
    };

    this.bubbles.push(bubbleObj);
  }

  loop(timestamp) {
    if (!this.isActive) return;

    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    const fieldHeight = this.playfield.clientHeight || 500;
    const waterfrontBoundary = fieldHeight - 110;

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];

      const currentSpeed = b.speed * this.speedMultiplier;
      b.y += currentSpeed * dt;

      b.wobbleOffset += b.wobbleSpeed * dt;
      const wobbleX = Math.sin(b.wobbleOffset) * 6;

      b.el.style.transform = `translate3d(${b.x + wobbleX}px, ${b.y}px, 0)`;

      if (b.y >= waterfrontBoundary) {
        this.handleBoundaryMiss(b, i);
      }
    }

    if (this.bubbles.length < this.currentConfig.minBubbles) {
      this.spawnTimer += dt * 1000;
      if (this.spawnTimer >= 250) {
        this.spawnBubble();
        this.spawnTimer = 0;
      }
    }

    this.updateParticles(dt);

    if (this.isActive) {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  }

  handleBoundaryMiss(bubble, index) {

    this.bubbles.splice(index, 1);
    if (bubble.el.parentNode) {
      bubble.el.parentNode.removeChild(bubble.el);
    }

    this.createParticleBurst(bubble.x + bubble.size / 2, 20, '#f43f5e', 16);

    if (window.soundEngine) {
      window.soundEngine.playLaserMiss();
    }

    this.app.registerMiss(`Ceiling Breach! Key [${bubble.letter}] escaped`);

    if (this.playfield) {
      this.playfield.classList.add('screen-miss-flash');
      setTimeout(() => {
        if (this.playfield) this.playfield.classList.remove('screen-miss-flash');
      }, 350);
    }

    setTimeout(() => {
      if (this.isActive && this.bubbles.length < this.currentConfig.maxBubbles) {
        this.spawnBubble();
      }
    }, 350);
  }

  handleInput(pressedChar) {
    if (!this.isActive) return;

    const char = pressedChar.toUpperCase();

    const matches = this.bubbles
      .filter(b => b.letter === char)
      .sort((a, b) => b.y - a.y);

    if (matches.length > 0) {

      const target = matches[0];
      this.popBubble(target);
    } else {

      this.handleFalseKeypress(char);
    }
  }

  popBubble(bubble) {
    const idx = this.bubbles.findIndex(b => b.id === bubble.id);
    if (idx !== -1) {
      this.bubbles.splice(idx, 1);
    }

    bubble.el.classList.add('popping');
    setTimeout(() => {
      if (bubble.el.parentNode) {
        bubble.el.parentNode.removeChild(bubble.el);
      }
    }, 240);

    const centerX = bubble.x + bubble.size / 2;
    const centerY = bubble.y + 70;
    const burstColor = (bubble.col && bubble.col.trail) ? bubble.col.trail : '#38bdf8';
    this.createParticleBurst(centerX, centerY, burstColor, 24);

    if (window.soundEngine) {
      window.soundEngine.playPop();
    }

    this.app.registerHit(bubble.letter, {
      x: centerX,
      y: centerY,
      basePoints: 10
    });

    if (this.app.state.correctKeys % 5 === 0) {
      this.speedMultiplier = Math.min(2.4, this.speedMultiplier * this.currentConfig.speedAccel);
    }

    setTimeout(() => {
      if (this.isActive && this.bubbles.length < this.currentConfig.maxBubbles) {
        this.spawnBubble();
      }
    }, 180);
  }

  handleFalseKeypress(char) {

    if (window.soundEngine) {
      window.soundEngine.playIncorrect();
    }

    this.app.registerFalseKeypress(char, 5);
  }

  createParticleBurst(x, y, color = '#38bdf8', count = 18) {
    if (!this.ctx) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 150;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 3.5,
        color: color,
        alpha: 1.0,
        decay: 1.2 + Math.random() * 1.4
      });
    }
  }

  updateParticles(dt) {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 50 * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}

window.BubblesMode = BubblesMode;
