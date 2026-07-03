import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initReadingC1Part8(exercises, skill, part) {
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
      <h1 class="page-title">Part 8 — Multiple Matching</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">🗂️</div>
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
      <h1 class="page-title">Part 8 — ${exercise.title}</h1>
      <p class="page-subtitle">Read the texts and answer the questions</p>
    </div>
    <div class="card" style="margin-bottom:1.5rem">
      ${exercise.texts.map(t => `
        <div style="margin-bottom:1rem">
          <h3 style="margin-bottom:.4rem">${t.title}</h3>
          <p>${t.content}</p>
        </div>
      `).join('')}
    </div>
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
      <div class="card-title">Question ${i + 1}</div>
      <p style="margin-bottom:.75rem"><strong>${q.question}</strong></p>
      <div style="display:flex;flex-wrap:wrap;gap:.75rem">
        ${exercise.texts.map(t => `
          <label style="display:flex;gap:.5rem;cursor:pointer">
            <input type="radio" name="q_${q.id}" value="${t.id}" ${answers[q.id] === t.id ? 'checked' : ''}>
            <span>${t.id}</span>
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
      answers[q.id] = selected ? selected.value : '';
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
      <!-- Añadido el botón de Check answers -->
      <button class="btn btn-primary" id="btn-review">Check answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-back">← Reading</button>
    </div>
  `;

  // Listener para la pantalla de revisión
  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-back').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

// Nueva función para mostrar las correcciones
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
  exercise.questions.forEach((q, i) => {
    const sel = answers[q.id];
    const ok  = sel === q.answer;
    const div = document.createElement('div');
    
    div.className = 'card';
    div.style.borderLeft = `4px solid ${ok ? '#22c55e' : '#ef4444'}`;
    
    // Buscamos los textos correspondientes para mostrar el contenido (Text A, B, C...)
    const userText = sel ? exercise.texts.find(t => t.id === sel) : null;
    const correctText = exercise.texts.find(t => t.id === q.answer);

    div.innerHTML = `
      <div class="card-title" style="color:${ok ? '#22c55e' : '#ef4444'}">
        Question ${i + 1}: ${ok ? '✅ Correct' : '❌ Incorrect'}
      </div>
      
      <p style="margin-bottom: 0.5rem"><strong>${q.question}</strong></p>
      
      <p style="margin-top: 0.5rem;">
        <strong>Your answer:</strong> 
        ${sel 
          ? `<span style="background: var(--color-border); padding: 2px 6px; border-radius:4px;">Text ${sel}</span><br><em style="color: grey; display: block; margin-top: 4px;">"${userText.content}"</em>` 
          : '<em>Not answered</em>'
        }
      </p>
      
      <p style="margin-top: 0.5rem;">
        <strong>Correct:</strong> 
        <span style="color:#22c55e;font-weight:600">
          <span style="background: #22c55e; color: white; padding: 2px 6px; border-radius:4px;">Text ${q.answer}</span>
        </span><br>
        <em style="color: grey; display: block; margin-top: 4px;">"${correctText.content}"</em>
      </p>
      
      <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem">
        <strong>Explanation:</strong> ${q.explanation}
      </p>
    `;
    list.appendChild(div);
  });
}