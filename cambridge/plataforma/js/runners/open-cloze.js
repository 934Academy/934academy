import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initOpenCloze(exercises, skill, part) {
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
      <h1 class="page-title">Part 2 — Open Cloze</h1>
      <p class="page-subtitle">${exercises.length} ejercicios disponibles</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">✏️</div>
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

function buildGappedText() {
  let text = exercise.reading_text;
  exercise.questions.forEach((q, i) => {
    const num    = i + 9;
    const marker = `(${num}) ____`;
    const input  = `<input type="text" data-id="${q.id}" placeholder="${num}"
      style="width:90px;padding:4px 8px;border-radius:6px;border:2px solid var(--color-border);
      background:var(--color-surface);color:var(--color-text);text-align:center;
      font-weight:600;text-transform:uppercase" value="${answers[q.id] || ''}"/>`;
    text = text.replace(marker, input);
  });
  return text;
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 2 — ${exercise.title}</h1>
      <p class="page-subtitle">Escribe una sola palabra en cada hueco</p>
    </div>
    <div class="card" style="line-height:2.4;margin-bottom:1.5rem">${buildGappedText()}</div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Corregir</button>
    </div>
  `;

  c.querySelectorAll('input[data-id]').forEach(inp => {
    inp.addEventListener('input', () => { answers[inp.dataset.id] = inp.value.trim().toUpperCase(); });
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => {
    c.querySelectorAll('input[data-id]').forEach(inp => {
      answers[inp.dataset.id] = inp.value.trim().toUpperCase();
    });
    finishQuiz(exercises);
  });
}

async function finishQuiz(exercises) {
  let correct = 0;
  exercise.questions.forEach(q => {
    const accepted = q.answer.split('/').map(a => a.trim().toUpperCase());
    if (accepted.includes((answers[q.id] || '').toUpperCase())) correct++;
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
      <button class="btn" id="btn-destreza">← Use of English</button>
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
    const num     = i + 9;
    const userAns = (answers[q.id] || '').toUpperCase();
    const accepted = q.answer.split('/').map(a => a.trim().toUpperCase());
    const ok      = accepted.includes(userAns);
    const div     = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Hueco ${num}: ${ok ? '✅ Correcto' : '❌ Incorrecto'}
      </div>
      <p><strong>Tu respuesta:</strong> ${userAns || '<em>Sin responder</em>'}</p>
      <p><strong>Correcta:</strong> <span style="color:#22c55e;font-weight:600">${q.answer}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explicación:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}