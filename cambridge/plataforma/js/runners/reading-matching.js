import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initReadingMatching(exercises, skill, part) {
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
      <h1 class="page-title">Part 2 — Matching</h1>
      <p class="page-subtitle">${exercises.length} ejercicios disponibles</p>
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
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 2 — ${exercise.title}</h1>
      <p class="page-subtitle">Relaciona cada persona con la propiedad más adecuada (A–H)</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">🏠 Propiedades disponibles</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.75rem;margin-top:.75rem">
        ${exercise.options.map(opt => `
          <div style="padding:.75rem;border-radius:8px;border:2px solid var(--color-border);background:var(--color-surface)">
            <strong style="color:var(--color-primary);font-size:1.1rem">${opt.id}</strong>
            <p style="margin:.25rem 0 0;font-size:.875rem;line-height:1.5">${opt.text}</p>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">👥 Personas</div>
      <div style="display:flex;flex-direction:column;gap:1rem;margin-top:.75rem" id="people-list"></div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Corregir</button>
    </div>
  `;

  const list = document.getElementById('people-list');
  exercise.people.forEach(person => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap;padding:.75rem;border-radius:8px;border:1px solid var(--color-border)';
    div.innerHTML = `
      <div style="flex:1;min-width:200px">
        <strong style="color:var(--color-primary)">${person.number}.</strong>
        <span style="font-size:.9rem"> ${person.description}</span>
      </div>
      <select data-id="${person.id}"
        style="padding:6px 12px;border-radius:6px;border:2px solid var(--color-border);
        background:var(--color-surface);color:var(--color-text);font-weight:700;min-width:80px">
        <option value="">—</option>
        ${exercise.options.map(opt => `
          <option value="${opt.id}" ${answers[person.id] === opt.id ? 'selected' : ''}>${opt.id}</option>
        `).join('')}
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
  exercise.people.forEach(person => {
    if (answers[person.id] === exercise.answers[person.id]) correct++;
  });
  const total = exercise.people.length;
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
    <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem" id="review-list"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-repeat">Repetir</button>
      <button class="btn" id="btn-sel">Elegir otro</button>
      <button class="btn" id="btn-destreza">← Reading</button>
    </div>
  `;

  const list = document.getElementById('review-list');
  exercise.people.forEach(person => {
    const userAns   = answers[person.id] || '';
    const correctId = exercise.answers[person.id];
    const ok        = userAns === correctId;
    const correctOpt = exercise.options.find(o => o.id === correctId);
    const div = document.createElement('div');
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Persona ${person.number}: ${ok ? '✅ Correcta' : '❌ Incorrecta'}
      </div>
      <p style="font-size:.9rem">${person.description}</p>
      <p><strong>Tu respuesta:</strong> ${userAns || '<em>Sin responder</em>'}</p>
      <p><strong>Correcta:</strong> <span style="color:#22c55e;font-weight:700">${correctId}</span></p>
      <p style="font-size:.875rem;color:var(--color-text-muted)">${correctOpt?.text || ''}</p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem;font-size:.875rem">
        <strong>Explicación:</strong> ${exercise.explanations[person.id]}
      </p>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}