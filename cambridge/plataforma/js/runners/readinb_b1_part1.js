import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

function getPartLabel() {
  const n = parseInt(String(_part).replace('part', ''), 10);
  return Number.isFinite(n) ? `Part ${n}` : 'Reading';
}

export function initReadingB1Part1(exercises, skill, part) {
  exercise = null;
  answers = {};
  _skill = skill;
  _part = part;
  renderSelector(exercises);
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${getPartLabel()} — Multiple Choice</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">📖</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">${ex.text_preview.substring(0, 80)}...</div>
          <div class="skill-arrow">Start →</div>
        </div>
      `).join('')}
    </div>
  `;

  c.querySelectorAll('.skill-card[data-i]').forEach(card => {
    card.addEventListener('click', () => {
      exercise = exercises[parseInt(card.dataset.i, 10)];
      answers = {};
      renderExercise(exercises);
    });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${getPartLabel()} — ${exercise.title}</h1>
      <p class="page-subtitle">Read each text and answer the questions</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:1.25rem" id="questions-list"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>
  `;

  const list = document.getElementById('questions-list');

  exercise.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `
      <div class="card-title">Question ${i + 1}</div>
      ${q.reading_text ? `
        <div class="card" style="line-height:1.8;margin:.75rem 0;background:var(--color-surface)">
          ${q.reading_text}
        </div>
      ` : ''}
      <p style="margin-bottom:.75rem">${q.text}</p>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${q.options.map((opt, j) => `
          <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer;padding:.5rem;
            border-radius:8px;border:2px solid var(--color-border);background:var(--color-surface)">
            <input type="radio" name="q_${q.id}" value="${j}"
              ${answers[q.id] === j ? 'checked' : ''}
              style="accent-color:var(--color-primary)"/>
            <span>${String.fromCharCode(65 + j)}. ${opt}</span>
          </label>
        `).join('')}
      </div>
    `;

    list.appendChild(div);
  });

  c.querySelectorAll('input[type=radio]').forEach(inp => {
    inp.addEventListener('change', () => {
      const qId = inp.name.replace('q_', '');
      answers[qId] = parseInt(inp.value, 10);
    });
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
  const pct = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try {
    await saveResult({
      exam: _skill,
      part: parseInt(String(_part).replace('part', ''), 10),
      exerciseId: exercise.title,
      score: pct,
    });
  } catch (e) {
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
      <button class="btn btn-primary" id="btn-review">Review Answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-back">← Reading</button>
    </div>
  `;

  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-back').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
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
    const userAns = answers[q.id];
    const ok = userAns === q.answer;
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;

    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Question ${i + 1}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      ${q.reading_text ? `
        <div class="card" style="line-height:1.8;margin:.75rem 0;background:var(--color-surface)">
          ${q.reading_text}
        </div>
      ` : ''}
      <p style="margin-bottom:.5rem">${q.text}</p>
      <p><strong>Your answer:</strong> ${userAns !== undefined ? `${String.fromCharCode(65 + userAns)}. ${q.options[userAns]}` : '<em>Not answered</em>'}</p>
      <p><strong>Correct answer:</strong> <span style="color:#22c55e;font-weight:600">${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}