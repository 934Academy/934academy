import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initReadingMultipleMatchingC1(exercises, skill, part) {
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
      <h1 class="page-title">Part 7 — Multiple Matching</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">🔗</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">${ex.text_preview.substring(0, 80)}...</div>
          <div class="skill-arrow">Start →</div>
        </div>
      `).join('')}
    </div>
  `;
  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = exercises[parseInt(card.dataset.i)];
      answers  = {};
      renderExercise(exercises);
    });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  const sectionLabels = exercise.sections.map(s => s.label.split(' — ')[0]);

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 7 — ${exercise.title}</h1>
      <p class="page-subtitle">Read the sections and match each question with the correct person</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">
      ${exercise.sections.map(s => `
        <div class="card">
          <div class="card-title">${s.label}</div>
          <p>${s.text}</p>
        </div>
      `).join('')}
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">Questions</div>
      <div style="display:flex;flex-direction:column;gap:.75rem" id="questions-list"></div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>
  `;

  const list = document.getElementById('questions-list');
  exercise.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:1rem;flex-wrap:wrap';
    div.innerHTML = `
      <span style="min-width:1.5rem;font-weight:700;color:var(--color-primary)">${i + 1}</span>
      <span style="flex:1">${q.text}</span>
      <select data-id="${q.id}"
        style="padding:6px 10px;border-radius:6px;border:2px solid var(--color-border);
        background:var(--color-surface);color:var(--color-text);font-weight:600">
        <option value="">—</option>
        ${sectionLabels.map(l => `<option value="${l}" ${answers[q.id] === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
    `;
    list.appendChild(div);
  });

  c.querySelectorAll('select[data-id]').forEach(sel => {
    sel.addEventListener('change', () => { answers[sel.dataset.id] = sel.value; });
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => finishQuiz(exercises));
}

async function finishQuiz(exercises) {
  let correct = 0;
  exercise.questions.forEach(q => {
    if ((answers[q.id] || '') === q.answer) correct++;
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
  } catch(e) { console.warn('Error guardando resultado:', e); }

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
      <button class="btn btn-primary" id="btn-review">Review Answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-destreza">← Reading</button>
    </div>
  `;

  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Review — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Back to Results</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz(exercises));

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q, i) => {
    const userAns = answers[q.id] || '';
    const ok      = userAns === q.answer;
    const section = exercise.sections.find(s => s.label.startsWith(q.answer));
    const div     = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Question ${i + 1}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <p>${q.text}</p>
      <p><strong>Your Answer:</strong> ${userAns || '<em>Not answered</em>'}</p>
      <p><strong>Correct:</strong> <span style="color:#22c55e;font-weight:600">${q.answer}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}