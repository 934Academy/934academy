import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB1Part1(exercises, skill, part) {
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
  
  // Extraemos el audio a nivel general (ya sea del objeto padre o de la primera pregunta)
  const mainAudio = exercise.audio || (exercise.questions[0] && exercise.questions[0].audio);

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${getPartLabel()} — ${exercise.title}</h1>
      <p class="page-subtitle">Listen carefully and choose the correct image</p>
    </div>

    ${mainAudio ? `
      <div class="card" style="margin-bottom: 1.5rem; position: sticky; top: 1rem; z-index: 10; border-left: 4px solid var(--color-primary); background: #fff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <p style="margin-bottom: 0.5rem; font-weight: 600;">Audio Track</p>
        <audio controls src="${mainAudio}" style="width:100%; border-radius:8px">
          Your browser does not support audio.
        </audio>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:1.5rem" id="questions-list"></div>
    <div style="display:flex;gap:1rem;margin-top:1.5rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>
  `;

  const list = document.getElementById('questions-list');

  exercise.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'card';

    // Generamos las opciones sin el audio individual
    div.innerHTML = `
      <div class="card-title">Question ${i + 1}</div>
      <p style="margin-bottom:.75rem">${q.question}</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem">
        ${q.images.map((img, j) => `
          <label style="cursor:pointer;text-align:center" data-q="${q.id}" data-j="${j}">
            <div class="img-option" style="border:3px solid ${answers[q.id] === j ? 'var(--color-primary)' : 'var(--color-border)'};border-radius:10px;overflow:hidden;padding:.25rem">
              <img src="${img}" alt="Option ${String.fromCharCode(65 + j)}" style="width:100%;border-radius:7px;display:block" />
              <p style="margin:.4rem 0 0;font-weight:600">${String.fromCharCode(65 + j)}</p>
            </div>
            <input type="radio" name="q_${q.id}" value="${j}" ${answers[q.id] === j ? 'checked' : ''} style="display:none" />
          </label>
        `).join('')}
      </div>
    `;

    list.appendChild(div);
  });

  c.querySelectorAll('label[data-q]').forEach(label => {
    label.addEventListener('click', () => {
      const qId = label.dataset.q;
      const j = parseInt(label.dataset.j, 10);
      answers[qId] = j;

      c.querySelectorAll(`label[data-q="${qId}"] .img-option`).forEach((el, idx) => {
        el.style.borderColor = idx === j ? 'var(--color-primary)' : 'var(--color-border)';
      });

      const radio = label.querySelector('input[type=radio]');
      if (radio) radio.checked = true;
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
  
  // 1. Construimos la cabecera y estadísticas
  let html = `
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
    
    <div style="display:flex;flex-direction:column;gap:1.5rem;margin-top:2rem">
  `;

  // 2. Construimos la revisión de las respuestas
  exercise.questions.forEach((q, i) => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.answer;
    const statusColor = isCorrect ? '#22c55e' : '#ef4444'; 
    
    html += `
      <div class="card" style="border-left: 4px solid ${statusColor}">
        <div class="card-title" style="color: ${statusColor}; display: flex; align-items: center; gap: 0.5rem;">
          Question ${i + 1} <span>${isCorrect ? '✓' : '✗'}</span>
        </div>
        <p style="margin-bottom:.75rem">${q.question}</p>
        
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem">
          ${q.images.map((img, j) => {
            let borderColor = 'var(--color-border)';
            let badge = '';
            let opacity = '0.5'; 
            
            if (j === q.answer) {
              borderColor = '#22c55e'; // Correcta (Verde)
              badge = '<div style="color:#22c55e;font-size:0.8rem;font-weight:bold;margin-top:0.4rem">✓ Correct Answer</div>';
              opacity = '1';
            } else if (j === userAnswer) {
              borderColor = '#ef4444'; // Fallada por el usuario (Rojo)
              badge = '<div style="color:#ef4444;font-size:0.8rem;font-weight:bold;margin-top:0.4rem">✗ Your Answer</div>';
              opacity = '1';
            }
            
            return `
              <div style="text-align:center; opacity: ${opacity}; transition: opacity 0.2s;">
                <div class="img-option" style="border:3px solid ${borderColor};border-radius:10px;overflow:hidden;padding:.25rem;background:#fff">
                  <img src="${img}" alt="Option ${String.fromCharCode(65 + j)}" style="width:100%;border-radius:7px;display:block" />
                  <p style="margin:.4rem 0 0;font-weight:600;color:${borderColor}">${String.fromCharCode(65 + j)}</p>
                </div>
                ${badge}
              </div>
            `;
          }).join('')}
        </div>
        
        ${q.explanation ? `
          <div style="margin-top: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px; font-size: 0.95rem; border: 1px solid var(--color-border);">
            <strong style="color: var(--color-text);">Explanation:</strong> 
            <span style="color: var(--color-text-muted);">${q.explanation}</span>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`; 

  // 3. Añadimos los botones de acción al final
  html += `
    <div style="display:flex;gap:1rem;margin-top:2rem;flex-wrap:wrap">
      <button class="btn btn-primary" id="btn-repeat">Repeat</button>
      <button class="btn" id="btn-sel">Choose Another</button>
      <button class="btn" id="btn-back">← Listening</button>
    </div>
  `;

  // 4. Inyectamos todo en el DOM
  c.innerHTML = html;

  // 5. Asignamos los eventos a los botones
  document.getElementById('btn-repeat').addEventListener('click', () => { 
    answers = {}; 
    renderExercise(exercises); 
  });
  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-back').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}