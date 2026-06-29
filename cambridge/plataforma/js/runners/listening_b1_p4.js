import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningB1Part4(exercises, skill, part) {
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
  const mainAudio = exercise.audio || (exercise.questions[0] && exercise.questions[0].audio);

  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${getPartLabel()} — ${exercise.title}</h1>
      <p class="page-subtitle">Listen carefully and choose the correct answer.</p>
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

    div.innerHTML = `
      <div class="card-title">Question ${i + 20}</div>
      ${q.context ? `<p style="font-style: italic; color: var(--color-text-muted); margin-bottom: 0.5rem;">${q.context}</p>` : ''}
      <p style="font-weight: 600; margin-bottom: 1rem;">${q.question}</p>

      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        ${q.options.map((opt, j) => `
          <label style="cursor:pointer; display:block; padding: 0.75rem 1rem; border: 2px solid ${answers[q.id] === j ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius: 8px; background: ${answers[q.id] === j ? '#f0f9ff' : '#fff'}; transition: all 0.2s;" data-q="${q.id}" data-j="${j}">
            <div style="display:flex; align-items:center;">
              <span style="font-weight:bold; margin-right:12px; color: ${answers[q.id] === j ? 'var(--color-primary)' : 'inherit'};">${String.fromCharCode(65 + j)}</span>
              <span>${opt}</span>
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

      c.querySelectorAll(`label[data-q="${qId}"]`).forEach((el, idx) => {
        const isSelected = idx === j;
        el.style.borderColor = isSelected ? 'var(--color-primary)' : 'var(--color-border)';
        el.style.background = isSelected ? '#f0f9ff' : '#fff';
        el.querySelector('span').style.color = isSelected ? 'var(--color-primary)' : 'inherit';
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
    const uAns = answers[q.id] !== undefined ? Number(answers[q.id]) : -1;
    const cAns = Number(q.answer);
    if (uAns === cAns) correct++;
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

  exercise.questions.forEach((q, i) => {
    const uAns = answers[q.id] !== undefined ? Number(answers[q.id]) : -1;
    const cAns = Number(q.answer);
    const isCorrect = (uAns === cAns);
    const statusColor = isCorrect ? '#22c55e' : '#ef4444'; 
    
    html += `
      <div class="card" style="border-left: 4px solid ${statusColor}">
        <div class="card-title" style="color: ${statusColor}; display: flex; align-items: center; gap: 0.5rem;">
          Question ${i + 20} <span>${isCorrect ? '✓' : '✗'}</span>
        </div>
        ${q.context ? `<p style="font-style: italic; color: var(--color-text-muted); margin-bottom: 0.5rem;">${q.context}</p>` : ''}
        <p style="font-weight: 600; margin-bottom:1rem">${q.question}</p>
        
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${q.options.map((opt, j) => {
            let borderColor = 'var(--color-border)';
            let bgColor = '#fff';
            let icon = '';
            
            if (j === cAns && j === uAns) {
              borderColor = '#22c55e'; bgColor = '#f0fdf4';
              icon = '<span style="color:#22c55e; font-weight:bold; margin-left:auto">✓ Correct (Your Answer)</span>';
            } else if (j === cAns) {
              borderColor = '#22c55e'; bgColor = '#f0fdf4';
              icon = '<span style="color:#22c55e; font-weight:bold; margin-left:auto">✓ Correct Answer</span>';
            } else if (j === uAns) {
              borderColor = '#ef4444'; bgColor = '#fef2f2';
              icon = '<span style="color:#ef4444; font-weight:bold; margin-left:auto">✗ Your Answer</span>';
            }
            
            return `
              <div style="display:flex; align-items:center; padding: 0.75rem 1rem; border: 2px solid ${borderColor}; border-radius: 8px; background: ${bgColor};">
                <span style="font-weight:bold; margin-right:12px; color: ${borderColor !== 'var(--color-border)' ? borderColor : 'inherit'};">${String.fromCharCode(65 + j)}</span>
                <span>${opt}</span>
                ${icon}
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