import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initReadingMultipleChoice(exercises, skill, part) {
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
      <h1 class="page-title">Part 5 — Multiple Choice</h1>
      <p class="page-subtitle">${exercises.length} ejercicios disponibles</p>
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
      exercise = exercises[parseInt(card.dataset.i)];
      answers  = {};
      renderExercise(exercises);
    });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 5 — ${exercise.title}</h1>
      <p class="page-subtitle">Lee el texto y responde las preguntas</p>
    </div>
    <div class="card" style="line-height:1.8;margin-bottom:1.5rem">${exercise.reading_text}</div>
    <div style="display:flex;flex-direction:column;gap:1.25rem" id="questions-list"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Corregir</button>
    </div>
  `;

  const list = document.getElementById('questions-list');
  exercise.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-title">Pregunta ${i + 1}</div>
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
      answers[qId] = parseInt(inp.value);
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
      <h1 class="page-title">Resultados — ${exercise.title}</h1>
    </div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Correctas</div>
        <div class="stat-value">${correct} / ${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Puntuación</div>
        <div class="stat-value" style="color:${color}">${pct}%</div>
      </div>
    </div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn btn-primary" id="btn-review">Revisar respuestas</button>
      <button class="btn" id="btn-repeat">Repetir</button>
      <button class="btn" id="btn-sel">Elegir otro</button>
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
      <h1 class="page-title">Revisión — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Volver a resultados</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz(exercises));

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q, i) => {
    const userAns = answers[q.id];
    const ok      = userAns === q.answer;
    const div     = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Pregunta ${i + 1}: ${ok ? '✅ Correcta' : '❌ Incorrecta'}
      </div>
      <p style="margin-bottom:.5rem">${q.text}</p>
      <p><strong>Tu respuesta:</strong> ${userAns !== undefined ? `${String.fromCharCode(65 + userAns)}. ${q.options[userAns]}` : '<em>Sin responder</em>'}</p>
      <p><strong>Correcta:</strong> <span style="color:#22c55e;font-weight:600">${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explicación:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}