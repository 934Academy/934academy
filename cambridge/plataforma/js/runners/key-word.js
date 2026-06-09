import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initKeyWord(exercises, skill, part) {
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
      <h1 class="page-title">Part 4 — Key Word Transformations</h1>
      <p class="page-subtitle">${exercises.length} ejercicios disponibles</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">🔑</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">6 transformaciones con palabra clave</div>
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
      <h1 class="page-title">Part 4 — ${exercise.title}</h1>
      <p class="page-subtitle">Completa la segunda frase usando la palabra clave (2-5 palabras)</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:1.25rem" id="questions-list"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Corregir</button>
    </div>
  `;

  const list = document.getElementById('questions-list');
  exercise.questions.forEach((q, i) => {
    const inputHTML = `<input type="text" data-id="${q.id}"
      placeholder="2-5 palabras"
      style="min-width:200px;padding:6px 10px;border-radius:6px;border:2px solid var(--color-border);
      background:var(--color-surface);color:var(--color-text)"
      value="${answers[q.id] || ''}"/>`;

    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <div class="card-title">Pregunta ${i + 25}</div>
      <p style="margin-bottom:.5rem">${q.original}</p>
      <p style="margin-bottom:.75rem">
        <span style="display:inline-block;background:var(--color-primary);color:#fff;
        padding:2px 10px;border-radius:20px;font-weight:700;font-size:.8rem">${q.keyword}</span>
      </p>
      <p>${q.gapped.replace(/_{3,}/g, inputHTML)}</p>
    `;
    list.appendChild(div);
  });

  c.querySelectorAll('input[data-id]').forEach(inp => {
    inp.addEventListener('input', () => { answers[inp.dataset.id] = inp.value.trim(); });
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => {
    c.querySelectorAll('input[data-id]').forEach(inp => {
      answers[inp.dataset.id] = inp.value.trim();
    });
    finishQuiz(exercises);
  });
}

async function finishQuiz(exercises) {
  let correct = 0;
  exercise.questions.forEach(q => {
    const userAns  = (answers[q.id] || '').toUpperCase().trim();
    const accepted = q.answer.split('/').map(a => a.trim().toUpperCase());
    if (accepted.includes(userAns)) correct++;
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
      <h1 class="page-title">Corrección — ${exercise.title}</h1>
      <p class="page-subtitle">Comprueba tu respuesta con la solución</p>
    </div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Aproximadas</div>
        <div class="stat-value">${correct} / ${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Puntuación</div>
        <div class="stat-value" style="color:${color}">${pct}%</div>
      </div>
    </div>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-repeat">Repetir</button>
      <button class="btn" id="btn-sel">Elegir otro</button>
      <button class="btn" id="btn-destreza">← Use of English</button>
    </div>
  `;

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q, i) => {
    const userAns  = (answers[q.id] || '').trim();
    const accepted = q.answer.split('/').map(a => a.trim().toUpperCase());
    const ok       = accepted.includes(userAns.toUpperCase());
    const div      = document.createElement('div');
    div.className  = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML  = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Pregunta ${i + 25}: ${ok ? '✅ Correcta' : '❌ Incorrecta'}
      </div>
      <p><strong>Original:</strong> ${q.original}</p>
      <p><strong>Tu respuesta:</strong> <em>${userAns || 'Sin responder'}</em></p>
      <p><strong>Solución:</strong> <span style="color:#22c55e;font-weight:700">${q.answer}</span></p>
      <p><strong>Frase completa:</strong> ${q.full_answer}</p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explicación:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}