import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initReadingGappedSentences(exercises, skill, part) {
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
      <h1 class="page-title">Part 4 — Gapped Sentences</h1>
      <p class="page-subtitle">${exercises.length} ejercicios disponibles</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">📄</div>
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

  // Replace gap markers [16]–[20] with styled labels or assigned sentence
  let textWithGaps = exercise.reading_text;
  Object.keys(exercise.answers).forEach(gapNum => {
    const assignedId = answers[gapNum];
    const assigned   = exercise.sentences.find(s => s.id === assignedId);
    const label = assigned
      ? `<span style="display:inline-block;background:var(--color-primary);color:#fff;padding:2px 10px;
          border-radius:20px;font-weight:700;font-size:.85rem;cursor:pointer;margin:0 4px"
          data-gap="${gapNum}">[${gapNum}: ${assigned.id} ✓]</span>`
      : `<span style="display:inline-block;background:var(--color-border);color:var(--color-text);
          padding:2px 10px;border-radius:20px;font-weight:700;font-size:.85rem;cursor:pointer;margin:0 4px"
          data-gap="${gapNum}">[Hueco ${gapNum}]</span>`;
    textWithGaps = textWithGaps.replace(`[${gapNum}]`, label);
  });

  const usedIds  = Object.values(answers);
  const available = exercise.sentences.filter(s => !usedIds.includes(s.id));

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 4 — ${exercise.title}</h1>
      <p class="page-subtitle">Elige la frase que encaja en cada hueco [16]–[20]</p>
    </div>
    <div class="card" style="line-height:1.8;margin-bottom:1.5rem">${textWithGaps}</div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">Frases disponibles</div>
      <div style="display:flex;flex-direction:column;gap:.75rem;margin-top:.75rem" id="sent-list">
        ${available.map(s => `
          <div class="card" data-sent-id="${s.id}" style="cursor:pointer;border:2px solid var(--color-border)">
            <strong style="color:var(--color-primary)">${s.id}.</strong> ${s.text}
          </div>
        `).join('')}
        ${available.length === 0 ? '<p style="color:var(--color-text-muted)">Todas las frases han sido asignadas.</p>' : ''}
      </div>
    </div>
    <div style="margin-bottom:1rem;padding:1rem;background:var(--color-surface);border-radius:8px;
      border:1px solid var(--color-border);font-size:.85rem;color:var(--color-text-muted)">
      💡 Haz clic en un hueco del texto para seleccionarlo, luego haz clic en la frase que quieres asignarle.
      Hay 3 frases extra que no se usan.
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn" id="btn-clear">Limpiar</button>
      <button class="btn btn-primary" id="btn-check">Corregir</button>
    </div>
  `;

  let selectedGap = null;

  c.querySelectorAll('[data-gap]').forEach(el => {
    el.addEventListener('click', () => {
      c.querySelectorAll('[data-gap]').forEach(g => g.style.outline = '');
      selectedGap = el.dataset.gap;
      el.style.outline = '3px solid var(--color-primary)';
    });
  });

  c.querySelectorAll('[data-sent-id]').forEach(el => {
    el.addEventListener('click', () => {
      if (!selectedGap) {
        el.style.outline = '2px solid var(--color-primary)';
        setTimeout(() => el.style.outline = '', 600);
        return;
      }
      delete answers[selectedGap];
      answers[selectedGap] = el.dataset.sentId;
      selectedGap = null;
      renderExercise(exercises);
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => finishQuiz(exercises));
}

async function finishQuiz(exercises) {
  let correct = 0;
  Object.keys(exercise.answers).forEach(gapNum => {
    if (answers[gapNum] === exercise.answers[gapNum]) correct++;
  });
  const total = Object.keys(exercise.answers).length;
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
  Object.keys(exercise.answers).forEach(gapNum => {
    const correctId  = exercise.answers[gapNum];
    const userId     = answers[gapNum];
    const correctSent = exercise.sentences.find(s => s.id === correctId);
    const userSent    = exercise.sentences.find(s => s.id === userId);
    const ok          = userId === correctId;
    const div         = document.createElement('div');
    div.className     = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Hueco ${gapNum}: ${ok ? '✅ Correcto' : '❌ Incorrecto'}
      </div>
      <p><strong>Tu respuesta:</strong> ${userSent ? `${userSent.id}. ${userSent.text}` : '<em>Sin responder</em>'}</p>
      <p><strong>Correcta:</strong> <span style="color:#22c55e;font-weight:600">${correctSent.id}. ${correctSent.text}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explicación:</strong> ${exercise.explanations[gapNum]}
      </p>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}