import { saveResult } from '../auth.js';

let exercise = null;
let answers  = {};
let _skill   = '';
let _part    = '';

export function initReadingGappedText(exercises, skill, part) {
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
      <h1 class="page-title">Part 6 — Gapped Text</h1>
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

  // Build text with gap markers
  let textWithGaps = exercise.reading_text;
  ['A','B','C','D'].forEach(letter => {
    const selectedId = answers[letter] || '';
    const selectedPara = exercise.paragraphs.find(p => p.id === selectedId);
    const gapLabel = selectedPara
      ? `<span style="background:var(--color-primary);color:#fff;padding:2px 10px;border-radius:20px;
          font-weight:700;font-size:.85rem;cursor:pointer" data-gap="${letter}">[${letter}: ${selectedPara.letter} ✓]</span>`
      : `<span style="background:var(--color-border);color:var(--color-text);padding:2px 10px;border-radius:20px;
          font-weight:700;font-size:.85rem;cursor:pointer" data-gap="${letter}">[Hueco ${letter}]</span>`;
    textWithGaps = textWithGaps.replace(`[${letter}]`, gapLabel);
  });

  // Available paragraphs (not yet used)
  const usedIds = Object.values(answers);
  const available = exercise.paragraphs.filter(p => !usedIds.includes(p.id));

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 6 — ${exercise.title}</h1>
      <p class="page-subtitle">Elige el párrafo que encaja en cada hueco [A]–[D]</p>
    </div>
    <div class="card" style="line-height:1.8;margin-bottom:1.5rem">${textWithGaps}</div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">Párrafos disponibles</div>
      <div style="display:flex;flex-direction:column;gap:.75rem" id="para-list">
        ${available.map(p => `
          <div class="card" data-para-id="${p.id}" style="cursor:pointer;border:2px solid var(--color-border)">
            <strong>${p.letter}.</strong> ${p.text}
          </div>
        `).join('')}
        ${available.length === 0 ? '<p style="color:var(--color-text-muted)">Todos los párrafos han sido asignados.</p>' : ''}
      </div>
    </div>
    <div style="margin-bottom:1rem;padding:1rem;background:var(--color-surface);border-radius:8px;
      border:1px solid var(--color-border);font-size:.85rem;color:var(--color-text-muted)">
      💡 Haz clic en un hueco del texto para seleccionarlo, luego haz clic en el párrafo que quieres asignarle.
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

  c.querySelectorAll('[data-para-id]').forEach(el => {
    el.addEventListener('click', () => {
      if (!selectedGap) {
        el.style.outline = '2px solid var(--color-primary)';
        setTimeout(() => el.style.outline = '', 600);
        return;
      }
      // Remove previous assignment of this gap
      delete answers[selectedGap];
      answers[selectedGap] = el.dataset.paraId;
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
  ['A','B','C','D'].forEach(letter => {
    if (answers[letter] === exercise.answers[letter]) correct++;
  });
  const total = 4;
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
  ['A','B','C','D'].forEach(letter => {
    const correctId  = exercise.answers[letter];
    const userId     = answers[letter];
    const correctPara = exercise.paragraphs.find(p => p.id === correctId);
    const userPara    = exercise.paragraphs.find(p => p.id === userId);
    const ok          = userId === correctId;
    const div         = document.createElement('div');
    div.className     = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Hueco ${letter}: ${ok ? '✅ Correcto' : '❌ Incorrecto'}
      </div>
      <p><strong>Tu respuesta:</strong> ${userPara ? `${userPara.letter}. ${userPara.text}` : '<em>Sin responder</em>'}</p>
      <p><strong>Correcta:</strong> <span style="color:#22c55e;font-weight:600">${correctPara.letter}. ${correctPara.text}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explicación:</strong> ${exercise.explanations[letter]}
      </p>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}