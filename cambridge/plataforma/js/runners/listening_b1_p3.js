import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB1Part3(exercises, skill, part) {
  exercise = null;
  answers = {};
  _skill = skill;
  _part = part;
  renderSelector(exercises);
}

function getPartLabel() {
  const n = parseInt(String(_part).replace('part', ''), 10);
  return Number.isFinite(n) ? `Part ${n}` : 'Listening';
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${getPartLabel()} — Listening</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}">
          <div class="skill-icon">🎧</div>
          <div class="skill-name">${ex.title}</div>
          <div class="skill-desc">${ex.text_preview ? ex.text_preview.substring(0, 80) : ''}...</div>
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
  const mainAudio = exercise.audio;

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${getPartLabel()} — ${exercise.title}</h1>
      <p class="page-subtitle">${exercise.context}</p>
    </div>

    ${mainAudio ? `
      <div class="card" style="margin-bottom: 1.5rem; position: sticky; top: 1rem; z-index: 10; border-left: 4px solid var(--color-primary); background: #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <p style="margin-bottom: 0.5rem; font-weight: 600;">Audio Track</p>
        <audio controls src="${mainAudio}" style="width:100%; border-radius:8px">
          Your browser does not support audio.
        </audio>
      </div>
    ` : ''}

    <div class="card">
      <div style="display:flex;flex-direction:column;gap:1.5rem" id="questions-list"></div>
    </div>
    
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>
  `;

  const list = document.getElementById('questions-list');

  exercise.questions.forEach((q) => {
    const div = document.createElement('div');
    // Generamos la frase con un <input> de texto en el medio
    div.innerHTML = `
      <div style="font-size: 1.1rem; line-height: 1.8;">
        <span style="font-weight: bold; margin-right: 10px; color: var(--color-primary);">${q.num}</span>
        <span>${q.text_before}</span>
        <input type="text" id="input_${q.id}" class="input" style="width: 150px; display: inline-block; margin: 0 8px; text-align: center; font-weight: bold; padding: 4px 8px; border: 2px solid var(--color-border); border-radius: 6px;" autocomplete="off" autocorrect="off" spellcheck="false" />
        <span>${q.text_after}</span>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  
  document.getElementById('btn-check').addEventListener('click', () => {
    // Al hacer clic en corregir, guardamos lo que el alumno escribió
    exercise.questions.forEach(q => {
      const inputEl = document.getElementById(`input_${q.id}`);
      answers[q.id] = inputEl ? inputEl.value.trim() : '';
    });
    finishQuiz(exercises);
  });
}

async function finishQuiz(exercises) {
  let correct = 0;

  // Lógica de validación (compara el texto en minúsculas)
  exercise.questions.forEach(q => {
    const uAns = (answers[q.id] || '').toLowerCase();
    const validAnswers = q.answers.map(a => a.toLowerCase());
    
    if (validAnswers.includes(uAns)) {
      correct++;
    }
  });

  const total = exercise.questions.length;
  const pct = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try {
    await saveResult({ exam: _skill, part: parseInt(String(_part).replace('part', ''), 10), exerciseId: exercise.title, score: pct });
  } catch (e) {
    console.warn('Error guardando resultado:', e);
  }

  const c = document.getElementById('ejercicio-content');
  
  let html = `
    <div class="page-header">
      <h1 class="page-title">Results — ${exercise.title}</h1>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-label">Correct</div><div class="stat-value">${correct} / ${total}</div></div>
      <div class="stat-card"><div class="stat-label">Score</div><div class="stat-value" style="color:${color}">${pct}%</div></div>
    </div>
    
    <div style="display:flex;flex-direction:column;gap:1.5rem;margin-top:2rem">
  `;

  // Renderizamos las correcciones
  exercise.questions.forEach((q) => {
    const uAns = (answers[q.id] || '').toLowerCase();
    const validAnswers = q.answers.map(a => a.toLowerCase());
    const isCorrect = validAnswers.includes(uAns);
    const statusColor = isCorrect ? '#22c55e' : '#ef4444'; 
    const displayUserAnswer = answers[q.id] || '(empty)';
    
    html += `
      <div class="card" style="border-left: 4px solid ${statusColor}">
        <div class="card-title" style="color: ${statusColor}; display: flex; align-items: center; gap: 0.5rem;">
          Question ${q.num} <span>${isCorrect ? '✓' : '✗'}</span>
        </div>
        
        <div style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1rem;">
          <span>${q.text_before}</span>
          <span style="display: inline-block; padding: 2px 10px; margin: 0 8px; font-weight: bold; color: ${isCorrect ? '#15803d' : '#b91c1c'}; background: ${isCorrect ? '#dcfce7' : '#fee2e2'}; border-radius: 4px; text-decoration: ${isCorrect ? 'none' : 'line-through'};">${displayUserAnswer}</span>
          <span>${q.text_after}</span>
        </div>
        
        ${!isCorrect ? `
          <div style="margin-bottom: 1rem; color: #15803d; font-weight: 600;">
            ✓ Correct answer: <span style="background: #dcfce7; padding: 2px 8px; border-radius: 4px;">${q.answers[0]}</span>
          </div>
        ` : ''}
        
        ${q.explanation ? `
          <div style="padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.95rem; border: 1px solid var(--color-border);">
            <strong style="color: var(--color-text);">Explanation:</strong> 
            <span style="color: var(--color-text-muted);">${q.explanation}</span>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>
    <div style="display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap">
      <button class="btn btn-primary" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-back">← Listening</button>
    </div>
  `;
  c.innerHTML = html;

  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-back').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}