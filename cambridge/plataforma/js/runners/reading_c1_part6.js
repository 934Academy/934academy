import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {}; // Almacenará { p6_q1: "A", p6_q2: "D", ... }
let _skill   = '';
let _part    = '';

export function initReadingC1Part6(exercises, skill, part) {
  exercise = null;
  answers  = {};
  _skill   = skill;
  _part    = part;
  renderSelector(exercises);
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 6 — Cross-text Multiple Matching</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">📄</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">${ex.text_preview}</div>
          <div class="skill-arrow">Start →</div>
        </div>
      `).join('')}
    </div>
  `;
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = exercises[parseInt(card.dataset.i, 10)];
      answers  = {}; 
      renderExercise(exercises);
    });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');

  // 1. Renderizamos los 4 textos (A, B, C, D)
  const textsHtml = exercise.texts.map(t => `
    <div style="margin-bottom: 1rem; padding: 1rem; background: var(--color-surface); border-left: 4px solid var(--color-primary); border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="margin-top: 0; color: var(--color-primary); margin-bottom: 0.5rem;">${t.title}</h3>
      <p style="line-height: 1.6; margin: 0;">${t.content}</p>
    </div>
  `).join('');

  // 2. Renderizamos las preguntas con selectores A, B, C, D
  const questionsHtml = exercise.questions.map((q, i) => {
    return `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="card-title">Question ${i + 37}</div>
        <p style="margin-bottom:.75rem"><strong>${q.question}</strong></p>
        <div style="display:flex; gap:1.5rem; flex-wrap: wrap;">
          ${['A', 'B', 'C', 'D'].map(letter => `
            <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer;">
              <input type="radio" name="q_${q.id}" value="${letter}" ${answers[q.id] === letter ? 'checked' : ''}>
              <span>Text ${letter}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 6 — ${exercise.title}</h1>
      <p class="page-subtitle">Read the four short texts and answer the questions.</p>
    </div>
    
    <div style="margin-bottom:2rem;">
      ${textsHtml}
    </div>

    <div id="questions-list">
      ${questionsHtml}
    </div>

    <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-top: 1.5rem;">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn" id="btn-clear">Clear Answers</button>
      <button class="btn btn-primary" id="btn-check">Check Results</button>
    </div>
  `;

  // Listeners para guardar las respuestas al hacer clic
  c.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      // e.target.name es "q_p6_q1", así que le quitamos el "q_" para usar el id real
      const qId = e.target.name.replace('q_', '');
      answers[qId] = e.target.value;
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => { 
    answers = {}; 
    renderExercise(exercises); 
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => finishQuiz(exercises));
}

async function finishQuiz(exercises) {
  let correct = 0;
  
  exercise.questions.forEach(q => {
    if (answers[q.id] === q.answer) correct++;
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
        <div class="stat-label">Correct Answers</div>
        <div class="stat-value">${correct} / ${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Final Score</div>
        <div class="stat-value" style="color:${color}">${pct}%</div>
      </div>
    </div>
    <div style="display:flex; gap:1rem; margin-top:1.5rem; flex-wrap:wrap">
      <button class="btn btn-primary" id="btn-review">Check answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose another exercise</button>
      <button class="btn" id="btn-destreza">← Use of English</button>
    </div>
  `;

  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  document.getElementById('btn-repeat').addEventListener('click', () => { 
    answers = {}; 
    renderExercise(exercises); 
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Review — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return to results</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz(exercises));

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q, i) => {
    const sel = answers[q.id];
    const ok  = sel === q.answer;
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Question ${i + 37}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <p style="margin-bottom: 0.5rem"><strong>${q.question}</strong></p>
      <p><strong>Your answer:</strong> ${sel ? `Text ${sel}` : '<em>Not answered</em>'}</p>
      <p><strong>Correct:</strong> <span style="color:#22c55e;font-weight:600">Text ${q.answer}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}