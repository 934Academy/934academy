import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initReadingC1Part7(exercises, skill, part) {
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
      <h1 class="page-title">Part 7 — Gapped Text</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">🧱</div>
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
      answers = {};
      renderExercise(exercises);
    });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  let text = exercise.reading_text;
  exercise.questions.forEach(q => {
    const marker = `(${q.gap}) ____`;
    const select = `
      <select data-id="${q.id}" style="padding:6px 10px;border-radius:6px;border:2px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-weight:600">
        <option value="">Choose</option>
        ${exercise.paragraphs.map(p => `
          <option value="${p.id}" ${answers[q.id] === p.id ? 'selected' : ''}>${p.id}</option>
        `).join('')}
      </select>
    `;
    text = text.replace(marker, select);
  });

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 7 — ${exercise.title}</h1>
      <p class="page-subtitle">Insert the correct paragraph into each gap</p>
    </div>
    <div class="card" style="line-height:1.8;margin-bottom:1.5rem">${text}</div>
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-title">Paragraphs</div>
      ${exercise.paragraphs.map(p => `
        <div style="margin-bottom:1rem">
          <strong>${p.id}.</strong> ${p.text}
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>
  `;

  c.querySelectorAll('select[data-id]').forEach(sel => {
    sel.addEventListener('change', () => {
      answers[sel.dataset.id] = sel.value;
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
      <button class="btn btn-primary" id="btn-review">Check answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-back">← Reading</button>
    </div>
  `;

  // 2. Escuchamos el clic en el botón de revisión y llamamos a showReview
  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  
  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-back').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

// 3. Creamos la función para mostrar las correcciones
function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Review — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back-results" style="margin-bottom:1.5rem">← Return to results</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  document.getElementById('btn-back-results').addEventListener('click', () => finishQuiz(exercises));

  const list = document.getElementById('review-list');
  exercise.questions.forEach((q) => {
    const sel = answers[q.id];
    const ok  = sel === q.answer;
    const div = document.createElement('div');
    
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    
    // Buscamos los textos de los párrafos para dar más contexto en la corrección
    const userPara = sel ? exercise.paragraphs.find(p => p.id === sel) : null;
    const correctPara = exercise.paragraphs.find(p => p.id === q.answer);

    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Gap (${q.gap}): ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      
      <p style="margin-top: 0.5rem;">
        <strong>Your answer:</strong> 
        ${sel 
          ? `<span style="background: var(--color-border); padding: 2px 6px; border-radius:4px;">Paragraph ${sel}</span><br><em style="color: grey; display: block; margin-top: 4px;">"${userPara.text}"</em>` 
          : '<em>Not answered</em>'
        }
      </p>
      
      <p style="margin-top: 0.5rem;">
        <strong>Correct:</strong> 
        <span style="color:#22c55e;font-weight:600">
          <span style="background: #22c55e; color: white; padding: 2px 6px; border-radius:4px;">Paragraph ${q.answer}</span>
        </span><br>
        <em style="color: grey; display: block; margin-top: 4px;">"${correctPara.text}"</em>
      </p>
      
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}