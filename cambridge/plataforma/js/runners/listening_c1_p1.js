import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningC1Part1(exercises, skill, part) {
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
      <h1 class="page-title">Part 1 — Multiple Choice (Short Extracts)</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}" style="cursor:pointer">
          <div class="skill-icon">🎧</div>
          <div class="skill-name">${ex.title}</div>
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
  
  // Ahora pintamos un reproductor de audio dentro de cada Extract
  const extractsHtml = exercise.extracts.map((ext, index) => `
    <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--color-primary);">
      <h3 style="margin-top: 0; margin-bottom: 0.5rem;">${ext.title}</h3>
      
      <!-- Reproductor individual para este extracto -->
      <div style="background: var(--color-background); padding: 0.5rem; border-radius: 6px; margin-bottom: 1.5rem; border: 1px dashed var(--color-border); text-align: center;">
         <audio controls style="width: 100%; max-width: 350px;">
            <source src="${ext.audio}" type="audio/mpeg">
            Your browser does not support the audio element.
         </audio>
      </div>

      ${ext.questions.map(q => `
        <div style="margin-bottom: 1.5rem;">
          <p style="font-weight: bold; margin-bottom: 0.75rem;">${q.question}</p>
          <div style="display:flex;flex-direction:column;gap:.5rem">
            ${q.options.map((opt, j) => `
              <label style="display:flex;gap:.75rem;cursor:pointer">
                <input type="radio" name="q_${q.id}" value="${j}" ${answers[q.id] === j ? 'checked' : ''}>
                <span>${String.fromCharCode(65 + j)}. ${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 1 — ${exercise.title}</h1>
      <p class="page-subtitle">Listen to three different extracts. Choose the answer (A, B or C).</p>
    </div>

    ${extractsHtml}

    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>
  `;

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => {
    exercise.extracts.forEach(ext => {
      ext.questions.forEach(q => {
        const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        answers[q.id] = selected ? parseInt(selected.value, 10) : -1;
      });
    });
    finishQuiz(exercises);
  });
}

async function finishQuiz(exercises) {
  let correct = 0;
  let total = 0;
  
  exercise.extracts.forEach(ext => {
    ext.questions.forEach(q => {
      total++;
      if (answers[q.id] === q.answer) correct++;
    });
  });

  const pct = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try {
    await saveResult({ exam: _skill, part: parseInt(_part.replace('part', '')), exerciseId: exercise.title, score: pct });
  } catch(e) { 
    console.warn('Error guardando resultado:', e); 
  }

  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header"><h1 class="page-title">Results</h1></div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-label">Correct</div><div class="stat-value">${correct} / ${total}</div></div>
      <div class="stat-card"><div class="stat-label">Score</div><div class="stat-value" style="color:${color}">${pct}%</div></div>
    </div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem">
      <button class="btn btn-primary" id="btn-review">Check answers</button>
      <button class="btn" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-destreza">← Back</button>
    </div>
  `;

  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  let reviewHtml = `<div class="page-header"><h1 class="page-title">Review</h1></div><button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return</button><div style="display:flex;flex-direction:column;gap:1rem">`;
  
  exercise.extracts.forEach(ext => {
    ext.questions.forEach(q => {
      const sel = answers[q.id];
      const ok = sel === q.answer;
      reviewHtml += `
        <div class="card" style="border-left: 4px solid ${ok ? '#22c55e' : '#ef4444'}">
          <p style="font-weight:bold">${q.question}</p>
          <p><strong>Your answer:</strong> ${sel !== -1 && sel !== undefined ? q.options[sel] : '<em>Not answered</em>'}</p>
          <p><strong>Correct:</strong> <span style="color:#22c55e;font-weight:600">${q.options[q.answer]}</span></p>
          <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem;font-size:0.9rem;">
            <strong>Explanation:</strong> ${q.explanation}
          </p>
        </div>`;
    });
  });

  c.innerHTML = reviewHtml + '</div>';
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz(exercises));
}