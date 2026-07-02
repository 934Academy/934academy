import { saveResult } from '../auth.js';

let exercise = null;
let userAnswers = {};
let _skill = '';
let _part  = '';
let _exercises = [];

export function initKeyWordC1(exercises, skill, part) {
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
      <h1 class="page-title">Part 4 — Key Word Transformations (C1)</h1>
      <p class="page-subtitle">${_exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${_exercises.map((ex, i) => {
        const previewText = ex.text_preview || "";
        return `
          <div class="skill-card" data-i="${i}">
            <div class="skill-icon">🔄</div>
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
      userAnswers = {};
      renderExercise();
    });
  });
}

function renderExercise() {
  const c = document.getElementById('ejercicio-content');
  
  const questionsHtml = exercise.questions.map(q => `
    <div class="card" style="margin-bottom:1.5rem;">
      <div style="font-weight:600; margin-bottom:0.75rem;">
        <span style="color:var(--color-text-muted); margin-right:8px;">${q.id}.</span> 
        ${q.sentence1}
      </div>
      <div style="text-align:center; margin: 1rem 0;">
        <span style="font-weight:800; background:var(--color-surface); padding:4px 12px; border-radius:6px; border: 1px solid var(--color-border); letter-spacing:1px; color:var(--color-primary)">${q.keyword}</span>
      </div>
      <div style="display:flex; align-items:center; flex-wrap:wrap; gap:0.5rem; line-height:2;">
        <span>${q.sentence2_start}</span>
        <input type="text" id="gap-${q.id}" autocomplete="off" style="flex:1; min-width:200px; padding: 6px 12px; border: 2px solid var(--color-border); border-radius: 6px; text-align: center; font-weight: bold; font-size:1rem;" placeholder="3 - 6 words">
        <span>${q.sentence2_end}</span>
      </div>
    </div>
  `).join('');

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 4 — ${exercise.title}</h1>
      <p class="page-subtitle">Complete the second sentence so that it has a similar meaning to the first, using the word given. Do not change the word given. You must use between three and six words.</p>
    </div>
    
    ${questionsHtml}
    
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
  
  exercise.questions.forEach(q => {
    const inputEl = document.getElementById(`gap-${q.id}`);
    // Limpiamos espacios extra y pasamos a mayúsculas para comparar
    const userAnswer = inputEl ? inputEl.value.trim().toUpperCase().replace(/\s+/g, ' ') : "";
    userAnswers[q.id] = userAnswer;
    
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
    <div id="review-list" style="display:flex;flex-direction:column;gap:1.5rem"></div>
  `;
  
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz());

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q) => {
    const userAnswer = userAnswers[q.id];
    const ok = q.answers.includes(userAnswer);
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    
    const correctAnswersStr = q.answers.join(" / ");
    
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}; margin-bottom: 0.5rem;">
        Question ${q.id}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <div style="font-size:0.95rem; margin-bottom:1rem; color:var(--color-text-muted)">
        <em>${q.sentence1}</em><br>
        <strong>${q.keyword}</strong>
      </div>
      <p><strong>Your answer:</strong> ${q.sentence2_start} <u>${userAnswer || '<em>(empty)</em>'}</u> ${q.sentence2_end}</p>
      <p><strong>Correct:</strong> ${q.sentence2_start} <u style="color:#22c55e;font-weight:600">${correctAnswersStr}</u> ${q.sentence2_end}</p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}