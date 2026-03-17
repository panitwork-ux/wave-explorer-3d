
import { GameState, QUIZ_QUESTIONS, WAVE_COMPONENTS } from './definitions';
import { formatTime, getGrade } from './utils';

// ==================== SCREEN MANAGEMENT ====================
export function showScreen(id: string): void {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    (s as HTMLElement).style.display = 'none';
  });
  const target = document.getElementById(id)!;
  if (id === 'game-hud') {
    target.style.display = 'block';
    target.classList.add('active');
  } else {
    target.style.display = 'flex';
    target.classList.add('active');
  }
}

// ==================== LOGIN ====================
export function initLoginScreen(onStart: (data: { firstName: string; lastName: string; className: string; number: string }) => void): void {
  const btn = document.getElementById('start-btn')!;
  btn.addEventListener('click', () => handleLogin(onStart));
  btn.addEventListener('touchend', (e) => { e.preventDefault(); handleLogin(onStart); });
  
  // Enter key support
  ['input-firstname', 'input-lastname', 'input-class', 'input-number'].forEach(id => {
    document.getElementById(id)!.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') handleLogin(onStart);
    });
  });
}

function handleLogin(onStart: Function): void {
  const first = (document.getElementById('input-firstname') as HTMLInputElement).value.trim();
  const last = (document.getElementById('input-lastname') as HTMLInputElement).value.trim();
  const cls = (document.getElementById('input-class') as HTMLInputElement).value.trim();
  const num = (document.getElementById('input-number') as HTMLInputElement).value.trim();

  if (!first || !last || !cls || !num) {
    showValidationError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
    return;
  }
  onStart({ firstName: first, lastName: last, className: cls, number: num });
}

function showValidationError(msg: string): void {
  const existing = document.querySelector('.validation-error');
  if (existing) existing.remove();
  
  const el = document.createElement('div');
  el.className = 'validation-error';
  el.style.cssText = 'color:#ff6b6b;font-size:13px;text-align:center;padding:8px;border-radius:8px;background:rgba(255,60,60,0.1);border:1px solid rgba(255,60,60,0.3);margin-top:8px;';
  el.textContent = '⚠️ ' + msg;
  document.querySelector('.login-form')!.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ==================== TUTORIAL ====================
export function initTutorialScreen(onPlay: () => void): void {
  const btn = document.getElementById('play-btn')!;
  btn.addEventListener('click', onPlay);
  btn.addEventListener('touchend', (e) => { e.preventDefault(); onPlay(); });
}

// ==================== HUD ====================
export function updateHUD(state: GameState): void {
  const nameEl = document.getElementById('hud-name')!;
  const classEl = document.getElementById('hud-class')!;
  nameEl.textContent = `${state.player.firstName} ${state.player.lastName}`;
  classEl.textContent = `ชั้น ${state.player.className} เลขที่ ${state.player.number}`;
  
  document.getElementById('score-value')!.textContent = state.score.toString();
  document.getElementById('progress-value')!.textContent = `${state.collectedParts.length}/8`;
}

export function showInteractionPrompt(show: boolean, text: string = ''): void {
  const el = document.getElementById('interaction-prompt')!;
  if (show) {
    el.classList.remove('hidden');
    document.getElementById('prompt-text')!.textContent = text;
  } else {
    el.classList.add('hidden');
  }
}

export function updateCollectedList(collectedIds: string[], wrongIds: string[]): void {
  const list = document.getElementById('collected-list')!;
  list.innerHTML = '';
  collectedIds.forEach(id => {
    const comp = WAVE_COMPONENTS.find(c => c.id === id)!;
    const isWrong = wrongIds.includes(id);
    const item = document.createElement('div');
    item.className = 'collected-item';
    item.innerHTML = `${comp.icon} ${comp.nameTh}`;
    if (isWrong) item.style.borderColor = 'rgba(255,100,100,0.5)';
    list.appendChild(item);
  });
}

// ==================== QUIZ ====================
export function showQuiz(
  componentId: string,
  onAnswer: (correct: boolean, componentId: string) => void,
  onClose: () => void
): void {
  const question = QUIZ_QUESTIONS.find(q => q.componentId === componentId);
  if (!question) return;

  const comp = WAVE_COMPONENTS.find(c => c.id === componentId)!;
  
  const panel = document.getElementById('quiz-panel')!;
  panel.classList.remove('hidden');

  document.getElementById('quiz-icon')!.textContent = comp.icon;
  document.getElementById('quiz-question')!.textContent = question.question;

  const choicesEl = document.getElementById('quiz-choices')!;
  const feedbackEl = document.getElementById('quiz-feedback')!;
  feedbackEl.classList.add('hidden');
  choicesEl.innerHTML = '';
  choicesEl.classList.remove('hidden');

  question.choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = `${String.fromCharCode(65 + index)}. ${choice}`;
    btn.addEventListener('click', () => handleAnswer(index));
    btn.addEventListener('touchend', (e) => { e.preventDefault(); handleAnswer(index); });
    choicesEl.appendChild(btn);
  });

  function handleAnswer(index: number): void {
    const correct = index === question!.correctIndex;
    const btns = choicesEl.querySelectorAll('.choice-btn');
    btns.forEach((b, i) => {
      (b as HTMLButtonElement).disabled = true;
      if (i === question!.correctIndex) b.classList.add('correct');
      else if (i === index && !correct) b.classList.add('wrong');
    });

    feedbackEl.classList.remove('hidden');
    choicesEl.classList.add('hidden');

    const feedbackText = document.getElementById('feedback-text')!;
    const feedbackExp = document.getElementById('feedback-explanation')!;

    if (correct) {
      feedbackText.textContent = '🎉 ถูกต้อง! +10 คะแนน';
      feedbackText.style.color = '#00ff88';
    } else {
      const correctChoice = question!.choices[question!.correctIndex];
      feedbackText.textContent = `❌ ไม่ถูกต้อง - คำตอบที่ถูก: ${correctChoice}`;
      feedbackText.style.color = '#ff6b6b';
    }
    feedbackExp.textContent = question!.explanation;

    onAnswer(correct, componentId);

    const closeBtn = document.getElementById('feedback-close')!;
    const closeHandler = () => {
      panel.classList.add('hidden');
      onClose();
      closeBtn.removeEventListener('click', closeHandler);
      closeBtn.removeEventListener('touchend', closeHandler2);
    };
    const closeHandler2 = (e: Event) => { e.preventDefault(); closeHandler(); };
    closeBtn.addEventListener('click', closeHandler);
    closeBtn.addEventListener('touchend', closeHandler2);
  }
}

export function hideQuiz(): void {
  document.getElementById('quiz-panel')!.classList.add('hidden');
}

// ==================== INFO PANEL ====================
export function showInfoPanel(componentId: string): void {
  const comp = WAVE_COMPONENTS.find(c => c.id === componentId);
  if (!comp) return;
  
  const panel = document.getElementById('info-panel')!;
  panel.classList.remove('hidden');
  document.getElementById('info-title')!.textContent = `${comp.icon} ${comp.nameTh} (${comp.nameEn})`;
  document.getElementById('info-body')!.textContent = comp.explanation;
  document.getElementById('info-formula')!.textContent = `สูตร: ${comp.formula}`;
}

export function initInfoClose(): void {
  const closeBtn = document.getElementById('close-info')!;
  const hide = (e?: Event) => {
    if (e) e.preventDefault();
    document.getElementById('info-panel')!.classList.add('hidden');
  };
  closeBtn.addEventListener('click', hide);
  closeBtn.addEventListener('touchend', (e) => hide(e));
}

// ==================== WAVE HUD CANVAS ====================
export function drawWaveHUD(): void {
  const canvas = document.getElementById('wave-canvas-hud') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width, h = canvas.height;
  
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  
  for (let x = 0; x <= w; x += 2) {
    const t = Date.now() / 1000;
    const y = h/2 + (h/2 - 8) * Math.sin(2 * Math.PI * (x / w * 2 - t * 0.5));
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Equilibrium line
  ctx.strokeStyle = 'rgba(0,255,204,0.3)';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, h/2);
  ctx.lineTo(w, h/2);
  ctx.stroke();
  ctx.setLineDash([]);
  
  requestAnimationFrame(drawWaveHUD);
}

// ==================== RESULT SCREEN ====================
export function showResultScreen(state: GameState): void {
  showScreen('result-screen');
  
  const fullName = `${state.player.firstName} ${state.player.lastName}`;
  document.getElementById('result-name')!.textContent = fullName;
  document.getElementById('result-class')!.textContent = state.player.className;
  document.getElementById('result-number')!.textContent = state.player.number;
  
  // Animate score
  const scoreEl = document.getElementById('result-score-big')!;
  let currentScore = 0;
  const targetScore = state.score;
  const duration = 1500;
  const start = Date.now();
  const animScore = () => {
    const progress = Math.min((Date.now() - start) / duration, 1);
    currentScore = Math.round(targetScore * progress);
    scoreEl.textContent = currentScore.toString();
    if (progress < 1) requestAnimationFrame(animScore);
  };
  animScore();
  
  // Grade
  const { letter, cls } = getGrade(state.score, 80);
  const badge = document.getElementById('grade-badge')!;
  badge.textContent = letter;
  badge.className = 'grade-badge ' + cls;
  
  // Parts list
  const partsList = document.getElementById('result-parts-list')!;
  partsList.innerHTML = '';
  WAVE_COMPONENTS.forEach(comp => {
    const found = state.collectedParts.includes(comp.id);
    const wrong = state.wrongAnswers.includes(comp.id);
    const badge = document.createElement('div');
    badge.className = 'result-part-badge' + (wrong ? ' wrong' : '');
    badge.innerHTML = `${comp.icon} ${comp.nameTh} ${found ? (wrong ? '(ตอบผิด)' : '✓') : '✗'}`;
    partsList.appendChild(badge);
  });
  
  // Timestamp
  document.getElementById('result-timestamp')!.textContent = formatTime(new Date());
}

export function initResultActions(onRetry: () => void): void {
  const retryBtn = document.getElementById('retry-btn')!;
  const handle = (e?: Event) => { if(e) e.preventDefault(); onRetry(); };
  retryBtn.addEventListener('click', handle);
  retryBtn.addEventListener('touchend', (e) => handle(e));
  
  const screenshotBtn = document.getElementById('screenshot-hint')!;
  const handleScreenshot = (e?: Event) => {
    if(e) e.preventDefault();
    screenshotBtn.textContent = '📸 กด Power + Volume Down เพื่อแคปหน้าจอ!';
    screenshotBtn.style.background = 'linear-gradient(135deg, #ffd700, #ff8800)';
    setTimeout(() => {
      screenshotBtn.textContent = '📸 แคปหน้าจอส่งครู';
      screenshotBtn.style.background = '';
    }, 3000);
  };
  screenshotBtn.addEventListener('click', handleScreenshot);
  screenshotBtn.addEventListener('touchend', (e) => handleScreenshot(e));
}

// ==================== ROTATE PROMPT ====================
export function checkOrientation(): void {
  const prompt = document.getElementById('rotate-prompt')!;
  const update = () => {
    if (window.innerHeight > window.innerWidth) {
      prompt.classList.add('show');
    } else {
      prompt.classList.remove('show');
    }
  };
  update();
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', () => setTimeout(update, 300));
}
