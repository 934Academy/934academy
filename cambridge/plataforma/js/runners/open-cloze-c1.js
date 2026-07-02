import { saveResult } from '../auth.js';

let exercise = null;
let userAnswers = {};
let _skill = '';
let _part  = '';
let _exercises = [];

export function initOpenClozeC1(exercises, skill, part) {
  exercise = null;
  userAnswers = {};
  _skill = skill;
  _part = part;
  _exercises = exercises;
  renderSelector();
}

function renderSelector() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 2 — Open Cloze (C1)</h1>
      <p class="page-subtitle">${_exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${_exercises.map((ex, i) => {
        const previewText = ex.text_preview || ex.text || ex.reading_text || "";
        return `
          <div class="skill-card" data-i="${i}">
            <div class="skill-icon">✍️</div>
            <div class="skill-name">${ex.title}</div>
            <div class="skill-desc">${previewText.substring(0, 80)}...</div>
            <div class="skill-arrow">Start →</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = _exercises[parseInt(card.dataset.i)];
      exercise.questions = exercise.questions || exercise.gaps;
      userAnswers = {};
      renderExercise();
    });
  });
}

function renderExercise() {
  const c = document.getElementById('ejercicio-content');
  
  // Reemplazamos los huecos (ej: (9) ______) por inputs de texto HTML
  let interactiveText = exercise.reading_text || exercise.text || "";
  exercise.questions.forEach(q => {
    const marker = `(${q.id}) ______`;
    const inputHtml = `<input type="text" id="gap-${q.id}" class="cloze-input" placeholder="${q.id}" autocomplete="off" style="width: 60px; padding: 4px 8px; border: 2px solid var(--color-border); border-radius: 6px; text-align: center; font-weight: bold; margin: 0 4px;">`;
    interactiveText = interactiveText.replace(marker, inputHtml);
  });

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 2 — ${exercise.title}</h1>
      <p class="page-subtitle">Read the text and think of the word which best fits each gap. Use only ONE word.</p>
    </div>
    
    <div class="card" style="margin-bottom:1.5rem;line-height:2.2;font-size:1.05rem;">
      <p style="text-align:left">${interactiveText}</p>
    </div>
    
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-submit">Submit Answers</button>
    </div>
  `;

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector());
  document.getElementById('btn-submit').addEventListener('click', () => finishQuiz());
}

async function finishQuiz() {
  let correct = 0;
  
  // Recoger respuestas de los inputs y evaluar
  exercise.questions.forEach(q => {
    const inputEl = document.getElementById(`gap-${q.id}`);
    const userAnswer = inputEl ? inputEl.value.trim().toUpperCase() : "";
    userAnswers[q.id] = userAnswer;
    
    // Comprobar si la respuesta del usuario está en el array de respuestas válidas
    if (q.answers.includes(userAnswer)) {
      correct++;
    }
  });
  
  const total = exercise.questions.length;
  const pct   = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try {
    await saveResult({
      exam:       _skill,
      part:       parseInt(_part.replace('part', '')),
      exerciseId: exercise.title,
      score:      pct,
    });
  } catch(e) { 
    console.warn('Error guardando resultado:', e); 
  }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Results — ${exercise.title}</h1>
    </div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Correct</div>
        <div class="stat-value">${correct} / ${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Score</div>
        <div class="stat-value" style="color:${color}">${pct}%</div>
      </div>
    </div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn btn-primary" id="btn-review">Check answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose another exercise</button>
      <button class="btn" id="btn-destreza">← Use of English</button>
    </div>
  `;

  document.getElementById('btn-review').addEventListener('click', () => showReview());
  document.getElementById('btn-repeat').addEventListener('click', () => { userAnswers = {}; renderExercise(); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector());
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview() {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Review — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return to results</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz());

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q) => {
    const userAnswer = userAnswers[q.id];
    const ok = q.answers.includes(userAnswer);
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    
    // Mostramos todas las posibles opciones válidas unidas por "/"
    const correctAnswersStr = q.answers.join(" / ");
    
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Gap ${q.id}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <p><strong>Your answer:</strong> ${userAnswer || '<em>(empty)</em>'}</p>
      <p><strong>Correct:</strong> <span style="color:#22c55e;font-weight:600">${correctAnswersStr}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}