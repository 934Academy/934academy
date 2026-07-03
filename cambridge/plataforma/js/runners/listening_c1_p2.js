import { saveResult } from '../auth.js';

let exercise = null;
let answers = {};
let _skill = '';
let _part = '';

export function initListeningC1Part2(exercises, skill, part) {
  exercise = null; answers = {}; _skill = skill; _part = part;
  renderSelector(exercises);
}

function renderSelector(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 2 — Sentence Completion</h1>
      <p class="page-subtitle">${exercises.length} exercises available</p>
    </div>
    <div class="skill-grid">
      ${exercises.map((ex, i) => `
        <div class="skill-card" data-i="${i}" style="cursor:pointer">
          <div class="skill-icon">🎧</div><div class="skill-name">${ex.title}</div><div class="skill-arrow">Start →</div>
        </div>`).join('')}
    </div>`;
  c.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => { exercise = exercises[parseInt(card.dataset.i)]; answers = {}; renderExercise(exercises); });
  });
}

function renderExercise(exercises) {
  const c = document.getElementById('ejercicio-content');
  c.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Part 2 — ${exercise.title}</h1>
      <p class="page-subtitle">${exercise.description}</p>
    </div>
    <div style="background: var(--color-surface); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center; border: 1px solid var(--color-border);">
       <audio controls style="width: 100%; max-width: 400px;"><source src="${exercise.audio}" type="audio/mpeg"></audio>
    </div>
    <div class="card" style="margin-bottom:1.5rem; font-size: 1.05rem; line-height: 2;">
      <ul style="list-style:none; padding:0; margin:0;">
        ${exercise.questions.map((q, i) => `
          <li style="margin-bottom: 1.25rem;">
            <strong>${i + 7}.</strong> ${q.pre} 
            <input type="text" id="q_${q.id}" value="${answers[q.id] || ''}" style="width: 150px; padding: 4px 8px; border: 2px solid var(--color-primary); border-radius: 4px; background: var(--color-background); color: var(--color-text); font-weight: bold; text-align: center;">
            ${q.post}
          </li>
        `).join('')}
      </ul>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn" id="btn-sel">← Selector</button>
      <button class="btn btn-primary" id="btn-check">Check Answers</button>
    </div>`;

  document.getElementById('btn-sel').addEventListener('click', () => renderSelector(exercises));
  document.getElementById('btn-check').addEventListener('click', () => {
    exercise.questions.forEach(q => { answers[q.id] = document.getElementById(`q_${q.id}`).value.trim().toLowerCase(); });
    finishQuiz(exercises);
  });
}

async function finishQuiz(exercises) {
  let correct = 0;
  exercise.questions.forEach(q => { if (answers[q.id] === q.answer.toLowerCase()) correct++; });
  const total = exercise.questions.length;
  const pct = Math.round((correct / total) * 100);
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';

  try { await saveResult({ exam: _skill, part: parseInt(_part.replace('part', '')), exerciseId: exercise.title, score: pct }); } catch(e) {}

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
    </div>`;

  document.getElementById('btn-review').addEventListener('click', () => showReview(exercises));
  document.getElementById('btn-repeat').addEventListener('click', () => { answers = {}; renderExercise(exercises); });
  document.getElementById('btn-destreza').addEventListener('click', () => window.navigate('destreza', { skill: _skill }));
}

function showReview(exercises) {
  const c = document.getElementById('ejercicio-content');
  let reviewHtml = `<div class="page-header"><h1 class="page-title">Review</h1></div><button class="btn" id="btn-back" style="margin-bottom:1.5rem">← Return</button><div style="display:flex;flex-direction:column;gap:1rem">`;
  
  exercise.questions.forEach((q, i) => {
    const sel = answers[q.id];
    const ok = sel === q.answer.toLowerCase();
    reviewHtml += `
      <div class="card" style="border-left: 4px solid ${ok ? '#22c55e' : '#ef4444'}">
        <p style="font-weight:bold">Question ${i + 7}</p>
        <p><strong>Your answer:</strong> ${sel ? sel : '<em>Not answered</em>'}</p>
        <p><strong>Correct answer:</strong> <span style="color:#22c55e;font-weight:600">${q.answer}</span></p>
        <p style="border-top:1px solid var(--color-border);padding-top:.75rem;margin-top:.75rem;font-size:0.9rem;">
          <strong>Explanation:</strong> ${q.explanation}
        </p>
      </div>`;
  });

  c.innerHTML = reviewHtml + '</div>';
  document.getElementById('btn-back').addEventListener('click', () => finishQuiz(exercises));
}