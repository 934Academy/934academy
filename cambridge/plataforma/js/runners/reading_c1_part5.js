import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initReadingC1Part5(exercises, skill, part) {
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
      <h1 class="page-title">Part 5 — Multiple Choice</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">📘</div>
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
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 5 — ${exercise.title}</h1>
      <p class="page-subtitle">Read the text and choose the best answer</p>
    </div>
    <div class="card" style="line-height:1.8;margin-bottom:1.5rem">${exercise.reading_text}</div>
    <div style="display:flex;flex-direction:column;gap:1rem" id="questions-list"></div>
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
      <div class="card-title">Question ${i + 31}</div>
      <p style="margin-bottom:.75rem"><strong>${q.question}</strong></p>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${q.options.map((opt, j) => `
          <label style="display:flex;gap:.75rem;cursor:pointer">
            <input type="radio" name="q_${q.id}" value="${j}" ${answers[q.id] === j ? 'checked' : ''}>
            <span>${String.fromCharCode(65 + j)}. ${opt}</span>
          </label>
        `).join('')}
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => {
    exercise.questions.forEach(q => {
      const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
      answers[q.id] = selected ? parseInt(selected.value, 10) : -1;
    });
    finishQuiz(exercises);
  });
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
    // Si saveResult falla o no responde, el try/catch evitará que la app colapse, 
    // pero si es una promesa que nunca se resuelve, la pantalla se congelará aquí.
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
      <button class="btn" id="btn-sel">Choose another exercise</button>
      <button class="btn" id="btn-destreza">← Use of English</button>
    </div>
  `;

  // 2. Pasamos 'exercises' a showReview para poder volver atrás
  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  
  document.getElementById('btn-repeat').addEventListener('click', () => { 
    // 3. CORREGIDO: Limpiamos respuestas y volvemos a generar el ejercicio
    answers = {}; 
    renderExercise(exercises); 
  });
  
  // 4. CORREGIDO: Pasamos 'exercises' para que el selector no explote
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

// 5. Añadimos 'exercises' como parámetro aquí también
function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Review — ${exercise.title}</h1>
    </div>
    <button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return to results</button>
    <div id="review-list" style="display:flex;flex-direction:column;gap:1rem"></div>
  `;
  
  // 6. Pasamos 'exercises' de vuelta a la vista de resultados
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
        Question ${i + 31}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      <p><strong>Your answer:</strong> ${(sel !== undefined && sel !== -1) ? q.options[sel] : '<em>Not answered</em>'}</p>
      <p><strong>Correct:</strong> <span style="color:#22c55e;font-weight:600">${q.options[q.answer]}</span></p>
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}